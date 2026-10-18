<?php
/**
 * Sent by every endpoint before any other output.
 * Change ALLOWED_ORIGIN when you deploy to a real domain.
 */
const ALLOWED_ORIGIN = 'http://localhost:5173';

header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

// The browser sends a preflight OPTIONS request first. Answer it and stop.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
