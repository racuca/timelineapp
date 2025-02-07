import React, { useState } from "react";
import { Link, Routes, Route, useRoutes } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AdminDashboard from "./AdminDashboard";
import UserManagement from "./AdminUserManager";
import EventManagement from "./AdminEventManager";
import Settings from "./AdminSettings";
import "./AdminPage.css"; // 스타일 파일


const AdminPage = () => {
    // 중첩 라우트 설정
    const routes = useRoutes([
        { path: "/", element: <AdminDashboard /> },
        { path: "users", element: <UserManagement /> },
        { path: "events", element: <EventManagement /> },
        { path: "settings", element: <Settings /> },
    ]);

    return (
        <div className="admin-container">
            {/* 왼쪽 메뉴 */}
            <nav className="admin-sidebar">
                <h2>Admin Panel</h2>
                <ul>
                    <li><Link to="/admin">Dashboard</Link></li>
                    <li><Link to="/admin/users">User Management</Link></li>
                    <li><Link to="/admin/events">Event Management</Link></li>
                    <li><Link to="/admin/settings">Settings</Link></li>
                </ul>
            </nav>

            {/* 오른쪽 콘텐츠 */}
            <div className="admin-content">
                {routes}
            </div>
        </div>
    );
};

export default AdminPage;