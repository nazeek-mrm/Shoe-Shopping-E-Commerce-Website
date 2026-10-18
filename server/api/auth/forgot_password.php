<?php
/** POST /api/auth/forgot_password.php  {username_or_email} -> {success, message, dev_otp} */
require_once __DIR__ . '/../../config/database.php';

$d = body();
$input = strtolower(trim($d['username_or_email'] ?? ''));

if (empty($input)) {
    respond(['error' => 'Please enter your registered recovery email or username.'], 422);
}

// Target recovery email and admin lookup
$recoveryEmail = 'nazeeknzk@gmail.com';

$stmt = $pdo->prepare('SELECT * FROM admins WHERE LOWER(email) = ? OR LOWER(username) = ? LIMIT 1');
$stmt->execute([$input, $input]);
$admin = $stmt->fetch();

if (!$admin) {
    // If input matches recovery email directly
    if ($input === strtolower($recoveryEmail)) {
        $stmt = $pdo->query("SELECT * FROM admins LIMIT 1");
        $admin = $stmt->fetch();
    } else {
        respond(['error' => 'No account found matching that recovery email.'], 404);
    }
}

$email = !empty($admin['email']) ? $admin['email'] : $recoveryEmail;

// Generate 6 digit numeric OTP
$otp = str_pad((string)random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

// Clean up old OTPs for this email and save the new one (15 minutes validity)
$pdo->prepare('DELETE FROM password_resets WHERE email = ?')->execute([$email]);
$stmt = $pdo->prepare('INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))');
$stmt->execute([$email, $otp]);

// Attempt to send email
$subject = 'SHOE MART - Password Reset OTP';
$message = "Hello " . ($admin['full_name'] ?? 'Admin') . ",\r\n\r\n"
         . "You have requested a one-time password (OTP) to reset your SHOE MART admin password.\r\n\r\n"
         . "Your OTP is: " . $otp . "\r\n\r\n"
         . "This code will expire in 15 minutes.\r\n"
         . "If you did not request this, please ignore this email.\r\n\r\n"
         . "Regards,\r\nSHOE MART Admin Security";

$headers = "From: SHOE MART <no-reply@shoemart.local>\r\n"
         . "Reply-To: " . $email . "\r\n"
         . "X-Mailer: PHP/" . phpversion();

$mailSent = @mail($email, $subject, $message, $headers);

respond([
    'success'  => true,
    'message'  => 'A 6-digit OTP has been sent to your recovery email.',
    'dev_otp'  => $otp,
    'mail_sent'=> $mailSent,
]);
