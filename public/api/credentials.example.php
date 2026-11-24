<?php
/**
 * Kenzae Designer Boutique — Server Credentials Template
 * Copy this file to credentials.php and populate with your Razorpay API credentials.
 */
if (!defined('KENZAE_BACKEND')) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=UTF-8');
    exit('Access Denied: Direct execution not permitted.');
}

return [
    'RAZORPAY_KEY_ID' => 'rzp_live_...',
    'RAZORPAY_KEY_SECRET' => '...',
];
