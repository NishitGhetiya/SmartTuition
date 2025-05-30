import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure want to Log out?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("role"); // Remove role as well
      navigate("/Login"); // Redirect to Login page
    }
  };

  const handleProfile = () => {
    navigate("/Student/profile");
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
          <Link to="/Student" className="navbar-brand text-success">
            Smart Tuition
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link
                  to="/Student"
                  className="nav-link active"
                  aria-current="page"
                >
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/Student/class"
                  className="nav-link active"
                  aria-current="page"
                >
                  Class
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/Student/attendance"
                  className="nav-link active"
                  aria-current="page"
                >
                  Attendance
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  to="/Student/homework"
                  className="nav-link active"
                  aria-current="page"
                >
                  Homework
                </Link>
              </li>
            </ul>

            <div className="dropdown ms-auto">
              <button
                className="btn"
                type="button"
                id="profileDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="navbar-toggler-icon"></i>
              </button>
              <ul
                className="dropdown-menu dropdown-menu-end"
                aria-labelledby="profileDropdown"
              >
                <li>
                  <button className="dropdown-item" onClick={handleProfile}>
                    <i className="bi bi-person-circle"></i> Profile
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right"></i> Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
