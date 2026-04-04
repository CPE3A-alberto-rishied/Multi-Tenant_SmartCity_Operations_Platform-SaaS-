<?php

// 1. Database Connection Settings (Coder will set these up in XAMPP/MySQL)
$host = 'localhost';
$db   = 'beat_db';      // The name of database need to change for this to work
$user = 'root';         // Default XAMPP username
$pass = '';             // Default XAMPP password (usually blank)

// Create connection
$conn = new mysqli($host, $user, $pass, $db);

// Check connection
if ($conn->connect_error) {
    http_response_code(500); // Send an error code back to the JavaScript
    die("Database Connection failed: " . $conn->connect_error);
}

// 2. Check if data was sent via POST (from your fetch request)
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // 3. Grab the data from your HTML form and sanitize it against hackers
    $reporter_name = $conn->real_escape_string($_POST['reporter_name'] ?? 'Anonymous');
    $contact       = $conn->real_escape_string($_POST['contact'] ?? 'N/A');
    $incident_type = $conn->real_escape_string($_POST['incident_type'] ?? 'Unspecified');
    $urgency       = $conn->real_escape_string($_POST['urgency'] ?? 'Low');
    $location      = $conn->real_escape_string($_POST['location'] ?? 'Unknown');
    $description   = $conn->real_escape_string($_POST['description'] ?? '');
    
    // Default status for Thara's Admin dashboard
    $status = 'Pending Review'; 

    // 4. Insert the data into database table
    $sql = "INSERT INTO incident_reports 
            (reporter_name, contact, type, urgency, location, description, status) 
            VALUES 
            ('$reporter_name', '$contact', '$incident_type', '$urgency', '$location', '$description', '$status')";

    if ($conn->query($sql) === TRUE) {
        // Tell your JavaScript fetch() that it was a success!
        http_response_code(200);
        echo "Success";
    } else {
        // Tell your JavaScript fetch() that the database failed
        http_response_code(500);
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
} else {
    // If someone tries to just type submit_report.php in their browser URL
    http_response_code(403);
    echo "Forbidden. You must submit the form to access this file.";
}

$conn->close();
?>