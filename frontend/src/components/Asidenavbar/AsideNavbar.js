import React, { useEffect, useState, useContext } from 'react';
import { Link } from "react-router-dom";
import "./AsideNavbar.scss";
import swal from 'sweetalert';
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import StoreIcon from "@mui/icons-material/Store";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import Menu from "@mui/icons-material/Menu";
import SettingsSystemDaydreamOutlinedIcon from "@mui/icons-material/Menu";

function AsideNavbar() {
    const [permission, setPermission] = useState([]);
    const [toggel, setToggel] = useState(false);

    const logout = () => {
        swal({
            title: "Are you sure?",
            text: "Are you sure, you want to logout!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then(async (willDelete) => {
                if (willDelete) {
                    let result = await fetch('http://localhost:5000/api/logout', {
                        method: 'GET',
                        credentials: 'include'
                    });
                    let body = await result.json();
                    if (body.operation === 'success') {
                        window.location.href = '/login';
                    }
                }
            });
    }

    return (
        <div className={`asideNavbar`}>
            <div className="asideNavbar__panel">
                <div className="top border-bottom">
                    <Link to="/" style={{ textDecoration: "none" }}>
                        {permission.length > 0 && permission.find(x => x.page === 'employees').view === true ?
                            <span className="logo">Admin</span> :
                            <span className="logo">Employee</span>
                        }
                    </Link>
                </div>
                <div className="center">
                    <ul>
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
                        
                        {/*
                        <Link to="/expenses" style={{ textDecoration: "none" }}>
                            <li>
                                <NotificationsNoneIcon className="icon" />
                                <span>Expenses</span>
                            </li>
                        </Link>*/}

                        <p className="title">SELLS</p>
                        <Link to="/stockout" style={{ textDecoration: "none" }}>
                            <li>
                                <SettingsSystemDaydreamOutlinedIcon className="icon" />
                                <span>Stock Out</span>
                            </li>
                        </Link>
                        {/*
                        <Link to="/orders" style={{ textDecoration: "none" }}>
                            <li>
                                <PsychologyOutlinedIcon className="icon" />
                                <span>Orders</span>
                            </li>
                        </Link>*/}

                        <p className="title">USER</p>
                        {/*<Link to="/profile" style={{ textDecoration: "none" }}>
                            <li>
                                <AccountCircleOutlinedIcon className="icon" />
                                <span>Profile</span>
                            </li>
                        </Link>*/}
                       {/* <Link to="/settings" style={{ textDecoration: "none" }}>
                            <li>
                                <SettingsApplicationsIcon className="icon" />
                                <span>Settings</span>
                            </li>
                        </Link>*/}
                        <li onClick={() => { logout() }}>
                            <ExitToAppIcon className="icon" />
                            <span>Logout</span>
                        </li>
                    </ul>
                </div>

            </div>

            <div className='asideNavbar__menu' style={toggel ? { left: "0px" } : {}}>
                <div className="top">
                    <div className='toggelDiv'><CloseOutlined onClick={() => setToggel(false)} /></div>
                </div>
                <div className="center">
                    <ul>
                        <>
                            <p className="title">MAIN</p>
                            <Link to="/dashboard" style={{ textDecoration: "none" }}>
                                <li>
                                    <DashboardIcon className="icon" />
                                    <span>Dashboard</span>
                                </li>
                            </Link>
                        </>

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
                        <Link to="/expenses" style={{ textDecoration: "none" }}>
                            <li>
                                <NotificationsNoneIcon className="icon" />
                                <span>Expenses</span>
                            </li>
                        </Link>

                        {/*<p className="title">SELLS</p>
                        <Link to="/customers" style={{ textDecoration: "none" }}>
                            <li>
                                <SettingsSystemDaydreamOutlinedIcon className="icon" />
                                <span>Customers</span>
                            </li>
                        </Link>
                        <Link to="/orders" style={{ textDecoration: "none" }}>
                            <li>
                                <PsychologyOutlinedIcon className="icon" />
                                <span>Orders</span>
                            </li>
                        </Link>*/}

                        <p className="title">USER</p>
                        <Link to="/profile" style={{ textDecoration: "none" }}>
                            <li>
                                <AccountCircleOutlinedIcon className="icon" />
                                <span>Profile</span>
                            </li>
                        </Link>
                        <Link to="/settings" style={{ textDecoration: "none" }}>
                            <li>
                                <SettingsApplicationsIcon className="icon" />
                                <span>Settings</span>
                            </li>
                        </Link>
                        <li onClick={() => { logout() }}>
                            <ExitToAppIcon className="icon" />
                            <span>Logout</span>
                        </li>
                    </ul>
                </div>

            </div>
        </div>
    );
}

export default AsideNavbar;