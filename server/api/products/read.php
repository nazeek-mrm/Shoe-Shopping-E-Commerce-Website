<?php
/**
 * GET /api/products/read.php
 * Every listing on the site comes from this one endpoint.
 *
 *   ?search=air max    ?brand=nike       ?condition=new|used
 *   ?use_case=sport    ?min=10000        ?max=40000
 *   ?closure=lace-up   ?gender=men       ?offers=1     ?fast=1    ?featured=1
 *   ?in_stock=1        ?sort=new|price_asc|price_desc|name
 *   ?page=1            ?limit=12
 */
require_once __DIR__ . '/../../config/database.php';

$where  = ['1 = 1'];
$params = [];

if (!empty($_GET['search'])) {
    // the same value is bound three times under different names, because
    // native prepared statements will not reuse one placeholder
    $where[] = '(p.model LIKE :s1 OR b.name LIKE :s2 OR p.material LIKE :s3)';
    $term = '%' . $_GET['search'] . '%';
    $params[':s1'] = $term;
    $params[':s2'] = $term;
    $params[':s3'] = $term;
}
if (!empty($_GET['brand'])) {
    $brands = explode(',', $_GET['brand']);
    $marks  = [];
    foreach ($brands as $i => $b) {
        $marks[] = ":brand$i";
        $params[":brand$i"] = $b;
    }
    $where[] = 'b.slug IN (' . implode(',', $marks) . ')';
}
if (!empty($_GET['condition'])) { $where[] = 'p.condition_type = :cond';  $params[':cond'] = $_GET['condition']; }
if (!empty($_GET['use_case']))  { $where[] = 'p.use_case = :usecase';     $params[':usecase'] = $_GET['use_case']; }
if (!empty($_GET['closure']))   { $where[] = 'p.closure = :closure';      $params[':closure'] = $_GET['closure']; }
if (!empty($_GET['gender']))    { $where[] = 'p.gender = :gender';        $params[':gender'] = $_GET['gender']; }
if (isset($_GET['min']) && $_GET['min'] !== '') { $where[] = 'p.price >= :min'; $params[':min'] = (float) $_GET['min']; }
if (isset($_GET['max']) && $_GET['max'] !== '') { $where[] = 'p.price <= :max'; $params[':max'] = (float) $_GET['max']; }
if (!empty($_GET['offers']))   { $where[] = 'p.old_price IS NOT NULL'; }
if (!empty($_GET['fast']))     { $where[] = 'p.is_fast_moving = 1'; }
if (!empty($_GET['featured'])) { $where[] = 'p.is_featured = 1'; }
if (!empty($_GET['in_stock'])) { $where[] = 'p.stock > 0'; }

$order = match ($_GET['sort'] ?? 'new') {
    'price_asc'  => 'p.price ASC',
    'price_desc' => 'p.price DESC',
    'name'       => 'b.name ASC, p.model ASC',
    default      => 'p.created_at DESC, p.id DESC',
};

$clause = implode(' AND ', $where);

// total rows first, so React can draw pagination
$count = $pdo->prepare("SELECT COUNT(*) FROM products p JOIN brands b ON b.id = p.brand_id WHERE $clause");
$count->execute($params);
$total = (int) $count->fetchColumn();

$limit  = min(max((int) ($_GET['limit'] ?? 12), 1), 48);
$page   = max((int) ($_GET['page'] ?? 1), 1);
$offset = ($page - 1) * $limit;

$sql = "SELECT p.*, b.name AS brand, b.slug AS brand_slug
          FROM products p JOIN brands b ON b.id = p.brand_id
         WHERE $clause
         ORDER BY $order
         LIMIT $limit OFFSET $offset";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);

respond([
    'products' => attach_images($pdo, $stmt->fetchAll()),
    'total'    => $total,
    'page'     => $page,
    'pages'    => (int) ceil($total / $limit),
]);
