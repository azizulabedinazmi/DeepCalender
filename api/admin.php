<?php
require_once __DIR__ . '/../includes/config.php';

if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    http_response_code(403);
    die(json_encode(['error' => 'Forbidden']));
}

$response = [];

try {
    switch ($_GET['action'] ?? '') {
        case 'list_users':
            $users = $dbClient->from('users')
                ->select('id, email, role, created_at')
                ->execute()
                ->getResult();
            $response = $users;
            break;

        case 'delete_user':
            $dbClient->from('users')
                ->delete()
                ->eq('id', $_GET['id'])
                ->execute();
            $response = ['status' => 'success'];
            break;

        default:
            http_response_code(400);
            $response = ['error' => 'Invalid action'];
    }
} catch (Exception $e) {
    http_response_code(500);
    $response = ['error' => $e->getMessage()];
}

echo json_encode($response);