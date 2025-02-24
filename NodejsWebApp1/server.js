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
//app.use(express.json());
app.use(express.json({ limit: "10mb", type: "application/json" }));
app.use(express.urlencoded({ extended: true }));
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


// 회원가입 API
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;
    console.log(name, email, password);

    // 이메일 중복 확인
    const sql = "SELECT * FROM userdb WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error("db query error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: "이미 가입된 이메일입니다." });
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ error: "비밀번호 암호화 실패" });
            }

            const usergrade = 2;
            db.query("INSERT INTO userdb (name, passwd, email, usergrade) VALUES (?, ?, ?, ?)",
                [name, hashedPassword, email, usergrade],
                (err) => {
                    if (err) {
                        return res.status(500).json({ error: "회원가입 실패" });
                    }
                    res.json({ message: "회원가입 성공" });
                });
        });

        // 비밀번호 해싱
        /*const hashedPassword = bcrypt.hash(password, 10);
        console.log(hashedPassword);
        const usergrade = 2;
        // DB에 새 사용자 추가
        db.run("INSERT INTO userdb (name, passwd, email, usergrade) VALUES (?, ?, ?, ?)", [name, hashedPassword, email, usergrade], (err) => {
            if (err) {
                return res.status(500).json({ error: "회원가입 실패" });
            }
            res.json({ message: "회원가입 성공" });
        });*/
    });
});

// Add a new user
app.post("/users", (req, res) => {
    const { name, passwd, email } = req.body;

    // 유효성 검사
    if (!name || !passwd || !email) {
        return res.status(400).json({ message: "모든 필드를 입력하세요." });
    }

    bcrypt.hash(passwd, saltRounds, (err, hash) => {
        if (err) {
            console.error("비밀번호 해싱 오류:", err);
            return res.status(500).json({ error: "비밀번호 암호화 오류" });
        }
        db.query(
            "INSERT INTO userdb (name, passwd, email) VALUES (?, ?, ?)",
            [name, hash, email], (err, results) => {
                if (err) {
                    console.error("Error adding user:", err);
                    return res.status(500).json({ error: "Database Error" });
                }
                res.json({ message: "회원가입 성공" });
                // 새 사용자 추가 후 DB에서 다시 조회하여 users 업데이트
                /*db.query("SELECT * FROM userdb", (err, updatedResults) => {
                    if (err) {
                        console.error("? Error fetching updated users:", err);
                        return res.status(500).json({ error: "Database error" });
                    }

                    users = updatedResults;
                    console.log("? User added and users updated:", users);
                    res.json(updatedResults);
                });*/
            }
        );
    });

});

/////////////////////////////////////////////////////////////////////////
// Update a category info of userdb

app.post("/users/category/:id", (req, res) => {
    const { id } = req.params;
    const category = req.body.category;

    // 유효성 검사
    if (!category) {
        return res.status(400).json({ message: "선택된 카테고리가 없습니다." });
    }

    db.query(
        "UPDATE userdb SET category=? WHERE id = ?",
        [category, id],
        (err, results) => {
            if (err) {
                console.error("Error updating user:", err);
                res.status(500).json({ error: "Database error" });
            } else {
                // Event query with category
                const output = "(" + category.split(",").map(x => `'${x}'`).join(", ") + ")";
                const sql = "SELECT * FROM historyinfo WHERE category in " + output;
                db.query(sql, [], async (err, results) => {
                    if (err) {
                    }
                    res.json({ results });
                });
            }
        }
    );

});

// 로그인 (POST /login)
app.post("/login", (req, res) => {
    console.log("[server] /login : ", req.body);
    
    const { email, passwd } = req.body;

    const sql = "SELECT * FROM userdb WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error("? Error during login:", err);
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            return res.status(500).json({ success: false, message: "Database 오류" });
        }

        if (results.length == 0) {
            console.error("db results : 0");
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            return res.json({ success:false, message: "로그인 실패: 이메일이 없습니다." });
        }

        // 비밀번호 비교
        const user = results[0];
        const hashedPasswd = user.passwd;
        bcrypt.compare(passwd, hashedPasswd, (err, isMatch) => {
            if (err) {
                console.error("? 비밀번호 검증 오류:", err);
                res.setHeader("Content-Type", "application/json; charset=utf-8");
                return res.status(500).json({ success:false, message: "서버 오류" });
            }
            if (!isMatch) {
                console.error("not Matched", passwd, hashedPasswd);
                res.setHeader("Content-Type", "application/json; charset=utf-8");
                return res.json({ success: false, message: "로그인 실패: 비밀번호가 틀렸습니다." });
            }
            const userData = { id: user.id, email: user.email, name: user.name, usergrade: user.usergrade, signupdt: user.signupdt, agreemarketing: user.agreemarketing };

            // HttpOnly 쿠키 설정 
            res.cookie("user", JSON.stringify(userData), {
                httpOnly: false, // 클라이언트에서도 접근 가능
                secure: false, // process.env.NODE_ENV === "production", // 개발 환경에서는 false
                sameSite: "Strict",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7일 유지
            });

            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.json({ success:true, ...userData });
        });
    });
});


// Get all events
app.get("/events", (req, res) => {
    const userid = parseInt(req.query.userid, 10);
    const category = req.query.category.category;

    if (userid == "null" || userid == undefined || isNaN(userid)) {
        db.query("SELECT * FROM commonhistory order by id DESC Limit 5", (err, results) => {
            if (err) {
                console.error("Error fetching events:", err);
                res.status(500).json({ error: "Database error" });
            } else {
                console.log("event query", results);
                res.json(results);
            }
        });
    }
    else {
        const output = "(" + category.split(",").map(x => `'${x}'`).join(", ") + ")";
        const sql = "SELECT * FROM historyinfo WHERE userid=" + userid + " and category in " + output;
        db.query(sql, [],
        (err, results) => {
            if (err) {
                console.error("Error fetching events:", err);
                res.status(500).json({ error: "Database error" });
            } else {
                console.log("event query", results);
                res.json(results);
            }
        });
    }
});

// Add a new event
// bc = (0 : AC, 1 : BC), 
// level = (0~10 0 is top important event. 10 is most detail misc event.user event)
app.post("/events", (req, res) => {
    const { createdt, title, description, level, category, userid } = req.body.newEvent;
    db.query(
        "INSERT INTO historyinfo (createdt, title, description, level, category, userid) VALUES (?, ?, ?, ?, ?, ?)",
        [createdt, title, description, level, category, userid],
        (err, results) => {
            if (err) {
                console.error("Error adding event:", err);
                res.status(500).json({ error: "Database error" });
            } else {
                //console.log("add event", results);
                res.json({ id: results.insertId, createdt, title, description, level, category, userid });
            }
        }
    );
});


// Admin Page

// Get all events
app.get("/admin/stats", (req, res) => {
    try {
        console.log("1");
        const resulttotal = []
        db.query("SELECT COUNT(*) AS totalUsers FROM userdb", (err, results) => {
            if (err) {
                console.error("Error fetching events:", err);
                res.status(500).json({ error: "Database error" });
            } else {
                console.log("event query", results);
                resulttotal.push({ totalUsers: results[0].totalUsers })
                db.query("SELECT COUNT(*) AS totalEvents FROM historyinfo", (err, results) => {
                    if (err) {
                        console.error("Error fetching events:", err);
                        res.status(500).json({ error: "Database error" });
                    } else {
                        console.log("event query", results);
                        resulttotal.push({ totalEvents: results[0].totalEvents })
                        db.query("SELECT id, createdt, title, description FROM historyinfo ORDER BY id DESC LIMIT 5", (err, results) => {
                            if (err) {
                                console.error("Error fetching events:", err);
                                res.status(500).json({ error: "Database error" });
                            } else {
                                console.log("event query", results);
                                resulttotal.push({ latestEvents: results })
                                res.json(resulttotal);
                            }
                        });
                    }
                });
            }
        });

    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ error: "Database query failed" });
    }
});

// Search users
app.get("/admin/users", (req, res) => {
    try {
        const search = req.query.search ? `%${req.query.search}%` : "%";        
        db.query("SELECT * FROM userdb where name LIKE ? or email LIKE ?", [search, search],
        (err, results) => {
            if (err) {
                console.error("Error fetching users:", err);
                res.status(500).json({ error: err.message });
            } else {
                console.log("admin user query", results);
                res.json(results);
            }
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ error: "Database query failed" });
    }
});

// Edit user
app.post("/admin/users/edit/:id", (req, res) => {
    const { id } = req.params;
    const { name, email, usergrade, agreemarketing, tokens } = req.body;

    db.query(
        "UPDATE userdb SET name = ?, email = ?, usergrade=?, agreemarketing=?, tokens=? WHERE id = ?",
        [name, email, usergrade, agreemarketing, tokens, id],
        (err, results) => {
            if (err) {
                console.error("Error editing user:", err);
                res.status(500).json({ error: "Database error" });
            } else {
                res.json({ success: true, updatedRows: this.changes });
            }
        }
    );
});

// Search events
app.get("/admin/events", (req, res) => {
    try {
        const search = req.query.search ? `%${req.query.search}%` : "%";
        const sql = "SELECT h.*, u.name FROM historyinfo h JOIN userdb u ON h.userid = u.id WHERE h.title LIKE ? OR h.description LIKE ? GROUP BY h.id, u.name"
        db.query(sql, [search, search],
            (err, results) => {
                if (err) {
                    console.error("Error fetching event:", err);
                    res.status(500).json({ error: err.message });
                } else {
                    console.log("admin event query", results);
                    res.json(results);
                }
            });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ error: "Database query failed" });
    }
});


// Edit event 
app.post("/admin/events/edit/:id", (req, res) => {
    const { id } = req.params;
    const { createdt, title, description, level, userid, category } = req.body;

    db.query(
        "UPDATE historyinfo SET createdt = ?, title = ?, description=?, level=?, userid=?, category=? WHERE id = ?",
        [createdt, title, description, level, userid, category, id],
        (err, results) => {
            if (err) {
                console.error("Error editing event:", err);
                res.status(500).json({ error: "Database error" });
            } else {
                res.json({ success: true, updatedRows: this.changes });
            }
        }
    );
});

// Add common event 
app.post("/admin/events/add", (req, res) => {
    try {
        const historyData = req.body;
        const query =
            "INSERT INTO commonhistory (createdt, title, description, level, userid) VALUES (?, ?, ?, ?, ?)";

        for (const entry of historyData) {
            db.execute(query, [
                entry.createdt,
                entry.title,
                entry.description,
                entry.level,
                entry.userid,
            ]);
        }

        res.status(200).json({ success: true, message: "데이터 저장 완료" });
    } catch (error) {
        console.error(error);
        res.status(500).json("오류 발생");
    }
});

// UserInfoPage Data
app.get("/user/events/:id", (req, res) => {
    const { id } = req.params;

    db.query(
        "SELECT * FROM historyinfo where userid = ? order by id DESC LIMIT 1",
        [id],
        (err, results) => {
            if (err) {
                console.error("Error query user:", err);
                res.status(500).json({ error: "Database error" });
            } else {
                res.json( results[0] );
            }
        }
    );
});
app.post("/user/gettoken/:id", (req, res) => {
    const { id } = req.params;

    db.query(
        "UPDATE userdb SET tokens = tokens + 1 WHERE id = ?",
        [id],
        (err, results) => {
            if (err) {
                console.error("Error editing user:", err);
                res.status(500).json({ error: "Database error" });
            } else {
                db.query(
                    "SELECT tokens FROM userdb WHERE id = ?",
                    [id],
                    (err, results) => {
                        res.json({ success: true, newTokenCount: results[0].tokens });
                    }
                );
            }
        }
    );
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});