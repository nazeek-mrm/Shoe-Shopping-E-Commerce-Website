<?php
/** GET /api/auth/me.php — used on page refresh to check a stored token. */
require_once __DIR__ . '/../../config/database.php';
respond(['admin' => require_admin($pdo)]);
