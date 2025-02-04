import React, { useState } from "react";
import axios from "axios";

const UserList = ({ serverurl, users, setUsers }) => {
    const [name, setName] = useState("");
    const [passwd, setPasswd] = useState("");
    const [email, setEmail] = useState("");
    const [loggedInUser, setLoggedInUser] = useState(null); // 로그인한 사용자 정보
    const [showProfile, setShowProfile] = useState(false); // 프로필 화면 토글

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

    // 로그인 처리
    const handleLogin = () => {
        axios.post(serverurl + "/login", { email, passwd })
            .then((response) => {
                setLoggedInUser(response.data); // 로그인 정보 저장
            })
            .catch((error) => {
                console.error("Login failed:", error);
            });
    };

    // 로그아웃 처리
    const handleLogout = () => {
        setLoggedInUser(null);
        setShowProfile(false);
    };

    return (
        <div style={{ padding: "20px", position: "relative" }}>
            {/* 상단 네비게이션 */}
            <div style={{ position: "absolute", top: "10px", right: "10px" }}>
                {loggedInUser ? (
                    <div>
                        <span
                            style={{ cursor: "pointer", fontWeight: "bold" }}
                            onClick={() => setShowProfile(!showProfile)}
                        >
                            {loggedInUser.name}
                        </span>
                        {showProfile && (
                            <div style={{
                                position: "absolute",
                                right: 0,
                                background: "#fff",
                                padding: "10px",
                                border: "1px solid #ccc",
                                borderRadius: "5px",
                            }}>
                                <p>Name: {loggedInUser.name}</p>
                                <p>Email: {loggedInUser.email}</p>
                                <button onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <h2>Login</h2>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={passwd}
                            onChange={(e) => setPasswd(e.target.value)}
                        />
                        <button onClick={handleLogin}>Login</button>
                    </div>
                )}
            </div>

            {/* 유저 목록 */}
            <h2>User List</h2>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.name} - {user.email}</li>
                ))}
            </ul>

            {/* 사용자 추가 
            <h2>Add User</h2>
            <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
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
            */}
        </div>
    );
};

export default UserList;