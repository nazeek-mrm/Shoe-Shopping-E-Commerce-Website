<?php
/** POST /api/auth/login.php  {username, password} -> {token, admin} */
require_once __DIR__ . '/../../config/database.php';

$d = body();
$stmt = $pdo->prepare('SELECT * FROM admins WHERE username = ?');
$stmt->execute([trim($d['username'] ?? '')]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($d['password'] ?? '', $admin['password_hash'])) {
    respond(['error' => 'That username and password do not match.'], 401);
}

$token = bin2hex(random_bytes(32));
$pdo->prepare('INSERT INTO admin_tokens (token, admin_id) VALUES (?,?)')->execute([$token, $admin['id']]);

respond([
    'token' => $token,
    'admin' => ['id' => $admin['id'], 'username' => $admin['username'], 'full_name' => $admin['full_name']],
]);
