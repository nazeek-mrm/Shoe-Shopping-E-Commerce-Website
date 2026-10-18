<?php
/** POST /api/products/create.php  (admin only) */
require_once __DIR__ . '/../../config/database.php';
require_admin($pdo);

$d = body();
if (empty($d['model']) || empty($d['brand_id']) || !isset($d['price'])) {
    respond(['error' => 'Brand, model and price are required.'], 422);
}

$brand = $pdo->prepare('SELECT name FROM brands WHERE id = ?');
$brand->execute([(int) $d['brand_id']]);
$brandName = $brand->fetchColumn();
if (!$brandName) respond(['error' => 'Pick a brand from the list.'], 422);

$slug = slugify($brandName . '-' . $d['model']);
$exists = $pdo->prepare('SELECT COUNT(*) FROM products WHERE slug = ?');
$exists->execute([$slug]);
if ($exists->fetchColumn()) $slug .= '-' . time();

$sql = 'INSERT INTO products
        (brand_id, model, slug, price, old_price, material, closure, sole, heel_height, toe_shape,
         gender, insole, weight, available_sizes, warranty, condition_type, use_case, stock,
         is_featured, is_fast_moving, description)
        VALUES
        (:brand_id, :model, :slug, :price, :old_price, :material, :closure, :sole, :heel_height, :toe_shape,
         :gender, :insole, :weight, :available_sizes, :warranty, :condition_type, :use_case, :stock,
         :is_featured, :is_fast_moving, :description)';

$pdo->prepare($sql)->execute([
    ':brand_id'        => (int) $d['brand_id'],
    ':model'           => $d['model'],
    ':slug'            => $slug,
    ':price'           => (float) $d['price'],
    ':old_price'       => $d['old_price'] !== '' && $d['old_price'] !== null ? (float) $d['old_price'] : null,
    ':material'        => $d['material'] ?? null,
    ':closure'         => $d['closure'] ?? null,
    ':sole'            => $d['sole'] ?? null,
    ':heel_height'     => $d['heel_height'] ?? null,
    ':toe_shape'       => $d['toe_shape'] ?? null,
    ':gender'          => $d['gender'] ?? 'unisex',
    ':insole'          => $d['insole'] ?? null,
    ':weight'          => $d['weight'] ?? null,
    ':available_sizes' => $d['available_sizes'] ?? null,
    ':warranty'        => $d['warranty'] ?? '6 months warranty',
    ':condition_type'  => $d['condition_type'] ?? 'new',
    ':use_case'        => $d['use_case'] ?: null,
    ':stock'           => (int) ($d['stock'] ?? 0),
    ':is_featured'     => !empty($d['is_featured']) ? 1 : 0,
    ':is_fast_moving'  => !empty($d['is_fast_moving']) ? 1 : 0,
    ':description'     => $d['description'] ?? null,
]);

$id = (int) $pdo->lastInsertId();

foreach ($d['images'] ?? [] as $i => $path) {
    $pdo->prepare('INSERT INTO product_images (product_id, image_path, is_primary) VALUES (?,?,?)')
        ->execute([$id, $path, $i === 0 ? 1 : 0]);
}

respond(['id' => $id, 'message' => 'Shoe added.'], 201);
