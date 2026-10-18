<?php
/**
 * POST /api/orders/create.php  — public checkout.
 * Prices are re-read from the database, never trusted from the browser,
 * and stock is reduced inside a transaction.
 */
require_once __DIR__ . '/../../config/database.php';

$d = body();
foreach (['customer_name', 'phone', 'address'] as $field) {
    if (empty(trim($d[$field] ?? ''))) {
        respond(['error' => 'Name, phone number and address are required.'], 422);
    }
}

$phone = preg_replace('/\D/', '', $d['phone'] ?? '');
if (!preg_match('/^07\d{8}$/', $phone)) {
    respond(['error' => 'Phone number is compulsory and must be exactly 10 digits starting with 07 (e.g. 0712345678).'], 422);
}

$email = !empty(trim($d['email'] ?? '')) ? strtolower(trim($d['email'])) : null;
if ($email !== null) {
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(['error' => 'Please enter a valid email address ending in .com (e.g. user@gmail.com).'], 422);
    }
    if (preg_match('/@(gma|gmai|gm)\./i', $email) || preg_match('/@(yaho|yah)\./i', $email)) {
        respond(['error' => 'Please write the full domain name (e.g. gmail.com, yahoo.com).'], 422);
    }
    if (preg_match('/\.(c|co)$/i', $email)) {
        respond(['error' => 'Email must end with ".com", not ".c" or ".co".'], 422);
    }
}

if (empty($d['items'])) respond(['error' => 'Your cart is empty.'], 422);

try {
    $pdo->beginTransaction();

    $total = 0;
    $lines = [];

    foreach ($d['items'] as $item) {
        $stmt = $pdo->prepare(
            'SELECT p.id, p.model, p.price, p.stock, b.name AS brand
               FROM products p JOIN brands b ON b.id = p.brand_id
              WHERE p.id = ? FOR UPDATE'
        );
        $stmt->execute([(int) $item['id']]);
        $product = $stmt->fetch();
        if (!$product) throw new Exception('One of the laptops is no longer listed.');

        $qty = max(1, (int) $item['quantity']);
        if ($product['stock'] < $qty) {
            throw new Exception($product['brand'] . ' ' . $product['model'] . ' only has ' . $product['stock'] . ' left in stock.');
        }

        $total  += $product['price'] * $qty;
        $lines[] = [$product['id'], $product['brand'] . ' ' . $product['model'], $product['price'], $qty];
    }

    $code = 'LM' . date('ymd') . strtoupper(bin2hex(random_bytes(2)));

    $pdo->prepare(
        'INSERT INTO orders (order_code, customer_name, phone, email, address, city, payment_method, note, total)
         VALUES (?,?,?,?,?,?,?,?,?)'
    )->execute([
        $code,
        trim($d['customer_name']),
        $phone,
        $email,
        trim($d['address']),
        $d['city'] ?? null,
        in_array($d['payment_method'] ?? 'cod', ['cod', 'bank'], true) ? $d['payment_method'] : 'cod',
        $d['note'] ?? null,
        $total,
    ]);

    $orderId = (int) $pdo->lastInsertId();

    foreach ($lines as [$pid, $model, $price, $qty]) {
        $pdo->prepare('INSERT INTO order_items (order_id, product_id, model, unit_price, quantity) VALUES (?,?,?,?,?)')
            ->execute([$orderId, $pid, $model, $price, $qty]);
        $pdo->prepare('UPDATE products SET stock = stock - ? WHERE id = ?')->execute([$qty, $pid]);
    }

    $pdo->commit();
    respond(['order_code' => $code, 'total' => $total, 'message' => 'Order placed.'], 201);

} catch (Exception $e) {
    $pdo->rollBack();
    respond(['error' => $e->getMessage()], 409);
}
