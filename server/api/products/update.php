<?php
/** POST /api/products/update.php  (admin only) */
require_once __DIR__ . '/../../config/database.php';
require_admin($pdo);

$d  = body();
$id = (int) ($d['id'] ?? 0);
if (!$id) respond(['error' => 'No shoe selected.'], 422);

$sql = 'UPDATE products SET
          brand_id = :brand_id, model = :model, price = :price, old_price = :old_price,
          material = :material, closure = :closure, sole = :sole, heel_height = :heel_height,
          toe_shape = :toe_shape, gender = :gender, insole = :insole, weight = :weight,
          available_sizes = :available_sizes, warranty = :warranty,
          condition_type = :condition_type, use_case = :use_case, stock = :stock,
          is_featured = :is_featured, is_fast_moving = :is_fast_moving, description = :description
        WHERE id = :id';

$pdo->prepare($sql)->execute([
    ':brand_id'        => (int) $d['brand_id'],
    ':model'           => $d['model'],
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
    ':id'              => $id,
]);

// images are replaced as a set when the form sends them
if (isset($d['images'])) {
    $pdo->prepare('DELETE FROM product_images WHERE product_id = ?')->execute([$id]);
    foreach ($d['images'] as $i => $path) {
        $pdo->prepare('INSERT INTO product_images (product_id, image_path, is_primary) VALUES (?,?,?)')
            ->execute([$id, $path, $i === 0 ? 1 : 0]);
    }
}

respond(['message' => 'Changes saved.']);
