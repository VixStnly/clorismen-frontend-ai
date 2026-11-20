<?php

/**
 * BFF (Backend For Frontend) landing page Clorismen.
 * Browser memanggil /bff/... (same-origin), file ini meneruskan ke Storefront API
 * di backend dengan API key + HMAC signature. Secret disimpan di ../server/config.local.php.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: same-origin');
header('Cache-Control: no-store');

function bff_fail(int $status, string $code, string $message): never
{
    http_response_code($status);
    echo json_encode(['ok' => false, 'error' => $code, 'message' => $message]);
    exit;
}

/**
 * IP pengunjung asli. Di server (Coolify/Traefik) REMOTE_ADDR adalah IP proxy internal,
 * sehingga semua pengunjung akan terhitung sebagai satu orang di pembatas order.
 * Header dari proxy hanya dipercaya bila request memang datang dari jaringan internal.
 */
function bff_visitor_ip(): string
{
    $remote = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
    $isInternal = $remote !== '' && filter_var($remote, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false;
    if (! $isInternal) {
        return $remote;
    }

    $realIp = trim((string) ($_SERVER['HTTP_X_REAL_IP'] ?? ''));
    if ($realIp !== '' && filter_var($realIp, FILTER_VALIDATE_IP)) {
        return $realIp;
    }

    // Ambil entri paling kanan: itu yang ditambahkan proxy kita sendiri, bukan isian pengunjung
    $forwarded = array_filter(array_map('trim', explode(',', (string) ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? ''))));
    $last = (string) end($forwarded);

    return filter_var($last, FILTER_VALIDATE_IP) ? $last : $remote;
}

$serverDir = dirname(__DIR__) . '/server';
$configFile = $serverDir . '/config.local.php';

require_once $serverDir . '/StorefrontClient.php';

if (is_file($configFile)) {
    $config = require $configFile;
} elseif (getenv('STOREFRONT_API_KEY') && getenv('STOREFRONT_API_SECRET')) {
    $config = [
        'api_base' => rtrim((string) (getenv('STOREFRONT_API_BASE') ?: getenv('STOREFRONT_API_URL') ?: 'http://clorismen.local'), '/'),
        'api_key' => (string) getenv('STOREFRONT_API_KEY'),
        'api_secret' => (string) getenv('STOREFRONT_API_SECRET'),
    ];
} else {
    bff_fail(503, 'bff_not_configured', 'BFF belum dikonfigurasi. Atur STOREFRONT_API_BASE, STOREFRONT_API_KEY, dan STOREFRONT_API_SECRET di Environment Variable, atau buat file server/config.local.php.');
}

// Path setelah /bff/, contoh: products/charcoal-soap-bar-80gr
$uriPath = (string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$route = trim((string) preg_replace('#^.*?/bff/?#', '', $uriPath), '/');
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Whitelist rute. Apa pun di luar ini ditolak, jadi BFF tidak bisa dipakai sebagai open proxy.
$routes = [
    ['GET', '#^config$#', 'config', 30],
    ['GET', '#^products$#', 'products', 30],
    ['GET', '#^products/([a-z0-9-]{1,120})$#', 'products/%s', 30],
    ['GET', '#^reviews$#', 'reviews', 120],
    ['GET', '#^destinations$#', 'destinations', 86400], // autocomplete kecamatan (RajaOngkir), cache per kata kunci
    ['POST', '#^order-intents$#', 'order-intents', 0],
    ['GET', '#^order-intents/([A-Za-z0-9-]{4,24})$#', 'order-intents/%s', 0],
    ['GET', '#^order-intents/([A-Za-z0-9-]{4,24})/status$#', 'order-intents/%s/status', 0],
    ['POST', '#^order-intents/([A-Za-z0-9-]{4,24})/verify-payment$#', 'order-intents/%s/verify-payment', 0],
];

$target = null;
$cacheTtl = 0;
foreach ($routes as [$m, $pattern, $tpl, $ttl]) {
    if ($m === $method && preg_match($pattern, $route, $match)) {
        $target = '/api/v1/storefront/' . sprintf($tpl, $match[1] ?? '');
        $cacheTtl = $ttl;
        break;
    }
}
if ($target === null) {
    bff_fail(404, 'not_found', 'Endpoint tidak dikenal.');
}

// Query yang diizinkan saja
$query = [];
foreach (['category', 'featured', 'q'] as $allowed) {
    if (isset($_GET[$allowed]) && is_string($_GET[$allowed]) && $_GET[$allowed] !== '') {
        $query[$allowed] = substr($_GET[$allowed], 0, 80);
    }
}

$visitorIp = bff_visitor_ip();
$visitorAgent = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
$client = new StorefrontClient((string) $config['api_base'], (string) $config['api_key'], (string) $config['api_secret']);

if ($method === 'POST') {
    // Hanya terima POST dari halaman kita sendiri (cegah form/skrip dari situs lain)
    $origin = (string) ($_SERVER['HTTP_ORIGIN'] ?? '');
    $host = (string) ($_SERVER['HTTP_HOST'] ?? '');
    if ($origin !== '' && parse_url($origin, PHP_URL_HOST) !== parse_url('http://' . $host, PHP_URL_HOST)) {
        bff_fail(403, 'forbidden_origin', 'Origin tidak diizinkan.');
    }
    if (stripos((string) ($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json') === false) {
        bff_fail(415, 'unsupported_media_type', 'Gunakan application/json.');
    }

    $raw = file_get_contents('php://input', false, null, 0, 20000);
    $payload = json_decode((string) $raw, true);
    if (! is_array($payload)) {
        bff_fail(400, 'invalid_json', 'Body JSON tidak valid.');
    }

    $forward = str_ends_with($target, '/verify-payment')
        ? array_filter(['trx_id' => preg_match('/^\d{1,20}$/', (string) ($payload['trx_id'] ?? '')) ? (string) $payload['trx_id'] : null])
        : [
            'items' => array_slice(array_values(array_filter((array) ($payload['items'] ?? []), 'is_array')), 0, 20),
            'customer' => (array) ($payload['customer'] ?? []),
        ];

    $result = $client->request('POST', $target, [], $forward, $visitorIp, $visitorAgent);

    http_response_code($result['status']);
    echo $result['body'];
    exit;
}

// GET: cache file singkat supaya backend tidak dipanggil tiap pengunjung
$cacheDir = $serverDir . '/cache';
$cacheKey = $cacheDir . '/' . hash('sha256', $target . '?' . StorefrontClient::canonicalQuery($query)) . '.json';
if ($cacheTtl > 0 && is_file($cacheKey) && (time() - filemtime($cacheKey)) < $cacheTtl) {
    header('X-Bff-Cache: HIT');
    echo file_get_contents($cacheKey);
    exit;
}

$result = $client->request('GET', $target, $query, null, $visitorIp, $visitorAgent);
if ($result['status'] === 200 && $cacheTtl > 0 && is_dir($cacheDir) && is_writable($cacheDir)) {
    @file_put_contents($cacheKey, $result['body'], LOCK_EX);
}

header('X-Bff-Cache: MISS');
http_response_code($result['status']);
echo $result['body'];
