<?php
/**
 * POST /api/orders/upload_receipt.php
 * Multipart file upload for order payment receipts.
 * Accepts: PDF, JPG, JPEG, PNG up to 5MB.
 */
require_once __DIR__ . '/../../config/database.php';

if (empty($_FILES['receipt']) || $_FILES['receipt']['error'] !== UPLOAD_ERR_OK) {
    respond(['error' => 'Please select a receipt file under 5MB.'], 422);
}

$file = $_FILES['receipt'];
$maxSize = 5 * 1024 * 1024; // 5MB

if ($file['size'] > $maxSize) {
    respond(['error' => 'Receipt file must not exceed 5MB.'], 422);
}

$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowedExts = ['pdf', 'jpg', 'jpeg', 'png'];

if (!in_array($ext, $allowedExts, true)) {
    respond(['error' => 'Invalid file format. Only PDF, JPG, JPEG, and PNG files are accepted.'], 422);
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
];

if (!in_array($mime, $allowedMimes, true)) {
    respond(['error' => 'Invalid file type. Only PDF, JPG, JPEG, and PNG files are accepted.'], 422);
}

$targetDir = __DIR__ . '/../../uploads/receipts';
if (!is_dir($targetDir)) {
    mkdir($targetDir, 0777, true);
}

$fileName = 'receipt-' . date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.' . ($ext === 'jpeg' ? 'jpg' : $ext);
$dest = $targetDir . '/' . $fileName;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    respond(['error' => 'Failed to save receipt file. Please try again.'], 500);
}

respond([
    'path'      => 'uploads/receipts/' . $fileName,
    'url'       => BASE_URL . 'uploads/receipts/' . $fileName,
    'file_name' => $file['name'],
    'message'   => 'Receipt uploaded successfully.'
], 201);
