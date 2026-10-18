<?php
/** POST /api/auth/logout.php */
require_once __DIR__ . '/../../config/database.php';

$header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
if (preg_match('/Bearer\s+(\S+)/', $header, $m)) {
    $pdo->prepare('DELETE FROM admin_tokens WHERE token = ?')->execute([$m[1]]);
}
respond(['message' => 'Signed out.']);
