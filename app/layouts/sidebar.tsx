import { useEffect } from "react";
import {
  Form,
  Link,
  NavLink,
  Outlet,
  useNavigation,
  useSubmit,
} from "react-router";
import { getContacts } from "../data";
import type { Route } from "./+types/sidebar";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);

  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);

  return { contacts, q };
}

export default function SidebarLayout({ loaderData }: Route.ComponentProps) {
  const { contacts, q } = loaderData;

  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const isSearching = new URLSearchParams(navigation.location?.search).has("q");
  const shouldShowLoadingOverlay = isLoading && !isSearching;

  const submit = useSubmit();

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q ?? "";
    }
  }, [q]);

  return (
    <>
      <div id="sidebar">
        <h1>
          <Link to="about">React Router Contacts</Link>
        </h1>
        <div>
          <Form
            role="search"
            id="search-form"
            onChange={(event) => {
              const isFirstSearch = q === null;
              submit(event.currentTarget, {
                replace: !isFirstSearch,
              });
            }}
          >
            <input
              type="search"
              name="q"
              id="q"
              defaultValue={q ?? ""}
              className={isSearching ? "loading" : ""}
              placeholder="Search"
              aria-label="Search contacts"
            />
            <div aria-hidden hidden={!isSearching} id="search-spinner" />
          </Form>
          <Form method="POST">
            <button type="submit">New</button>
          </Form>
        </div>
        <nav>
          {contacts.length ? (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <NavLink
                    to={`contacts/${contact.id}`}
                    className={({ isActive, isPending }) =>
                      isActive ? "active" : isPending ? "pending" : ""
                    }
                  >
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}
                    {contact.favorite ? <span>★</span> : null}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No contacts</i>
            </p>
          )}
        </nav>
      </div>
      <div id="detail" className={shouldShowLoadingOverlay ? "loading" : ""}>
        <Outlet />
      </div>
    </>
  );
}
