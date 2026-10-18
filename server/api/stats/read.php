<?php
/** GET /api/stats/read.php  (admin only) — dashboard numbers. */
require_once __DIR__ . '/../../config/database.php';
require_admin($pdo);

respond([
    'products'       => (int) $pdo->query('SELECT COUNT(*) FROM products')->fetchColumn(),
    'out_of_stock'   => (int) $pdo->query('SELECT COUNT(*) FROM products WHERE stock = 0')->fetchColumn(),
    'low_stock'      => (int) $pdo->query('SELECT COUNT(*) FROM products WHERE stock > 0 AND stock <= 2')->fetchColumn(),
    'pending_orders' => (int) $pdo->query("SELECT COUNT(*) FROM orders WHERE status = 'pending'")->fetchColumn(),
    'new_messages'   => (int) $pdo->query("SELECT COUNT(*) FROM inquiries WHERE status = 'new'")->fetchColumn(),
    'revenue'        => (float) $pdo->query("SELECT COALESCE(SUM(total),0) FROM orders WHERE status <> 'cancelled'")->fetchColumn(),
    'recent_orders'  => $pdo->query('SELECT order_code, customer_name, total, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5')->fetchAll(),
]);
