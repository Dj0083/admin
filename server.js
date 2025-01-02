require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs');
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

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

// View donors
app.get('/view-donors', (req, res) => {
    db.query('SELECT * FROM donors', (err, results) => {
        if (err) {
            return res.send('Error fetching donors');
        }
        res.render('view-donors', { donors: results });
    });
});

// Edit donor
app.get('/edit-donor', (req, res) => {
    const donorId = req.query.id;
    if (donorId) {
        db.query('SELECT * FROM donors WHERE id = ?', [donorId], (err, results) => {
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

// Handle form submission (Add/Update donor)
app.post('/edit-donor', (req, res) => {
    const { name, email, phone_number, blood_type, last_donation, donor_id } = req.body;

    if (donor_id) {
        db.query(
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
        db.query(
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

// Blood Stock Management
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

// Add or update blood stock
app.post('/update_blood_stock', (req, res) => {
    const { blood_type, units_change } = req.body;

    const sql = 'SELECT * FROM blood_stock WHERE blood_type = ?';
    db.query(sql, [blood_type], (err, result) => {
        if (err) {
            console.error('Error fetching blood stock: ' + err.stack);
            return res.status(500).send('Error fetching data');
        }

        let message = '';
        if (result.length > 0) {
            const current_units = result[0].units_available;
            const new_units = current_units + parseInt(units_change);

            if (new_units < 0) {
                message = "Error: Insufficient stock to remove.";
            } else {
                const updateSql = 'UPDATE blood_stock SET units_available = ?, last_updated = NOW() WHERE blood_type = ?';
                db.query(updateSql, [new_units, blood_type], (err) => {
                    if (err) {
                        console.error('Error updating record: ' + err.stack);
                        return res.status(500).send('Error updating record');
                    }
                    message = "Blood stock updated successfully!";
                    res.render('update_blood_stock', { message });
                });
            }
        } else {
            if (parseInt(units_change) > 0) {
                const insertSql = 'INSERT INTO blood_stock (blood_type, units_available) VALUES (?, ?)';
                db.query(insertSql, [blood_type, units_change], (err) => {
                    if (err) {
                        console.error('Error adding record: ' + err.stack);
                        return res.status(500).send('Error adding record');
                    }
                    message = "New blood type added successfully!";
                    res.render('update_blood_stock', { message });
                });
            } else {
                message = "Error: You cannot add a negative number of units for a new blood type.";
                res.render('update_blood_stock', { message });
            }
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
