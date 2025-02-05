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
// ��Ű ���
app.use(cors({ origin: "http://localhost:62684", credentials: true }));  
app.use(express.json());
app.use(cookieParser());

let users = [];

const SECRET_KEY = "linehistory_test_key"; // JWT ����� ���Ű

// MariaDB connection
const db = mysql.createConnection({
    host: "192.168.219.101",
    user: "root", // MariaDB ����� �̸�
    password: "Allusinc4u*", // MariaDB ��й�ȣ
    database: "linehistory", // MariaDB �����ͺ��̽� �̸�
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

    // ��ȿ�� �˻�
    if (!name || !passwd || !email) {
        return res.status(400).json({ message: "��� �ʵ带 �Է��ϼ���." });
    }

    db.query(
        "INSERT INTO userdb (name, passwd, email) VALUES (?, ?, ?)",
        [name, passwd, email], (err, results) => {
            if (err) {
                console.error("Error adding user:", err);
                return res.status(500).json({ error: "Database error" });
            } 
            // �� ����� �߰� �� DB���� �ٽ� ��ȸ�Ͽ� users ������Ʈ
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

// �α��� (POST /login)
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
            return res.status(401).json({ message: "�α��� ����: �̸����� �����ϴ�." });
        }

        // ��й�ȣ ��
        const user = results[0];
        //const isMatch = await bcrypt.compare(passwd, user.passwd);
        const isMatch = passwd == user.passwd;
        console.log("[server] passwd", passwd, user.passwd);
        if (!isMatch) {
            console.error("not Matched");
            return res.status(401).json({ message: "�α��� ����: �̸��� �Ǵ� ��й�ȣ�� Ʋ�Ƚ��ϴ�." });
        }
        // JWT ��ū ����
        //const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
        //    expiresIn: "7d" // 7�ϰ� ��ȿ
        //});
                
        // HttpOnly ��Ű ���� 
        res.cookie("user", JSON.stringify(user), {
            httpOnly: false,  // Ŭ���̾�Ʈ������ ���� ����
            secure: false, // process.env.NODE_ENV === "production", // ���� ȯ�濡���� false
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7�� ����
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