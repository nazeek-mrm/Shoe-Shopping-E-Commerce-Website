<?php
/** GET /api/brands/read.php — brands with a live product count for the filter list. */
require_once __DIR__ . '/../../config/database.php';

$stmt = $pdo->query(
   'SELECT b.id, b.name, b.slug, COUNT(p.id) AS product_count
      FROM brands b LEFT JOIN products p ON p.brand_id = b.id
     GROUP BY b.id, b.name, b.slug
     ORDER BY b.name'
);
respond($stmt->fetchAll());
