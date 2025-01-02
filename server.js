// server.js
const express = require('express');
const bodyParser = require('body-parser');
const connection = require('./db');
const app = express();

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
