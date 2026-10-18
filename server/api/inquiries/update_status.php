<?php
/** POST /api/inquiries/update_status.php  (admin only) */
require_once __DIR__ . '/../../config/database.php';
require_admin($pdo);

$d  = body();
$id = (int) ($d['id'] ?? 0);
if (!$id || !in_array($d['status'] ?? '', ['new', 'contacted', 'closed'], true)) {
    respond(['error' => 'Pick a valid status.'], 422);
}
$pdo->prepare('UPDATE inquiries SET status = ? WHERE id = ?')->execute([$d['status'], $id]);
respond(['message' => 'Message updated.']);
