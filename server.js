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


//  MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "om7319km", 
  database: "futureguide",         
});

db.connect((err) => {
  if (err) {
    console.error(" Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL");
  }
});

// Nodemailer setup (use your Gmail + App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "thefutureguide7@gmail.com", 
    pass: "pbfw jtgd gccv lugb",   
  },
});

//  Verify mail transporter
transporter.verify((error, success) => {
  if (error) {
    console.error(" Error connecting to email service:", error);
  } else {
    console.log(" Server is ready to take our messages");
  }
});

// ====================== SIGNUP ======================


app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(sql, [username, email, hashedPassword], async (err, result) => {
      if (err) {
        console.error("❌ Error inserting user:", err);
        return res.status(500).json({ message: "Error inserting user!" });
      }

      // ✅ Define transporter (configure your Gmail & App Password)
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "thefutureguide7@gmail.com",
          pass: "pbfw jtgd gccv lugb", 
        },
      });

      // ✅ Define mailOptions before using it
      const mailOptions = {
        from: "thefutureguide7@gmail.com",
        to: email,
        subject: "Welcome to FutureGuide!",
        text: `Hello ${username},\n\nWelcome to The Future Guide! Your account has been created successfully.\n\nEnjoy Exploring!\n\n-The Future Guide Team`,
      };

      // ✅ Send email after signup success
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("❌ Error sending email:", error);
          return res.status(500).json({ message: "User registered." });
        } else {
          console.log("📧 Email sent:", info.response);
          res.status(200).json({ message: "User registered!" });
        }
      });
    });
  } catch (error) {
    console.error("❌ Server error:", error);
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
app.listen(3000, () => {
  console.log(" Server running on port 3000");
});
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
  console.log(`✅ Server running on port ${PORT}`);
});
