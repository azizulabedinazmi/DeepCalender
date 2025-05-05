<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../supabase/supabase.php';

$supabase = new Supabase(
    getenv('SUPABASE_URL'),
    getenv('SUPABASE_KEY')
);