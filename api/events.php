<?php
require_once __DIR__ . '/../includes/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_SESSION['user']['id'] ?? null;

try {
    switch ($method) {
        case 'GET':
            $start = $_GET['start'] ?? date('Y-m-01');
            $end = $_GET['end'] ?? date('Y-m-t');
            
            $events = $dbClient->from('events')
                ->select('*, users!inner(email)')
                ->or(
                    'user_id.eq.' . $userId,
                    'shared_with.cs.{"' . $userId . '"}'
                )
                ->gte('event_time', $start)
                ->lte('event_time', $end)
                ->execute()
                ->getResult();
                
            echo json_encode($events);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            if ($_GET['action'] === 'share') {
                $data = json_decode(file_get_contents('php://input'), true);
                
                // Verify ownership
                $event = $dbClient->from('events')
                    ->select('user_id')
                    ->eq('id', $data['event_id'])
                    ->execute()
                    ->getResult();
                
                if ($event['user_id'] !== $_SESSION['user']['id']) {
                    http_response_code(403);
                    die(json_encode(['error' => 'Unauthorized']));
                }
                
                $dbClient->from('events')
                    ->update(['shared_with' => $data['user_ids']])
                    ->eq('id', $data['event_id'])
                    ->execute();
                
                echo json_encode(['status' => 'success']);
                break;
            }

            $eventData = [
                'user_id' => $userId,
                'title' => $data['title'],
                'event_time' => $data['event_time'],
                'location' => $data['location'] ?? null,
                'description' => $data['description'] ?? null,
            ];

            if (!empty($data['id'])) {
                $dbClient->from('events')
                    ->update($eventData)
                    ->eq('id', $data['id'])
                    ->execute();
            } else {
                $result = $dbClient->from('events')->insert($eventData)->execute();
                $eventData['id'] = $result['id'];
            }

            echo json_encode($eventData);
            break;

        case 'DELETE':
            $dbClient->from('events')
                ->delete()
                ->eq('id', $_GET['id'])
                ->execute();
            echo json_encode(['status' => 'success']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}