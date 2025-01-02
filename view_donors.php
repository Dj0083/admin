<?php
include 'db.php';

// Fetch donor data
$sql = "SELECT * FROM donors ORDER BY created_at DESC";
$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>View Donors</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

<div class="container my-4">
    <h2 class="text-center">Donor List</h2>

    <!-- Add New Donor Button -->
    <div class="text-end mb-3">
        <a href="add_donor.php" class="btn btn-success">Add New Donor</a>
    </div>

    <!-- Donor List Table -->
    <table class="table table-bordered table-striped">
        <thead class="table-dark">
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone Number</th>
                <th>Blood Type</th>
                <th>Last Donation</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <?php while ($row = $result->fetch_assoc()) { ?>
                <tr>
                    <td><?= $row['name'] ?></td>
                    <td><?= $row['email'] ?></td>
                    <td><?= $row['phone_number'] ?></td>
                    <td><?= $row['blood_type'] ?></td>
                    <td><?= $row['last_donation'] ?></td>
                    <td>
                        <a href="edit_donor.php?id=<?= $row['id'] ?>" class="btn btn-warning btn-sm">Edit</a>
                        
                        <a href="delete_donor.php?id=<?= $row['id'] ?>" class="btn btn-danger btn-sm" onclick="return confirm('Are you sure you want to delete this donor?');">Delete</a>
                    </td>
                </tr>
            <?php } ?>
        </tbody>
    </table>

    <!-- Back to Dashboard -->
    <div class="text-center mt-4">
        <a href="admin_dashboard.html" class="btn btn-secondary">Back to Dashboard</a>
    </div>
</div>

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js"></script>
</body>
</html>

<?php $conn->close(); ?>
