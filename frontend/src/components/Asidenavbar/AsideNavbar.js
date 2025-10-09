import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./AsideNavbar.css";
import swal from "sweetalert";

// Icons
import StoreIcon from "@mui/icons-material/Store";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import Menu from "@mui/icons-material/Menu";
import ReceiptIcon from "@mui/icons-material/Receipt"; // Added for Expenses

function AsideNavbar() {
  const [userRole, setUserRole] = useState("");
  const [toggle, setToggle] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user")) || {};
    if (userData.role) {
      setUserRole(userData.role);
    }
  }, []);

  const logout = () => {
    swal({
      title: "Confirm Logout",
      text: "Do you really want to logout?",
      icon: "warning",
      buttons: ["Cancel", "Logout"],
      dangerMode: true,
    }).then(async (willLogout) => {
      if (willLogout) {
        let result = await fetch(
          "https://invenio-api-production.up.railway.app/api/logout",
          {
            method: "GET",
            credentials: "include",
          }
        );
        let body = await result.json();
        if (body.operation === "success") {
          window.location.href = "/login";
        }
      }
    });
  };

  const renderAdminLinks = () => (
    <>
      <p className="title">Overview</p>
      <Link to="/dashboard" className="nav-link">
        <li>
          <DashboardIcon className="icon" />
          <span>Dashboard</span>
        </li>
      </Link>

      <p className="title">Management</p>
      <Link to="/employees" className="nav-link">
        <li>
          <PersonOutlineIcon className="icon" />
          <span>Employees</span>
        </li>
      </Link>
      <Link to="/products" className="nav-link">
        <li>
          <StoreIcon className="icon" />
          <span>Products</span>
        </li>
      </Link>

      <p className="title">Purchase</p>
      <Link to="/suppliers" className="nav-link">
        <li>
          <LocalMallIcon className="icon" />
          <span>Suppliers</span>
        </li>
      </Link>
      <Link to="/goodsReceive" className="nav-link">
        <li>
          <Inventory2Icon className="icon" />
          <span>Stock In</span>
        </li>
      </Link>

      <p className="title">Sales</p>
      <Link to="/stockout" className="nav-link">
        <li>
          <LocalMallIcon className="icon" />
          <span>Stock Out</span>
        </li>
      </Link>

      <p className="title">Finance</p>
      <Link to="/expenses" className="nav-link">
        <li>
          <ReceiptIcon className="icon" />
          <span>Expenses</span>
        </li>
      </Link>

      <p className="title">User</p>
      <li className="logout" onClick={logout}>
        <ExitToAppIcon className="icon" />
        <span>Logout</span>
      </li>
    </>
  );

  const renderEmployeeLinks = () => (
    <>
      <p className="title">Products</p>
      <Link to="/products" className="nav-link">
        <li>
          <StoreIcon className="icon" />
          <span>Products</span>
        </li>
      </Link>

      <p className="title">Purchase</p>
      <Link to="/suppliers" className="nav-link">
        <li>
          <LocalMallIcon className="icon" />
          <span>Suppliers</span>
        </li>
      </Link>
      <Link to="/goodsReceive" className="nav-link">
        <li>
          <Inventory2Icon className="icon" />
          <span>Stock In</span>
        </li>
      </Link>

      <p className="title">Sales</p>
      <Link to="/stockout" className="nav-link">
        <li>
          <LocalMallIcon className="icon" />
          <span>Stock Out</span>
        </li>
      </Link>

      <p className="title">Finance</p>
      <Link to="/expenses" className="nav-link">
        <li>
          <ReceiptIcon className="icon" />
          <span>Expenses</span>
        </li>
      </Link>

      <p className="title">User</p>
      <li className="logout" onClick={logout}>
        <ExitToAppIcon className="icon" />
        <span>Logout</span>
      </li>
    </>
  );

  return (
    <div className="asideNavbar">
      <div className="asideNavbar__panel">
        <div className="top">
          <span className="logo">
            {userRole === "Admin" ? "✨ Admin Portal" : "👤 Employee Portal"}
          </span>
        </div>
        <div className="center">
          <ul>{userRole === "Admin" ? renderAdminLinks() : renderEmployeeLinks()}</ul>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`asideNavbar__menu ${toggle ? "open" : ""}`}>
        <div className="top">
          <div className="toggleDiv">
            <CloseOutlined onClick={() => setToggle(false)} />
          </div>
        </div>
        <div className="center">
          <ul>{userRole === "Admin" ? renderAdminLinks() : renderEmployeeLinks()}</ul>
        </div>
      </div>

      {/* Menu Toggle Button */}
      <div className="menu-toggle">
        <Menu onClick={() => setToggle(true)} />
      </div>
    </div>
  );
}

export default AsideNavbar;