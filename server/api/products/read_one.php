<?php
/** GET /api/products/read_one.php?id=5   (or ?slug=nike-air-max-270) */
require_once __DIR__ . '/../../config/database.php';

if (!empty($_GET['slug'])) {
    $stmt = $pdo->prepare('SELECT p.*, b.name AS brand, b.slug AS brand_slug
                             FROM products p JOIN brands b ON b.id = p.brand_id
                            WHERE p.slug = ?');
    $stmt->execute([$_GET['slug']]);
} else {
    $stmt = $pdo->prepare('SELECT p.*, b.name AS brand, b.slug AS brand_slug
                             FROM products p JOIN brands b ON b.id = p.brand_id
                            WHERE p.id = ?');
    $stmt->execute([(int) ($_GET['id'] ?? 0)]);
}

$product = $stmt->fetch();
if (!$product) {
    respond(['error' => 'That shoe is no longer listed.'], 404);
}

[$product] = attach_images($pdo, [$product]);

// a few similar shoes for the bottom of the page
$related = $pdo->prepare('SELECT p.*, b.name AS brand, b.slug AS brand_slug
                            FROM products p JOIN brands b ON b.id = p.brand_id
                           WHERE p.id <> :id AND (p.use_case = :usecase OR p.brand_id = :brand)
                           ORDER BY RAND() LIMIT 4');
$related->execute([
    ':id'      => $product['id'],
    ':usecase' => $product['use_case'],
    ':brand'   => $product['brand_id'],
]);

respond([
    'product' => $product,
    'related' => attach_images($pdo, $related->fetchAll()),
]);
