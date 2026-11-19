<?php
// Salin jadi config.local.php (file itu TIDAK ikut Git), lalu isi dengan API key dari ERP:
//   Login ERP sebagai God Admin -> Landing Page CMS -> tab "API Key & Keamanan" -> buat key baru.
// Atau, di server (Coolify), cukup isi Environment Variable:
//   STOREFRONT_API_BASE, STOREFRONT_API_KEY, STOREFRONT_API_SECRET
return [
    'api_base' => 'http://clorismen.local',
    'api_key' => 'clm_pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    'api_secret' => 'clm_sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
];
