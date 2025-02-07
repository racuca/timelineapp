import React from "react";
import { useState } from "react";
import axios from "axios";


const UserManagement = ({ serverurl }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);


    const handleSearch = () => {
        const query = serverurl + "/admin/users?search=" + `${searchTerm}`;
        axios.get(query)
            .then((response) => {                
                setFilteredUsers(response.data)
            })
            .catch(error => {
                console.error("Error fetching dashboard stats:", error);
            });
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">User Management</h2>
            <div className="flex gap-2 mb-4">
                <input
                    placeholder="Search by name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onInput={(e) => setSearchTerm(e.target.value)}
                />
                <button onClick={handleSearch}>Search</button>
            </div>
            {/* 최근 추가된 이벤트 목록 */}
            <div className="recent-events">
                <h2>최근 추가된 이벤트</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>이름</th>
                            <th>email</th>
                            <th>등급</th>
                            <th>가입날짜</th>
                            <th>마케팅동의여부</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(event => (
                            <tr key={event.id}>
                                <td>{event.id}</td>
                                <td>{event.name}</td>
                                <td>{event.email}</td>
                                <td>{event.usergrade}</td>
                                <td>{event.signupdt}</td>
                                <td>{event.agreemarketing}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;