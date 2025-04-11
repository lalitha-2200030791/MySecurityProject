const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const db = require("./db");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
    session({
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);

// **Routes**
app.get("/", (req, res) => {
    res.render("login");
});

// **Register Page**
app.get("/register", (req, res) => {
    res.render("register");
});

// **Register User**
app.post("/register", (req, res) => {
    const { username, email, password } = req.body;
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) throw err;
        db.query(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            [username, email, hashedPassword],
            (error) => {
                if (error) throw error;
                res.redirect("/");
            }
        );
    });
});

// **Login**
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            bcrypt.compare(password, results[0].password, (err, isMatch) => {
                if (isMatch) {
                    req.session.user = results[0];

                    // Check if user is admin
                    if (results[0].role === "admin") {
                        return res.redirect("/admin");
                    } else {
                        return res.redirect("/dashboard");
                    }
                } else {
                    res.send("Incorrect Password");
                }
            });
        } else {
            res.send("User Not Found");
        }
    });
});


// **User Dashboard**
app.get("/dashboard", (req, res) => {
    if (!req.session.user) return res.redirect("/");
    res.render("dashboard", { user: req.session.user });
});

// **Admin Dashboard (CRUD Operations)**
app.get("/admin", (req, res) => {
    if (!req.session.user || req.session.user.role !== "admin") {
        return res.send("Access Denied! Only Admins can view this page.");
    }

    db.query("SELECT * FROM users", (err, results) => {
        if (err) throw err;
        res.render("admin", { users: results });
    });
});


// **Delete User (Admin)**
app.get("/delete/:id", (req, res) => {
    if (!req.session.user || req.session.user.role !== "admin") return res.redirect("/");
    db.query("DELETE FROM users WHERE id = ?", [req.params.id], (err) => {
        if (err) throw err;
        res.redirect("/admin");
    });
});

// **Logout**
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

