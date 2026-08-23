import { Link, Outlet } from "react-router-dom";
import "./layout.css";

export const Layout = () => {
  return (
    <>
      <header className="app-header">
        <div className="app-header__inner">
          <h2 className="app-header__title">Kanban</h2>
          <nav className="app-header__nav">
            <Link to="/" className="app-header__link">
              Board list
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <Outlet></Outlet>
      </main>
    </>
  );
};
