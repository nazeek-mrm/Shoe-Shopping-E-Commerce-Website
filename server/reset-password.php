<?php
/**
 * Open this file once in the browser if the seeded admin password will not work
 * (some PHP builds hash differently). Delete it afterwards.
 * http://localhost/shoe-mart/server/reset-password.php
 */
require_once __DIR__ . '/config/database.php';

$hash = password_hash('admin123', PASSWORD_DEFAULT);
$pdo->prepare('UPDATE admins SET password_hash = ? WHERE username = ?')
    ->execute([$hash, 'admin']);

respond(['message' => 'Password for "admin" reset to admin123. Delete this file now.']);
