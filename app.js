const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Home route to display donors and history
app.get('/', (req, res) => {
    const getDonorsQuery = 'SELECT id, name, blood_type FROM donors ORDER BY name ASC';
    db.query(getDonorsQuery, (err, donors) => {
        if (err) throw err;

        res.render('donation_management', { donors, selectedDonor: null, donationHistory: [] });
    });
});

// Handle donor selection
app.post('/view-history', (req, res) => {
    const selectedDonorId = req.body.donor_id;

    const donorDetailsQuery = `SELECT id, name, blood_type FROM donors WHERE id = ${selectedDonorId}`;
    const historyQuery = `SELECT * FROM donations WHERE donor_id = ${selectedDonorId} ORDER BY donation_date DESC`;

    db.query(donorDetailsQuery, (err, selectedDonor) => {
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

// Handle new donation
app.post('/add-donation', (req, res) => {
    const { donor_id, donation_units, donation_date } = req.body;
    const insertDonationQuery = 'INSERT INTO donations (donor_id, donation_units, donation_date) VALUES (?, ?, ?)';

    db.query(insertDonationQuery, [donor_id, donation_units, donation_date], (err) => {
        if (err) throw err;
        res.redirect('/');
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
