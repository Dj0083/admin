const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Replace with your MySQL password
    database: 'your_database_name', // Replace with your database name
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(bodyParser.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files (CSS, JS)

// Render Add Staff Form (GET Request)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'add_staff.html'));
});

// Handle Add Staff Form Submission (POST Request)
app.post('/add-staff', (req, res) => {
    const { name, role, contact_number, email, status } = req.body;

    const sql = `INSERT INTO staff (name, role, contact_number, email, status) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [name, role, contact_number, email, status], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send(`<div class="alert alert-danger">Error: ${err.message}</div>`);
        }
        res.send(`<div class="alert alert-success">New staff added successfully.</div>`);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
