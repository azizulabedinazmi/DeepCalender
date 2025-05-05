<?php
require_once __DIR__ . '/../includes/config.php';

$userId = $_SESSION['user']['id'] ?? null;
$now = new DateTime();
$interval = new DateInterval('PT15M'); // 15 minutes

// Get upcoming events
$events = $dbClient->from('events')
    ->select('*')
    ->eq('user_id', $userId)
    ->gte('event_time', $now->format('Y-m-d H:i:s'))
    ->lte('event_time', $now->add($interval)->format('Y-m-d H:i:s'))
    ->execute()
    ->getResult();

// Get due tasks
$tasks = $dbClient->from('tasks')
    ->select('*')
    ->eq('user_id', $userId)
    ->eq('is_completed', false)
    ->lte('due_date', $now->format('Y-m-d H:i:s'))
    ->execute()
    ->getResult();

echo json_encode(compact('events', 'tasks'));