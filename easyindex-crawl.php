<?php
// This handler only reads the exact public HTML files already served by the site.
// Keep this allowlist and the .htaccess page pattern in sync when adding pages.
$pages = [
    '/en/' => 'en/index.html',
    '/en/index.html' => 'en/index.html',
    '/en/privacy-policy/' => 'en/privacy-policy/index.html',
    '/en/privacy-policy/index.html' => 'en/privacy-policy/index.html',
    '/en/terms-of-service/' => 'en/terms-of-service/index.html',
    '/en/terms-of-service/index.html' => 'en/terms-of-service/index.html',
    '/en/terms-of-use/' => 'en/terms-of-use/index.html',
    '/en/terms-of-use/index.html' => 'en/terms-of-use/index.html',
    '/' => 'index.html',
    '/index.html' => 'index.html',
    '/politica-de-privacidade/' => 'politica-de-privacidade/index.html',
    '/politica-de-privacidade/index.html' => 'politica-de-privacidade/index.html',
    '/pt/' => 'pt/index.html',
    '/pt/index.html' => 'pt/index.html',
    '/pt/politica-de-privacidade/' => 'pt/politica-de-privacidade/index.html',
    '/pt/politica-de-privacidade/index.html' => 'pt/politica-de-privacidade/index.html',
    '/pt/termos-de-servico/' => 'pt/termos-de-servico/index.html',
    '/pt/termos-de-servico/index.html' => 'pt/termos-de-servico/index.html',
    '/pt/termos-de-uso/' => 'pt/termos-de-uso/index.html',
    '/pt/termos-de-uso/index.html' => 'pt/termos-de-uso/index.html',
    '/termos-de-servico/' => 'termos-de-servico/index.html',
    '/termos-de-servico/index.html' => 'termos-de-servico/index.html',
    '/termos-de-uso/' => 'termos-de-uso/index.html',
    '/termos-de-uso/index.html' => 'termos-de-uso/index.html',
];
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = explode('?', $_SERVER['REQUEST_URI'] ?? '/', 2)[0];
if (!isset($pages[$path]) || !in_array($method, ['GET', 'HEAD'], true)) {
    http_response_code(404);
    exit;
}
$file = __DIR__ . '/' . $pages[$path];
if (!is_readable($file)) {
    http_response_code(404);
    exit;
}
$ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
$isCrawler = preg_match('~bot|crawl|spider|gpt|claude|anthropic|perplexity|google-extended|cohere|mistral|meta-external|ccbot|easyindex~i', $ua) === 1;
header('Content-Type: text/html; charset=utf-8');
if ($isCrawler) {
    header('Cache-Control: no-store');
    header('X-LiteSpeed-Cache-Control: no-cache');
}
if ($method !== 'HEAD') {
    readfile($file);
}
if (!$isCrawler) {
    exit;
}

// Finish the client response before doing any outbound I/O. If the server
// cannot do background work, serve the page normally and skip the record.
ignore_user_abort(true);
if (function_exists('litespeed_finish_request')) {
    litespeed_finish_request();
} elseif (function_exists('fastcgi_finish_request')) {
    fastcgi_finish_request();
} else {
    exit;
}

try {
    if (!function_exists('curl_init')) {
        exit;
    }
    $body = json_encode([
        't' => 'crawl',
        'site' => 'ei_site_7l3gzL41y6kfq4cU',
        'ua' => $ua,
        'path' => $path,
    ]);
    if ($body === false) {
        exit;
    }
    $curl = curl_init('https://easyindex.app/api/ingest');
    if ($curl === false) {
        exit;
    }
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT_MS => 1000,
        CURLOPT_TIMEOUT_MS => 2000,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    @curl_exec($curl);
    curl_close($curl);
} catch (Throwable $error) {
    // Tracking must never affect the page or expose an error to the visitor.
}
