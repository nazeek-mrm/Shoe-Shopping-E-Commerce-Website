<?php
/** POST /api/orders/update_status.php  (admin only) */
require_once __DIR__ . '/../../config/database.php';
require_admin($pdo);

$d      = body();
$id     = (int) ($d['id'] ?? 0);
$status = $d['status'] ?? '';

if (!$id || !in_array($status, ['pending', 'confirmed', 'delivered', 'cancelled'], true)) {
    respond(['error' => 'Pick a valid order status.'], 422);
}

$pdo->prepare('UPDATE orders SET status = ? WHERE id = ?')->execute([$status, $id]);
respond(['message' => 'Order updated.']);
