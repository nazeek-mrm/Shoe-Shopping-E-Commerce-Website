<?php
/**
 * POST /api/products/upload.php   (admin only)
 * multipart/form-data with field "image". Returns the stored relative path.
 */
require_once __DIR__ . '/../../config/database.php';
require_admin($pdo);

if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    respond(['error' => 'Choose an image under 5MB and try again.'], 422);
}

$file = $_FILES['image'];
$allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
$mime = mime_content_type($file['tmp_name']);

if (!isset($allowed[$mime]))      respond(['error' => 'Only JPG, PNG or WEBP images are accepted.'], 422);
if ($file['size'] > 5*1024*1024)  respond(['error' => 'That image is larger than 5MB.'], 422);

$name = 'laptop-' . date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.' . $allowed[$mime];
$dest = __DIR__ . '/../../uploads/' . $name;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    respond(['error' => 'Could not save the image. Check folder permissions on /uploads.'], 500);
}

respond(['path' => 'uploads/' . $name, 'url' => BASE_URL . 'uploads/' . $name], 201);
