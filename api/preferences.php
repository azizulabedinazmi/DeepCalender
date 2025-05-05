// api/preferences.php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $dbClient->from('user_preferences')
        ->upsert([
            'user_id' => $_SESSION['user']['id'],
            'browser_notifications' => $data['enabled']
        ])
        ->execute();
    
    echo json_encode(['status' => 'success']);
}