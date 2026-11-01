import { Outlet, NavLink } from "react-router";

function Layout() {
  return (
    <>
      <header>
        <nav>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            DreamGift
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Login
          </NavLink>
          <NavLink
            to="/register"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Register
          </NavLink>
          <NavLink
            to="/events"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Events
          </NavLink>
          <NavLink
            to="/wishlist"
            end
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Wishlist
          </NavLink>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
