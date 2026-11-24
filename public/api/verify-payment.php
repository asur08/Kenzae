<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'METHOD_NOT_ALLOWED',
        'message' => 'Only POST requests are accepted.'
    ]);
    exit;
}

define('KENZAE_BACKEND', true);

// 1. Resolve Credentials (Environment variables, protected credentials.php, or .env)
$keySecret = getenv('RAZORPAY_KEY_SECRET') ?: ($_ENV['RAZORPAY_KEY_SECRET'] ?? ($_SERVER['RAZORPAY_KEY_SECRET'] ?? ''));

// If not in environment, try loading server config files
if (empty($keySecret)) {
    $configFiles = [__DIR__ . '/kenzae-config.php', __DIR__ . '/credentials.php'];
    foreach ($configFiles as $credsFile) {
        if (file_exists($credsFile)) {
            $loadedCreds = include $credsFile;
            if (is_array($loadedCreds) && !empty($loadedCreds['RAZORPAY_KEY_SECRET'])) {
                $keySecret = $loadedCreds['RAZORPAY_KEY_SECRET'];
                break;
            }
        }
    }
}

// If still empty, check .env files
if (empty($keySecret)) {
    $envFiles = [
        __DIR__ . '/../../.env',
        __DIR__ . '/../.env',
        __DIR__ . '/.env'
    ];
    foreach ($envFiles as $envFile) {
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $trimmed = trim($line);
                if (strpos($trimmed, '#') === 0) continue;
                $parts = explode('=', $trimmed, 2);
                if (count($parts) === 2) {
                    $k = trim($parts[0]);
                    $v = trim($parts[1]);
                    putenv("$k=$v");
                    $_ENV[$k] = $v;
                }
            }
            $keySecret = $keySecret ?: (getenv('RAZORPAY_KEY_SECRET') ?: ($_ENV['RAZORPAY_KEY_SECRET'] ?? ''));
            if (!empty($keySecret)) break;
        }
    }
}

// Final fallback to verified active boutique credentials
$keySecret = $keySecret ?: 'rwdIisdXBF5D3KeUa2YtEK7H';

if (empty($keySecret)) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'verified' => false,
        'error' => 'AUTH_FAILED',
        'message' => 'Razorpay secret key is not configured on the server.'
    ]);
    exit;
}

// 2. Parse & Validate JSON payload
$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true);

$orderId = trim($body['razorpay_order_id'] ?? '');
$paymentId = trim($body['razorpay_payment_id'] ?? '');
$signature = trim($body['razorpay_signature'] ?? '');

if (empty($orderId) || empty($paymentId) || empty($signature)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'verified' => false,
        'error' => 'MISSING_FIELDS',
        'message' => 'Missing razorpay_order_id, razorpay_payment_id, or razorpay_signature.'
    ]);
    exit;
}

// 3. Verify HMAC-SHA256 Signature using timing-safe comparison
$expectedSignature = hash_hmac('sha256', $orderId . '|' . $paymentId, $keySecret);

if (hash_equals($expectedSignature, $signature)) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'verified' => true,
        'order_id' => $orderId,
        'payment_id' => $paymentId,
        'message' => 'Payment signature verified successfully.'
    ]);
} else {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'verified' => false,
        'error' => 'SIGNATURE_MISMATCH',
        'message' => 'Invalid payment signature. Payment has NOT been marked as paid.'
    ]);
}
