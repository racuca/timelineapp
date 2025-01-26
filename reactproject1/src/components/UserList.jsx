import React, { useState } from "react";
import axios from "axios";

const UserList = ({ serverurl, users, setUsers }) => {
    const [name, setName] = useState("");
    const [passwd, setPasswd] = useState("");
    const [email, setEmail] = useState("");

    const handleAddUser = () => {
        const newUser = { name, passwd, email };
        axios.post(serverurl + "/users", newUser).then((response) => {
            setUsers([...users, response.data]);
            setName("");
            setPasswd("");
            setEmail("");
        }).catch((error) => {
            console.error("Error adding user:", error);
        });;
    };

    return (
        <div>
            <h2>User List</h2>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.name} - {user.email}</li>
                ))}
            </ul>
            <h2>Add User</h2>
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="password"
                placeholder=""
                value={passwd}
                onChange={(e) => setPasswd(e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleAddUser}>Add User</button>
        </div>
    );
};

export default UserList;