const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const path = require("path");
const bcrypt = require("bcrypt");


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors({
  origin: "https://thefutureguide.github.io",  // your GitHub Pages domain
  methods: ["GET", "POST"],
}));


//  MySQL Connection
const db = mysql.createPool({
  host: process.env.DB_HOST || "ballast.proxy.rlwy.net",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "G3ozx5xtEqGAGi3VdsQGKGHxuwqSJDTn38vEUEREQweQ",
  database: process.env.DB_NAME || "railway",
  port: process.env.DB_PORT || 55091,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
      // ✅ Test database connection route
app.get("/test-db", (req, res) => {
  db.query("SELECT 1 + 1 AS result", (err, results) => {
    if (err) {
      console.error("❌ Database test failed:", err);
      return res.status(500).send("DB connection failed!");
    }
    console.log("✅ Database connected successfully!");
    res.send("✅ Database connected successfully!");
  });
});
  





// ====================== SIGNUP ======================


app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(sql, [username, email, hashedPassword], (err, result) => {
      if (err) {
        console.error("❌ Error inserting user:", err);
        return res.status(500).json({ message: "Error inserting user!" });
      }
      console.log("✅ New user registered:", username);
      res.status(200).json({ message: "User registered successfully!" });
    });
  } catch (error) {
    console.error("❌ Hashing error:", error);
    res.status(500).json({ message: "Server error during signup!" });
  }
});


    

 
    


  


// ====================== LOGIN ======================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("❌ Database error:", err);
      res.status(500).json({ message: "Database error" });
      return;
    }

    if (results.length === 0) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const user = results[0];

    // Compare hashed password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ message: "Invalid email or password" });
    } else {
      console.log("✅ Login successful for:", email);
      res.status(200).json({ message: "Login successful!" });
    }
  });
});



//  Start Server

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});
app.get("/send-emails", (req, res) => {
  const query = "SELECT email FROM users";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching emails:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const emails = results.map((row) => row.email);
    sendBulkEmails(emails);
    res.json({ message: "Emails are being sent..." });
  });
});

function sendBulkEmails(recipients) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "thefutureguide7@gmail.com",
      pass: "pbfw jtgd gccv lugb",
    },
  });

  const mailOptions = {
    from: "thefutureguide7@gmail.com",
    to: recipients, // multiple users
    subject: "Future Guide - Latest Update",
    text: "Hello! Here's the latest update from Future Guide.",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log("❌ Error sending emails:", error);
    }
    console.log("✅ Emails sent:", info.response);
  });
}
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port 3000`);
});

