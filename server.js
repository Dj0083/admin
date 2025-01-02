// server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const connection = require('./db');
const app = express();
const path = require('path');

const app = express();
const port = 3000;
// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'database',
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to the database.');
});

// Home route: Fetch donors and donation history
app.get('/', (req, res) => {
    const getDonorsQuery = 'SELECT id, name, blood_type FROM donors ORDER BY name ASC';

    db.query(getDonorsQuery, (err, donors) => {
        if (err) throw err;
        res.render('donation_management', { donors, selectedDonor: null, donationHistory: [] });
    });
});

// View donation history for selected donor
app.post('/view-history', (req, res) => {
    const donorId = req.body.donor_id;
    const donorQuery = `SELECT id, name, blood_type FROM donors WHERE id = ${donorId}`;
    const historyQuery = `SELECT donation_date, donation_units FROM donations WHERE donor_id = ${donorId} ORDER BY donation_date DESC`;

    db.query(donorQuery, (err, selectedDonor) => {
        if (err) throw err;

        db.query(historyQuery, (err, donationHistory) => {
            if (err) throw err;

            const getDonorsQuery = 'SELECT id, name, blood_type FROM donors ORDER BY name ASC';
            db.query(getDonorsQuery, (err, donors) => {
                if (err) throw err;
                res.render('donation_management', { donors, selectedDonor: selectedDonor[0], donationHistory });
            });
        });
    });
});

// Add new donation
app.post('/add-donation', (req, res) => {
    const { donor_id, donation_units, donation_date } = req.body;
    const addDonationQuery = 'INSERT INTO donations (donor_id, donation_units, donation_date) VALUES (?, ?, ?)';

    db.query(addDonationQuery, [donor_id, donation_units, donation_date], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

// Template engine logic: Render EJS directly
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Serve static files and render donation management page
app.get('/', (req, res) => {
    res.render(
        `<html>
        <head>
            <title>Donation Management</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container">
                <h2 class="text-center">Donation Management</h2>
                <form method="POST" action="/view-history" class="mb-4">
                    <div class="mb-3">
                        <label>Select Donor</label>
                    </div>
                </div>
              </style>
          `
    );
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Routes

// Add or Edit Donor
app.get('/edit-donor', (req, res) => {
    const donorId = req.query.id;
    if (donorId) {
        // Fetch donor details from the database
        connection.query('SELECT * FROM donors WHERE id = ?', [donorId], (err, results) => {
            if (err) {
                return res.send('Error fetching donor data');
            }
            if (results.length > 0) {
                res.render('edit-donor', { donor: results[0], message: '' });
            } else {
                res.send('Donor not found');
            }
        });
    } else {
        res.render('edit-donor', { donor: {}, message: '' });
    }
});

// Handle form submission (Add/Update)
app.post('/edit-donor', (req, res) => {
    const { name, email, phone_number, blood_type, last_donation, donor_id } = req.body;

    if (donor_id) {
        // Update donor data
        connection.query(
            'UPDATE donors SET name = ?, email = ?, phone_number = ?, blood_type = ?, last_donation = ? WHERE id = ?',
            [name, email, phone_number, blood_type, last_donation, donor_id],
            (err, results) => {
                if (err) {
                    return res.send('Error updating donor: ' + err.message);
                }
                res.redirect('/view-donors');
            }
        );
    } else {
        // Add new donor data
        connection.query(
            'INSERT INTO donors (name, email, phone_number, blood_type, last_donation) VALUES (?, ?, ?, ?, ?)',
            [name, email, phone_number, blood_type, last_donation],
            (err, results) => {
                if (err) {
                    return res.send('Error adding donor: ' + err.message);
                }
                res.redirect('/view-donors');
            }
        );
    }
});

// View Donors
app.get('/view-donors', (req, res) => {
    connection.query('SELECT * FROM donors', (err, results) => {
        if (err) {
            return res.send('Error fetching donors');
        }
        res.render('view-donors', { donors: results });
    });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

// Set up body-parser middleware for handling POST requests
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Serve static files (e.g., Bootstrap)
app.use(express.static(path.join(__dirname, 'public')));

// Route to Edit Staff Information
app.get('/edit-staff/:staff_id', (req, res) => {
    const staff_id = req.params.staff_id;

    const sql = 'SELECT * FROM staff WHERE staff_id = ?';
    connection.query(sql, [staff_id], (err, result) => {
        if (err) {
            res.send('Error fetching staff details: ' + err);
            return;
        }

        if (result.length === 0) {
            res.send('Staff not found!');
            return;
        }

        res.render('editStaff', { staff: result[0] });
    });
});

// Route to Update Staff Information
app.post('/edit-staff/:staff_id', (req, res) => {
    const { name, role, contact_number, email, status } = req.body;
    const staff_id = req.params.staff_id;

    const sql = `UPDATE staff SET name = ?, role = ?, contact_number = ?, email = ?, status = ? WHERE staff_id = ?`;

    connection.query(sql, [name, role, contact_number, email, status, staff_id], (err, result) => {
        if (err) {
            res.send('Error updating staff: ' + err);
            return;
        }

        res.send('<div class="alert alert-success" role="alert">Staff updated successfully.</div>');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Serve static files (for CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Blood Stock Monitoring Route
app.get('/monitor_blood_stock', (req, res) => {
    const sql = 'SELECT * FROM blood_stock';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching blood stock data: ' + err.stack);
            return res.status(500).send('Error fetching data');
        }
        res.render('monitor_blood_stock', { bloodStock: result });
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Set up EJS for templating
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse POST data
app.use(express.urlencoded({ extended: true }));

// Route to display staff list
app.get('/staff_list', (req, res) => {
    const sql = 'SELECT * FROM staff';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching staff data: ' + err.stack);
            return res.status(500).send('Error fetching data');
        }
        res.render('staff_list', { staff: result });
    });
});

// Route to delete staff (implement deletion logic if needed)
app.get('/staff_list/delete/:staff_id', (req, res) => {
    const { staff_id } = req.params;
    const deleteQuery = `DELETE FROM staff WHERE staff_id = ?`;

    db.query(deleteQuery, [staff_id], (err, result) => {
        if (err) {
            console.error('Error deleting staff: ' + err.stack);
            return res.status(500).send('Error deleting staff');
        }
        res.redirect('/staff_list');
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
