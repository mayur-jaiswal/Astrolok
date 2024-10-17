const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const app = express();
const port = 3000;
const cors = require("cors");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "database-password",
  database: "database-name",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL Database");
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  next();
});

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/home.html", (err) => {
    if (err) {
      console.error("Error sending home.html:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/public/register.html", (err) => {
    if (err) {
      console.error("Error sending register.html:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    console.log("Missing fields");
    return res.send("All fields are required!");
  }

  const query =
    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  db.query(query, [username, email, password], (err, result) => {
    if (err) {
      console.error("Error inserting user into database:", err);
      return res.send("Error occurred during registration.");
    }
    console.log("User registered successfully");
    res.redirect("/login.html");
  });
});
app.use(cors());
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login.html", (err) => {
    if (err) {
      console.error("Error sending login.html:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(query, [username, password], (err, result) => {
    if (err) {
      console.error("Error querying database during login:", err);
      return res.send("Error occurred during login.");
    }

    if (result.length > 0) {
      if (username === "admin") {
        res.redirect("/admin.html");
      } else {
        res.redirect("/k.html");
      }
    } else {
      console.log("Invalid username or password");
      res.send("Invalid username or password. Please try again.");
    }
  });
});
app.get("/get-users", (req, res) => {
  const sql = "SELECT username, email FROM users"; // Ensure your table name is 'user'
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database query error:", err); // Log database errors
      return res.status(500).send("Error retrieving users");
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
