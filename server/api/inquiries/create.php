<?php
/** POST /api/inquiries/create.php — contact form and "ask about this laptop". */
require_once __DIR__ . '/../../config/database.php';

$d = body();
if (empty(trim($d['customer_name'] ?? '')) || empty(trim($d['message'] ?? ''))) {
    respond(['error' => 'Tell us your name and what you need.'], 422);
}

$phone = preg_replace('/\D/', '', $d['phone'] ?? '');
if (empty($phone) || !preg_match('/^07\d{8}$/', $phone)) {
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

$pdo->prepare(
    'INSERT INTO inquiries (product_id, customer_name, phone, email, message) VALUES (?,?,?,?,?)'
)->execute([
    !empty($d['product_id']) ? (int) $d['product_id'] : null,
    trim($d['customer_name']),
    $phone,
    $email,
    trim($d['message']),
]);

respond(['message' => 'Message sent. The shop replies within a day.'], 201);
