<?php

/**
 * Klien server-side untuk Storefront API Clorismen ERP.
 * Menandatangani setiap request dengan HMAC-SHA256 (skema CLM1), sehingga secret
 * tidak pernah sampai ke browser. Harus identik dengan
 * clorismen-erp/app/Services/Storefront/RequestSigner.php
 */
final class StorefrontClient
{
    private const VERSION = 'CLM1-HMAC-SHA256';

    public function __construct(
        private string $apiBase,
        private string $apiKey,
        private string $apiSecret,
        private int $timeout = 12
    ) {
        $this->apiBase = rtrim($apiBase, '/');
    }

    public static function canonicalQuery(array $query): string
    {
        ksort($query);

        return http_build_query($query, '', '&', PHP_QUERY_RFC3986);
    }

    public function sign(string $method, string $path, array $query, string $timestamp, string $nonce, string $visitorIp, string $body): string
    {
        $canonical = implode("\n", [
            self::VERSION,
            strtoupper($method),
            '/' . ltrim($path, '/'),
            self::canonicalQuery($query),
            $timestamp,
            $nonce,
            $visitorIp,
            hash('sha256', $body),
        ]);

        return hash_hmac('sha256', $canonical, $this->apiSecret);
    }

    /**
     * @param  array<int, string>  $extraHeaders  header tambahan (mis. X-Clm-Member untuk sesi member)
     * @return array{status: int, body: string, content_type?: string}
     */
    public function request(string $method, string $path, array $query = [], ?array $json = null, string $visitorIp = '', string $visitorAgent = '', array $extraHeaders = []): array
    {
        $method = strtoupper($method);
        $body = $json === null ? '' : json_encode($json, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $timestamp = (string) time();
        $nonce = rtrim(strtr(base64_encode(random_bytes(24)), '+/', '-_'), '=');
        $qs = self::canonicalQuery($query);
        $url = $this->apiBase . '/' . ltrim($path, '/') . ($qs !== '' ? '?' . $qs : '');

        $headers = [
            'Accept: application/json',
            'X-Clm-Key: ' . $this->apiKey,
            'X-Clm-Timestamp: ' . $timestamp,
            'X-Clm-Nonce: ' . $nonce,
            'X-Clm-Visitor-Ip: ' . $visitorIp,
            'X-Clm-Signature: ' . $this->sign($method, $path, $query, $timestamp, $nonce, $visitorIp, $body),
        ];
        if ($visitorAgent !== '') {
            $headers[] = 'X-Clm-Visitor-Agent: ' . substr(preg_replace('/[\r\n]+/', ' ', $visitorAgent), 0, 250);
        }
        if ($json !== null) {
            $headers[] = 'Content-Type: application/json';
        }
        foreach ($extraHeaders as $h) {
            $headers[] = preg_replace('/[\r\n]+/', '', $h);
        }

        if (! function_exists('curl_init')) {
            return $this->requestViaStream($url, $method, $headers, $json !== null ? $body : null);
        }

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_FOLLOWLOCATION => false,
        ]);
        if ($json !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        }

        $response = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $contentType = (string) curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($response === false) {
            return [
                'status' => 502,
                'body' => json_encode(['ok' => false, 'error' => 'backend_unreachable', 'message' => 'Backend tidak bisa dihubungi: ' . $error]),
            ];
        }

        return ['status' => $status ?: 502, 'body' => (string) $response, 'content_type' => $contentType];
    }

    private function requestViaStream(string $url, string $method, array $headers, ?string $body): array
    {
        $httpOptions = [
            'method' => $method,
            'header' => implode("\r\n", $headers) . "\r\n",
            'timeout' => $this->timeout,
            'ignore_errors' => true,
            'follow_location' => 0,
        ];
        if ($body !== null) {
            $httpOptions['content'] = $body;
        }

        $context = stream_context_create(['http' => $httpOptions]);
        $errMsg = '';
        set_error_handler(static function (int $severity, string $message) use (&$errMsg): bool {
            $errMsg = $message;
            return true;
        });
        $response = file_get_contents($url, false, $context);
        restore_error_handler();

        $status = 0;
        $contentType = '';
        if (isset($http_response_header) && is_array($http_response_header)) {
            foreach ($http_response_header as $hdr) {
                if (preg_match('#^HTTP/\S+\s+(\d{3})#', $hdr, $m)) {
                    $status = (int) $m[1];
                } elseif (stripos($hdr, 'Content-Type:') === 0) {
                    $contentType = trim(substr($hdr, 13));
                }
            }
        }

        if ($response === false && $status === 0) {
            return [
                'status' => 502,
                'body' => json_encode(['ok' => false, 'error' => 'backend_unreachable', 'message' => 'Backend tidak bisa dihubungi: ' . $errMsg]),
            ];
        }

        return ['status' => $status ?: 502, 'body' => (string) $response, 'content_type' => $contentType];
    }
}
