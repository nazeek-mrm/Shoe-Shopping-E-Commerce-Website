<?php
require_once __DIR__ . '/cors.php';

$config = require __DIR__ . '/local.php';

define('DB_HOST', $config['DB_HOST']);
define('DB_NAME', $config['DB_NAME']);
define('DB_USER', $config['DB_USER']);
define('DB_PASS', $config['DB_PASS']);
define('BASE_URL', $config['BASE_URL']);

try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed. Check config/database.php.']);
    exit;
}

/** Read a JSON request body sent by fetch(). */
function body(): array {
    return json_decode(file_get_contents('php://input'), true) ?: [];
}

/** Send a JSON response and stop. */
function respond($data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

/** Stop unless the request carries a valid admin token. */
function require_admin(PDO $pdo): array {
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer\s+(\S+)/', $header, $m)) {
        respond(['error' => 'Sign in to continue.'], 401);
    }
    $stmt = $pdo->prepare(
        'SELECT a.id, a.username, a.full_name
           FROM admin_tokens t JOIN admins a ON a.id = t.admin_id
          WHERE t.token = :token'
    );
    $stmt->execute([':token' => $m[1]]);
    $admin = $stmt->fetch();
    if (!$admin) {
        respond(['error' => 'Your session expired. Sign in again.'], 401);
    }
    return $admin;
}

/** Turn a model name into a URL-safe slug. */
function slugify(string $text): string {
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    return trim($text, '-');
}

/** Attach image URLs to a list of product rows in one extra query. */
function attach_images(PDO $pdo, array $products): array {
    if (!$products) return [];
    $ids = array_column($products, 'id');
    $in  = implode(',', array_fill(0, count($ids), '?'));
    $stmt = $pdo->prepare(
        "SELECT product_id, image_path, is_primary FROM product_images
          WHERE product_id IN ($in) ORDER BY is_primary DESC, id ASC"
    );
    $stmt->execute($ids);

    $map = [];
    foreach ($stmt->fetchAll() as $row) {
        $map[$row['product_id']][] = BASE_URL . $row['image_path'];
    }
    foreach ($products as &$p) {
        $p['images']    = $map[$p['id']] ?? [];
        $p['price']     = (float) $p['price'];
        $p['old_price'] = $p['old_price'] !== null ? (float) $p['old_price'] : null;
        $p['stock']     = (int) $p['stock'];
    }
    return $products;
}
