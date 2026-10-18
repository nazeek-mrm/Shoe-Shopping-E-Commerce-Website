<?php
/** POST /api/auth/reset_password.php  {email, otp, new_password} -> {success, message} */
require_once __DIR__ . '/../../config/database.php';

$d = body();
$email = trim($d['email'] ?? 'nazeeknzk@gmail.com');
$otp = trim($d['otp'] ?? '');
$newPassword = trim($d['new_password'] ?? '');

if (empty($otp) || empty($newPassword)) {
    respond(['error' => 'Please provide the OTP code and a new password.'], 422);
}

if (strlen($newPassword) < 4) {
    respond(['error' => 'Password must be at least 4 characters long.'], 422);
}

// Verify OTP
$stmt = $pdo->prepare('SELECT * FROM password_resets WHERE email = ? AND otp = ? AND expires_at >= NOW() ORDER BY id DESC LIMIT 1');
$stmt->execute([$email, $otp]);
$reset = $stmt->fetch();

if (!$reset) {
    respond(['error' => 'Invalid or expired OTP. Please request a new code.'], 400);
}

// Hash new password and update admin
$hash = password_hash($newPassword, PASSWORD_DEFAULT);
$update = $pdo->prepare('UPDATE admins SET password_hash = ? WHERE email = ? OR username = ?');
$update->execute([$hash, $email, 'admin']);

// Invalidate token / delete reset request
$pdo->prepare('DELETE FROM password_resets WHERE email = ?')->execute([$email]);

// Invalidate existing admin sessions
$stmt = $pdo->prepare('SELECT id FROM admins WHERE email = ? OR username = ?');
$stmt->execute([$email, 'admin']);
$admin = $stmt->fetch();
if ($admin) {
    $pdo->prepare('DELETE FROM admin_tokens WHERE admin_id = ?')->execute([$admin['id']]);
}

respond([
    'success' => true,
    'message' => 'Password has been successfully updated! You can now log in with your new password.',
]);
