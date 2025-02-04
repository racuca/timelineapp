/*'use strict';
var http = require('http');
var port = process.env.PORT || 1337;

http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
}).listen(port);
*/

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const port = 5001;

// Middleware
app.use(cors());
app.use(express.json());

let users = [];

// MariaDB connection
const db = mysql.createConnection({
    host: "192.168.219.101",
    user: "root", // MariaDB 사용자 이름
    password: "Allusinc4u*", // MariaDB 비밀번호
    database: "linehistory", // MariaDB 데이터베이스 이름
    port: 3307,
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to MariaDB:", err);
        return;
    }
    console.log("Connected to MariaDB");
});

// Get all users
app.get("/users", (req, res) => {
    console.log("Fetching users from database...");
    
    db.query("SELECT * FROM userdb", (err, results) => {
        if (err) {
            console.error("Error fetching users:", err);
            res.status(500).json({ error: "Database error" });
        } else {
            users = results;
            res.json(users);
        }
    });    

});

// Add a new user
app.post("/users", (req, res) => {
    const { name, passwd, email } = req.body;

    // 유효성 검사
    if (!name || !passwd || !email) {
        return res.status(400).json({ message: "모든 필드를 입력하세요." });
    }

    db.query(
        "INSERT INTO userdb (name, passwd, email) VALUES (?, ?, ?)",
        [name, passwd, email], (err, results) => {
            if (err) {
                console.error("Error adding user:", err);
                return res.status(500).json({ error: "Database error" });
            } 
            // 새 사용자 추가 후 DB에서 다시 조회하여 users 업데이트
            db.query("SELECT * FROM userdb", (err, updatedResults) => {
                if (err) {
                    console.error("? Error fetching updated users:", err);
                    return res.status(500).json({ error: "Database error" });
                }

                users = updatedResults;
                console.log("? User added and users updated:", users);
                res.json(updatedResults);
            });
        }
    );
});

// 로그인 (POST /login)
app.post("/login", (req, res) => {
    const { email, passwd } = req.body;

    const sql = "SELECT * FROM userdb WHERE email = ? AND passwd = ?";
    db.query(sql, [email, passwd], (err, results) => {
        if (err) {
            console.error("? Error during login:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length > 0) {
            res.json({ id: results[0].id, name: results[0].name, email: results[0].email });
        } else {
            res.status(401).json({ message: "로그인 실패: 이메일 또는 비밀번호가 틀렸습니다." });
        }
    });
});


// Get all events
app.get("/events", (req, res) => {

    db.query("SELECT * FROM historyinfo where level=0", (err, results) => {
        if (err) {
            console.error("Error fetching events:", err);
            res.status(500).json({ error: "Database error" });
        } else {
            console.log("event query", results);
            res.json(results);
        }
    });
});

// Add a new event
// bc = (0 : AC, 1 : BC), 
// level = (0~10 0 is top important event. 10 is most detail misc event.user event)
app.post("/events", (req, res) => {
    const { createdt, title, description, level, userid } = req.body.newEvent;
    db.query(
        "INSERT INTO historyinfo (createdt, title, description, level, userid) VALUES (?, ?, ?, ?, ?)",
        [createdt, title, description, level, userid],
        (err, results) => {
            if (err) {
                console.error("Error adding event:", err);
                res.status(500).json({ error: "Database error" });
            } else {
                //console.log("add event", results);
                res.json({ id: results.insertId, createdt, title, description, level, userid });
            }
        }
    );
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});