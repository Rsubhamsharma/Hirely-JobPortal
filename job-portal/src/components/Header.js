import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import authService from "../services/auth.service";

const Header = () => {
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const user = authService.getCurrentUser();

    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const logOut = () => {
    authService.logout();
  };

  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark">
      <Link to={"/"} className="navbar-brand">
        Job Portal
      </Link>
      <div className="navbar-nav mr-auto">
        <li className="nav-item">
          <Link to={"/jobs"} className="nav-link">
            Jobs
          </Link>
        </li>

        {currentUser && currentUser.data.user.role === "recruiter" && (
          <li className="nav-item">
            <Link to={"/recruiter"} className="nav-link">
              Recruiter Dashboard
            </Link>
          </li>
        )}

        {currentUser && currentUser.data.user.role === "applicant" && (
          <li className="nav-item">
            <Link to={"/applicant"} className="nav-link">
              Applicant Dashboard
            </Link>
          </li>
        )}
      </div>

      {currentUser ? (
        <div className="navbar-nav ml-auto">
          <li className="nav-item">
            <Link to={"/profile"} className="nav-link">
              {currentUser.data.user.name}
            </Link>
          </li>
          <li className="nav-item">
            <a href="/login" className="nav-link" onClick={logOut}>
              LogOut
            </a>
          </li>
        </div>
      ) : (
        <div className="navbar-nav ml-auto">
          <li className="nav-item">
            <Link to={"/login"} className="nav-link">
              Login
            </Link>
          </li>

          <li className="nav-item">
            <Link to={"/register"} className="nav-link">
              Sign Up
            </Link>
          </li>
        </div>
      )}
    </nav>
  );
};

export default Header;
