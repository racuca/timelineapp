/*'use strict';
var http = require('http');
var port = process.env.PORT || 1337;

http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
}).listen(port);
*/

// environment
// npm install
// express mysql cors jsonwebtoken bcrypt cookie-parser

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");


const app = express();
const port = 5001;

// Middleware
//app.use(cors());
// 쿠키 허용
app.use(cors({ origin: "http://localhost:62684", credentials: true }));  
app.use(express.json());
app.use(cookieParser());

let users = [];

const SECRET_KEY = "linehistory_test_key"; // JWT 서명용 비밀키

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

app.get("/check-auth", (req, res) => {
    const token = req.cookies.authToken;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        res.json({ id: decoded.id, email: decoded.email });
    });
});

// 로그인 (POST /login)
app.post("/login", (req, res) => {
    console.log("[server] /login : ", req.body);

    const { email, passwd } = req.body;

    const sql = "SELECT * FROM userdb WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error("? Error during login:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length == 0) {
            console.error("db results : 0");
            return res.status(401).json({ message: "로그인 실패: 이메일이 없습니다." });
        }

        // 비밀번호 비교
        const user = results[0];
        //const isMatch = await bcrypt.compare(passwd, user.passwd);
        const isMatch = passwd == user.passwd;
        console.log("[server] passwd", passwd, user.passwd);
        if (!isMatch) {
            console.error("not Matched");
            return res.status(401).json({ message: "로그인 실패: 이메일 또는 비밀번호가 틀렸습니다." });
        }
        // JWT 토큰 생성
        //const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
        //    expiresIn: "7d" // 7일간 유효
        //});
                
        // HttpOnly 쿠키 설정 
        res.cookie("user", JSON.stringify(user), {
            httpOnly: false,  // 클라이언트에서도 접근 가능
            secure: false, // process.env.NODE_ENV === "production", // 개발 환경에서는 false
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7일 유지
        });

        res.json({ id: user.id, name: user.name, email: user.email });
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