import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import "./AsideNavbar.scss";
import swal from 'sweetalert';
import StoreIcon from "@mui/icons-material/Store";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import Menu from "@mui/icons-material/Menu";
import SettingsSystemDaydreamOutlinedIcon from "@mui/icons-material/Menu";

function AsideNavbar() {
    const [userRole, setUserRole] = useState(""); 
    const [toggle, setToggle] = useState(false);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user')) || {}; 
        if (userData.role) {
            setUserRole(userData.role); 
        }
    }, []);

    const logout = () => {
        swal({
            title: "Are you sure?",
            text: "Are you sure you want to logout!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then(async (willDelete) => {
                if (willDelete) {
                    let result = await fetch('https://invenio-api-production.up.railway.app/api/logout', {
                        method: 'GET',
                        credentials: 'include'
                    });
                    let body = await result.json();
                    if (body.operation === 'success') {
                        window.location.href = '/login';
                    }
                }
            });
    };

    const renderAdminLinks = () => (
        <>
            <p className="title">MAIN</p>
            <Link to="/dashboard" style={{ textDecoration: "none" }}>
                <li>
                    <DashboardIcon className="icon" />
                    <span>Dashboard</span>
                </li>
            </Link>

            <p className="title">LISTS</p>
            <Link to="/employees" style={{ textDecoration: "none" }}>
                <li>
                    <PersonOutlineIcon className="icon" />
                    <span>Employees</span>
                </li>
            </Link>
            <Link to="/products" style={{ textDecoration: "none" }}>
                <li>
                    <StoreIcon className="icon" />
                    <span>Products</span>
                </li>
            </Link>

            <p className="title">PURCHASE</p>
            <Link to="/suppliers" style={{ textDecoration: "none" }}>
                <li>
                    <StoreIcon className="icon" />
                    <span>Suppliers</span>
                </li>
            </Link>
            <Link to="/goodsReceive" style={{ textDecoration: "none" }}>
                <li>
                    <StoreIcon className="icon" />
                    <span>Stock In</span>
                </li>
            </Link>

            <p className="title">SELLS</p>
            <Link to="/stockout" style={{ textDecoration: "none" }}>
                <li>
                    <SettingsSystemDaydreamOutlinedIcon className="icon" />
                    <span>Stock Out</span>
                </li>
            </Link>

            <p className="title">USER</p>
            <li onClick={() => { logout() }}>
                <ExitToAppIcon className="icon" />
                <span>Logout</span>
            </li>
        </>
    );

    const renderEmployeeLinks = () => (
        <>
            <p className="title">PRODUCTS</p>
            <Link to="/products" style={{ textDecoration: "none" }}>
                <li>
                    <StoreIcon className="icon" />
                    <span>Products</span>
                </li>
            </Link>

            <p className="title">PURCHASE</p>
            <Link to="/suppliers" style={{ textDecoration: "none" }}>
                <li>
                    <StoreIcon className="icon" />
                    <span>Suppliers</span>
                </li>
            </Link>
            <Link to="/goodsReceive" style={{ textDecoration: "none" }}>
                <li>
                    <StoreIcon className="icon" />
                    <span>Stock In</span>
                </li>
            </Link>

            <p className="title">SELLS</p>
            <Link to="/stockout" style={{ textDecoration: "none" }}>
                <li>
                    <SettingsSystemDaydreamOutlinedIcon className="icon" />
                    <span>Stock Out</span>
                </li>
            </Link>

            <p className="title">USER</p>
            <li onClick={() => { logout() }}>
                <ExitToAppIcon className="icon" />
                <span>Logout</span>
            </li>
        </>
    );

    return (
        <div className={`asideNavbar`}>
            <div className="asideNavbar__panel">
                <div className="top border-bottom">
                    <span className="logo">{userRole === 'Admin' ? 'Admin' : 'Employee'}</span>
                </div>
                <div className="center">
                    <ul>
                        {userRole === 'Admin' ? renderAdminLinks() : renderEmployeeLinks()}
                    </ul>
                </div>
            </div>

            <div className='asideNavbar__menu' style={toggle ? { left: "0px" } : {}}>
                <div className="top">
                    <div className='toggleDiv'>
                        <CloseOutlined onClick={() => setToggle(false)} />
                    </div>
                </div>
                <div className="center">
                    <ul>
                        {userRole === 'Admin' ? renderAdminLinks() : renderEmployeeLinks()}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default AsideNavbar;
