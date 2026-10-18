<?php
/** GET /api/inquiries/read.php  (admin only) */
require_once __DIR__ . '/../../config/database.php';
require_admin($pdo);

$stmt = $pdo->query(
   'SELECT i.*, CONCAT(b.name, " ", p.model) AS product
      FROM inquiries i
      LEFT JOIN products p ON p.id = i.product_id
      LEFT JOIN brands  b ON b.id = p.brand_id
     ORDER BY i.created_at DESC LIMIT 200'
);
respond($stmt->fetchAll());
