import React, { useState } from "react";
import { Link, Routes, Route, useRoutes } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AdminDashboard from "./AdminDashboard";
import UserManagement from "./AdminUserManager";
import EventManagement from "./AdminEventManager";
import Settings from "./AdminSettings";
import "./AdminPage.css"; // ��Ÿ�� ����


const AdminPage = () => {
    // ��ø ���Ʈ ����
    const routes = useRoutes([
        { path: "/", element: <AdminDashboard /> },
        { path: "users", element: <UserManagement /> },
        { path: "events", element: <EventManagement /> },
        { path: "settings", element: <Settings /> },
    ]);

    return (
        <div className="admin-container">
            {/* ���� �޴� */}
            <nav className="admin-sidebar">
                <h2>Admin Panel</h2>
                <ul>
                    <li><Link to="/admin">Dashboard</Link></li>
                    <li><Link to="/admin/users">User Management</Link></li>
                    <li><Link to="/admin/events">Event Management</Link></li>
                    <li><Link to="/admin/settings">Settings</Link></li>
                </ul>
            </nav>

            {/* ������ ������ */}
            <div className="admin-content">
                {routes}
            </div>
        </div>
    );
};

export default AdminPage;