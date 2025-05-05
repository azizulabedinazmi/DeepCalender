<?php
require_once __DIR__ . '/../includes/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_SESSION['user']['id'] ?? null;

try {
    switch ($method) {
        case 'GET':
            $date = $_GET['date'] ?? date('Y-m-d');
            $tasks = $dbClient->from('tasks')
                ->select('*')
                ->eq('user_id', $userId)
                ->eq('due_date', $date)
                ->execute()
                ->getResult();
            echo json_encode($tasks);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $task = [
                'user_id' => $userId,
                'task' => $data['task'],
                'due_date' => $data['due_date'],
                'is_completed' => false
            ];
            $result = $dbClient->from('tasks')->insert($task)->execute();
            echo json_encode(['status' => 'success', 'id' => $result['id']]);
            break;

        case 'PATCH':
            $data = json_decode(file_get_contents('php://input'), true);
            $dbClient->from('tasks')
                ->update(['is_completed' => $data['is_completed']])
                ->eq('id', $_GET['id'])
                ->execute();
            echo json_encode(['status' => 'success']);
            break;

        case 'DELETE':
            $dbClient->from('tasks')
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