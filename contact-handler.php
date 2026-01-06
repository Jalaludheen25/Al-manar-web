<?php
// Contact Form Handler for MANAR AL HIKMAH BUILDING MATERIALS TRADING L.L.C
header('Content-Type: application/json');

// Enable error reporting for debugging (disable in production)
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Response array
$response = array(
    'success' => false,
    'message' => ''
);

// Check if form is submitted via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Sanitize and validate input
    $firstName = isset($_POST['firstName']) ? trim(strip_tags($_POST['firstName'])) : '';
    $lastName = isset($_POST['lastName']) ? trim(strip_tags($_POST['lastName'])) : '';
    $email = isset($_POST['email']) ? trim(strip_tags($_POST['email'])) : '';
    $phone = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
    $company = isset($_POST['company']) ? trim(strip_tags($_POST['company'])) : '';
    $subject = isset($_POST['subject']) ? trim(strip_tags($_POST['subject'])) : '';
    $message = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';
    
    // Validation
    $errors = array();
    
    if (empty($firstName)) {
        $errors[] = 'First name is required';
    }
    
    if (empty($lastName)) {
        $errors[] = 'Last name is required';
    }
    
    if (empty($email)) {
        $errors[] = 'Email is required';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Invalid email format';
    }
    
    if (empty($subject)) {
        $errors[] = 'Subject is required';
    }
    
    if (empty($message)) {
        $errors[] = 'Message is required';
    } elseif (strlen($message) < 10) {
        $errors[] = 'Message must be at least 10 characters long';
    }
    
    // If there are validation errors
    if (!empty($errors)) {
        $response['message'] = implode(', ', $errors);
        echo json_encode($response);
        exit;
    }
    
    // Prepare email
    $to = 'sales@mahtradings.com'; // Change this to your actual email
    $emailSubject = 'New Contact Form Submission - ' . ucfirst($subject);
    
    // Email body
    $emailBody = "New contact form submission from MANAR AL HIKMAH BUILDING MATERIALS TRADING L.L.C website\n\n";
    $emailBody .= "Contact Details:\n";
    $emailBody .= "----------------\n";
    $emailBody .= "Name: " . $firstName . " " . $lastName . "\n";
    $emailBody .= "Email: " . $email . "\n";
    $emailBody .= "Phone: " . ($phone ? $phone : 'Not provided') . "\n";
    $emailBody .= "Company: " . ($company ? $company : 'Not provided') . "\n";
    $emailBody .= "Subject: " . ucfirst($subject) . "\n\n";
    $emailBody .= "Message:\n";
    $emailBody .= "--------\n";
    $emailBody .= $message . "\n\n";
    $emailBody .= "----------------\n";
    $emailBody .= "Submitted on: " . date('Y-m-d H:i:s') . "\n";
    $emailBody .= "IP Address: " . $_SERVER['REMOTE_ADDR'] . "\n";
    
    // Email headers
    $headers = array();
    $headers[] = 'From: ' . $firstName . ' ' . $lastName . ' <' . $email . '>';
    $headers[] = 'Reply-To: ' . $email;
    $headers[] = 'X-Mailer: PHP/' . phpversion();
    $headers[] = 'MIME-Version: 1.0';
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    
    // Send email
    $mailSent = mail($to, $emailSubject, $emailBody, implode("\r\n", $headers));
    
    if ($mailSent) {
        $response['success'] = true;
        $response['message'] = 'Thank you for contacting us! We will get back to you within 24 hours.';
        
        // Optional: Send auto-reply to customer
        $autoReplySubject = 'Thank you for contacting MANAR AL HIKMAH BUILDING MATERIALS TRADING L.L.C';
        $autoReplyBody = "Dear " . $firstName . " " . $lastName . ",\n\n";
        $autoReplyBody .= "Thank you for reaching out to MANAR AL HIKMAH BUILDING MATERIALS TRADING L.L.C. We have received your message and will respond to your inquiry within 24 hours.\n\n";
        $autoReplyBody .= "Your message:\n";
        $autoReplyBody .= $message . "\n\n";
        $autoReplyBody .= "If you need immediate assistance, please call us at +971 54 300 7146.\n\n";
        $autoReplyBody .= "Best regards,\n";
        $autoReplyBody .= "MANAR AL HIKMAH BUILDING MATERIALS TRADING L.L.C\n";
        $autoReplyBody .= "Dubai, United Arab Emirates\n";
        $autoReplyBody .= "www.manarhikamah.ae\n";
        
        $autoReplyHeaders = array();
        $autoReplyHeaders[] = 'From: MANAR AL HIKMAH BUILDING MATERIALS TRADING L.L.C <sales@mahtradings.com>';
        $autoReplyHeaders[] = 'Reply-To: sales@mahtradings.com';
        $autoReplyHeaders[] = 'X-Mailer: PHP/' . phpversion();
        $autoReplyHeaders[] = 'MIME-Version: 1.0';
        $autoReplyHeaders[] = 'Content-Type: text/plain; charset=UTF-8';
        
        mail($email, $autoReplySubject, $autoReplyBody, implode("\r\n", $autoReplyHeaders));
        
    } else {
        $response['message'] = 'Sorry, there was an error sending your message. Please try again or contact us directly.';
    }
    
} else {
    $response['message'] = 'Invalid request method';
}

// Return JSON response
echo json_encode($response);
exit;
?>