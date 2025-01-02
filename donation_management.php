<?php
include 'db.php';

// Fetch all donors for dropdown
$sql = "SELECT id, name, blood_type FROM donors ORDER BY name ASC";
$donors = $conn->query($sql);

// Fetch donation history for selected donor
$selected_donor = null;
$donation_history = [];
if (isset($_POST['donor_id'])) {
    $selected_donor_id = $_POST['donor_id'];

    // Fetch selected donor details
    $donor_sql = "SELECT id, name, blood_type FROM donors WHERE id = $selected_donor_id";
    $selected_donor = $conn->query($donor_sql)->fetch_assoc();

    // Fetch donation history
    $history_sql = "SELECT * FROM donations WHERE donor_id = $selected_donor_id ORDER BY donation_date DESC";
    $donation_history = $conn->query($history_sql);
}

// Add new donation
if (isset($_POST['add_donation'])) {
    $donor_id = $_POST['donor_id'];
    $donation_units = $_POST['donation_units'];
    $donation_date = $_POST['donation_date'];

    $insert_sql = "INSERT INTO donations (donor_id, donation_units, donation_date)
                   VALUES ('$donor_id', '$donation_units', '$donation_date')";

    if ($conn->query($insert_sql) === TRUE) {
        echo "<script>alert('Donation added successfully!'); window.location.href='donation_management.php';</script>";
    } else {
        echo "Error: " . $conn->error;
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Donation Management</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container my-4">
    <h2 class="text-center">Donation Management</h2>

    <!-- Select Donor -->
    <form method="POST" action="donation_management.php" class="mb-4">
        <div class="mb-3">
            <label for="donor_id" class="form-label">Select Donor</label>
            <select class="form-select" id="donor_id" name="donor_id" required>
                <option value="">-- Select a Donor --</option>
                <?php while ($row = $donors->fetch_assoc()): ?>
                    <option value="<?= $row['id'] ?>" <?= (isset($selected_donor_id) && $selected_donor_id == $row['id']) ? 'selected' : '' ?>>
                        <?= $row['name'] ?> (<?= $row['blood_type'] ?>)
                    </option>
                <?php endwhile; ?>
            </select>
        </div>
        <button type="submit" class="btn btn-primary">View History</button>
    </form>

    <?php if ($selected_donor): ?>
        <h3>Donation History for <?= $selected_donor['name'] ?> (<?= $selected_donor['blood_type'] ?>)</h3>

        <!-- Donation History Table -->
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Quantity (Units)</th>
                </tr>
            </thead>
            <tbody>
                <?php if ($donation_history->num_rows > 0): ?>
                    <?php while ($row = $donation_history->fetch_assoc()): ?>
                        <tr>
                            <td><?= $row['donation_date'] ?></td>
                            <td><?= $row['donation_units'] ?></td>
                        </tr>
                    <?php endwhile; ?>
                <?php else: ?>
                    <tr>
                        <td colspan="2" class="text-center">No donations found</td>
                    </tr>
                <?php endif; ?>
            </tbody>
        </table>

        <!-- Add Donation Form -->
        <h3>Add Donation</h3>
        <form method="POST" action="donation_management.php">
            <input type="hidden" name="donor_id" value="<?= $selected_donor['id'] ?>">
            <div class="mb-3">
                <label for="donation_units" class="form-label">Donation Units</label>
                <input type="number" class="form-control" id="donation_units" name="donation_units" step="0.1" required>
            </div>
            <div class="mb-3">
                <label for="donation_date" class="form-label">Donation Date</label>
                <input type="date" class="form-control" id="donation_date" name="donation_date" required>
            </div>
            <button type="submit" name="add_donation" class="btn btn-success">Add Donation</button>
        </form>
    <?php endif; ?>
</div>

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js"></script>
</body>
</html>

 <!-- Back to Dashboard -->
 <div class="text-center mt-4">
        <a href="admin_dashboard.html" class="btn btn-secondary">Back to Dashboard</a>
    </div>
</div>

<?php $conn->close(); ?>
