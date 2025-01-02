<?php
include 'db.php';

// Initialize donor variables
$donor_id = $name = $email = $phone_number = $blood_type = $last_donation = "";
$message = ''; // Variable to store success or error message

// Check if donor id is passed via GET (Edit Mode)
if (isset($_GET['id'])) {
    $donor_id = $_GET['id'];

    // Fetch donor data from the database if id exists
    $sql = "SELECT * FROM donors WHERE id = $donor_id";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $donor = $result->fetch_assoc();
        $name = $donor['name'];
        $email = $donor['email'];
        $phone_number = $donor['phone_number'];
        $blood_type = $donor['blood_type'];
        $last_donation = $donor['last_donation'];
    } else {
        echo "Donor not found!";
        exit;
    }
}

// Add or Update donor data if the form is submitted
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $phone_number = $_POST['phone_number'];
    $blood_type = $_POST['blood_type'];
    $last_donation = $_POST['last_donation'];

    if ($donor_id) {
        // Update existing donor data
        $update_sql = "UPDATE donors SET 
            name = '$name', 
            email = '$email', 
            phone_number = '$phone_number', 
            blood_type = '$blood_type', 
            last_donation = '$last_donation' 
            WHERE id = $donor_id";
        
        if ($conn->query($update_sql) === TRUE) {
            $message = 'Donor updated successfully!';
            // Redirect after update
            header("Location: view_donors.php");
            exit; // Ensure no further code is executed after redirect
        } else {
            $message = 'Error updating donor: ' . $conn->error;
        }
    } else {
        // Insert new donor data
        $insert_sql = "INSERT INTO donors (name, email, phone_number, blood_type, last_donation)
                        VALUES ('$name', '$email', '$phone_number', '$blood_type', '$last_donation')";
        
        if ($conn->query($insert_sql) === TRUE) {
            $message = 'Donor added successfully!';
            // Redirect after adding
            header("Location: view_donors.php");
            exit; // Ensure no further code is executed after redirect
        } else {
            $message = 'Error adding donor: ' . $conn->error;
        }
    }
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $donor_id ? 'Edit' : 'Add' ?> Donor</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
<div class="container my-4">
    <h2 class="text-center"><?= $donor_id ? 'Edit' : 'Add' ?> Donor</h2>

    <!-- Display success or error message -->
    <?php if ($message): ?>
        <div class="alert alert-info text-center"><?= $message ?></div>
    <?php endif; ?>

    <form method="POST" action="">
        <div class="mb-3">
            <label for="name" class="form-label">Name</label>
            <input type="text" class="form-control" id="name" name="name" value="<?= $name ?>" required>
        </div>
        <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" class="form-control" id="email" name="email" value="<?= $email ?>" required>
        </div>
        <div class="mb-3">
            <label for="phone_number" class="form-label">Phone Number</label>
            <input type="text" class="form-control" id="phone_number" name="phone_number" value="<?= $phone_number ?>" required>
        </div>
        <div class="mb-3">
            <label for="blood_type" class="form-label">Blood Type</label>
            <input type="text" class="form-control" id="blood_type" name="blood_type" value="<?= $blood_type ?>" required>
        </div>
        <div class="mb-3">
            <label for="last_donation" class="form-label">Last Donation</label>
            <input type="date" class="form-control" id="last_donation" name="last_donation" value="<?= $last_donation ?>" required>
        </div>
        <div class="text-center">
            <button type="submit" class="btn btn-primary"><?= $donor_id ? 'Update Donor' : 'Add Donor' ?></button>
            <a href="view_donors.php" class="btn btn-secondary">Cancel</a>
        </div>
    </form>
</div>

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js"></script>

<div class="text-center mt-4">
    <a href="admin_dashboard.html" class="btn btn-secondary">Back to Dashboard</a>
</div>

</body>
</html>

<?php $conn->close(); ?>
