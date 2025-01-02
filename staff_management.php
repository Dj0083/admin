<?php
include 'db.php';

// Fetch staff data
$sql = "SELECT * FROM staff";
$result = $conn->query($sql);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff List</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

<div class="container my-4">
    <h2 class="text-center">Staff Management</h2>

    <!-- Add Staff Link -->
    <div class="text-end">
        <a href="add_staff.php" class="btn btn-success mb-3">Add New Staff</a>
    </div>

    <!-- Staff List Table -->
    <table class="table table-bordered table-striped">
        <thead class="table-dark">
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            <?php while ($row = $result->fetch_assoc()) { ?>
                <tr>
                    <td><?= $row['staff_id'] ?></td>
                    <td><?= $row['name'] ?></td>
                    <td><?= $row['role'] ?></td>
                    <td><?= $row['contact_number'] ?></td>
                    <td><?= $row['email'] ?></td>
                    <td><?= $row['status'] ?></td>
                    <td>
                        <a href="edit_staff.php?staff_id=<?= $row['staff_id'] ?>" class="btn btn-warning btn-sm">Edit</a>
                        <a href="?delete_id=<?= $row['staff_id'] ?>" class="btn btn-danger btn-sm">Delete</a>
                    </td>
                </tr>
            <?php } ?>
        </tbody>
    </table>
</div>

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.6/dist/umd/popper.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.min.js"></script>
 
<!-- Back to Dashboard -->
 <div class="text-center mt-4">
        <a href="admin_dashboard.html" class="btn btn-secondary">Back to Dashboard</a>
    </div>
</div>
</body>
</html>

<?php $conn->close(); ?>
