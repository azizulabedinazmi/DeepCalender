<?php
require_once __DIR__ . '/../vendor/autoload.php'; // Composer autoload

use Supabase\Supabase;

$supabaseUrl = 'YOUR_SUPABASE_URL';
$supabaseKey = 'YOUR_SUPABASE_KEY';

$supabase = new Supabase($supabaseUrl, $supabaseKey);
$authClient = $supabase->auth;
$dbClient = $supabase->database;