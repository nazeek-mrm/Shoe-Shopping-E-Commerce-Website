<?php
/** POST /api/products/delete.php  (admin only) */
require_once __DIR__ . '/../../config/database.php';
require_admin($pdo);

$id = (int) (body()['id'] ?? 0);
if (!$id) respond(['error' => 'No laptop selected.'], 422);

$pdo->prepare('DELETE FROM products WHERE id = ?')->execute([$id]);
respond(['message' => 'Laptop removed.']);
