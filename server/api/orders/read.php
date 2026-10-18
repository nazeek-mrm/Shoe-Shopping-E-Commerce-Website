<?php
/** GET /api/orders/read.php  (admin only)  — optional ?status=pending */
require_once __DIR__ . '/../../config/database.php';
require_admin($pdo);

$sql    = 'SELECT * FROM orders';
$params = [];
if (!empty($_GET['status'])) {
    $sql .= ' WHERE status = ?';
    $params[] = $_GET['status'];
}
$sql .= ' ORDER BY created_at DESC LIMIT 200';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$orders = $stmt->fetchAll();

$items = $pdo->prepare('SELECT * FROM order_items WHERE order_id = ?');
foreach ($orders as &$o) {
    $items->execute([$o['id']]);
    $o['items'] = $items->fetchAll();
    $o['total'] = (float) $o['total'];
}
respond($orders);
