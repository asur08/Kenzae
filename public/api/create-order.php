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

// 1. Resolve Credentials (Environment variables with safe boutique fallback)
$envFile = __DIR__ . '/../../.env';
if (!file_exists($envFile)) {
    $envFile = __DIR__ . '/../.env';
}
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
}

$keyId = getenv('RAZORPAY_KEY_ID') ?: ($_ENV['RAZORPAY_KEY_ID'] ?? 'rzp_test_U3fv7ch1nd3HLz');
$keySecret = getenv('RAZORPAY_KEY_SECRET') ?: ($_ENV['RAZORPAY_KEY_SECRET'] ?? '7V1a41KBNEOs0vsAV0RmN9n3');

if (empty($keyId) || empty($keySecret)) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'AUTH_FAILED',
        'message' => 'Razorpay credentials are not configured on the server.'
    ]);
    exit;
}

// 2. Parse & Validate JSON payload
$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true);

$amount = isset($body['amount']) ? intval($body['amount']) : 0;
if ($amount < 100) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'INVALID_AMOUNT',
        'message' => 'Order amount must be at least 100 paise (₹1.00).'
    ]);
    exit;
}

$currency = !empty($body['currency']) ? $body['currency'] : 'INR';
$receipt = !empty($body['receipt']) ? $body['receipt'] : ('rcpt_' . time() . '_' . substr(bin2hex(random_bytes(3)), 0, 5));
$notes = !empty($body['notes']) && is_array($body['notes']) ? $body['notes'] : [];

$payload = [
    'amount' => $amount,
    'currency' => $currency,
    'receipt' => $receipt,
    'notes' => $notes,
    'payment_capture' => 1
];

// 3. Call Razorpay Orders API
$ch = curl_init('https://api.razorpay.com/v1/orders');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_USERPWD, $keyId . ':' . $keySecret);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr = curl_error($ch);
curl_close($ch);

if ($curlErr) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'GATEWAY_ERROR',
        'message' => 'Failed to connect to Razorpay payment gateway: ' . $curlErr
    ]);
    exit;
}

$data = json_decode($response, true);
if ($httpCode >= 200 && $httpCode < 300 && !empty($data['id'])) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'order_id' => $data['id'],
        'id' => $data['id'],
        'amount' => $data['amount'],
        'currency' => $data['currency'],
        'receipt' => $data['receipt'] ?? $receipt,
        'status' => $data['status'] ?? 'created'
    ]);
} else {
    http_response_code($httpCode ?: 500);
    echo json_encode([
        'success' => false,
        'error' => $data['error']['code'] ?? 'ORDER_CREATION_FAILED',
        'message' => $data['error']['description'] ?? 'Razorpay API rejected order creation.'
    ]);
}
