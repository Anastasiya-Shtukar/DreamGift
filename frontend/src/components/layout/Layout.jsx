import { Outlet, NavLink } from "react-router";
import { useAuth } from "../../context/AuthContext.jsx";
import LogoutButton from "../LogoutButton.jsx";

function Layout() {
  const { isAuthenticated, isLoading, isError } = useAuth();

  const getNavLinkClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <>
      <header>
        <nav>
          <NavLink to="/" end className={getNavLinkClass}>
            DreamGift
          </NavLink>

          {!isLoading && !isError && (
            <>
              {isAuthenticated ? (
                <>
                  <NavLink to="/events" className={getNavLinkClass}>
                    Events
                  </NavLink>

                  <NavLink to="/wishlist" className={getNavLinkClass}>
                    Wishlist
                  </NavLink>

                  <LogoutButton />
                </>
              ) : (
                <>
                  <NavLink to="/login" className={getNavLinkClass}>
                    Login
                  </NavLink>

                  <NavLink to="/register" className={getNavLinkClass}>
                    Register
                  </NavLink>
                </>
              )}
            </>
          )}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
