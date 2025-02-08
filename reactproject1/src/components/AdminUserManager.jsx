import React from "react";
import { useState } from "react";
import axios from "axios";


const UserManagement = ({ serverurl }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editUserGrade, setEditUserGrade] = useState(0); 
    const [editAgreeMarketing, setEditAgreeMarketing] = useState(0);


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

    const handleEdit = (user) => {
        setEditingUser(user.id);
        setEditName(user.name);
        setEditEmail(user.email);
        setEditUserGrade(user.usergrade);
        setEditAgreeMarketing(user.agreemarketing);
    };

    const handleSave = (id) => {
        const edituser = { name: editName, email: editEmail, usergrade: editUserGrade, agreemarketing: editAgreeMarketing }
        axios.post(serverurl + "/admin/users/edit/" + id, edituser)
        .then((response) => {
            setEditingUser(null);       
        }).catch((error) => {
            console.error("Error updating user:", error);
        });;
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
                            <th>수정</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(event => (
                            <tr key={event.id}>
                                <td>{event.id}</td>
                                <td>{editingUser == event.id ? (
                                    <input value={editName} onChange={(e) => setEditName(e.target.value)} className="border p-1 w-auto min-w-[100px]" />
                                ): (event.name) }</td>
                                <td>{editingUser == event.id ? (
                                    <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="border p-1 w-auto min-w-[100px]" />
                                ): (event.email) }</td>
                                <td>{editingUser == event.id ? (
                                    <input value={editUserGrade} onChange={(e) => setEditUserGrade(e.target.value)} className="border p-1 w-auto min-w-[100px]" />
                                ): (event.usergrade)}</td>
                                <td>{event.signupdt}</td>
                                <td>{editingUser == event.id ? (
                                    <input value={editAgreeMarketing} onChange={(e) => setEditAgreeMarketing(e.target.value)} className="border p-1 w-auto min-w-[100px]" />
                                ): (event.agreemarketing) }</td>
                                <td>{editingUser == event.id ? (
                                    <button onClick={() => handleSave(event.id)}>Save</button>
                                ) : (
                                    <button onClick={() => handleEdit(event)}>Edit</button>
                                )} </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;