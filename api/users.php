<?php
require_once __DIR__ . '/../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $result = $authClient->signInWithPassword([
            'email' => $data['email'],
            'password' => $data['password']
        ]);
        
        $_SESSION['user'] = $result['data']['user'];
        $response = ['status' => 'success', 'user' => $_SESSION['user']];
    } catch (Exception $e) {
        $response['message'] = 'Login failed: ' . $e->getMessage();
    }
}

elseif (isset($_GET['action']) && $_GET['action'] === 'register') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $result = $authClient->signUp([
            'email' => $data['email'],
            'password' => $data['password']
        ]);
        
        $response = ['status' => 'success', 'message' => 'Registration successful'];
    } catch (Exception $e) {
        $response['message'] = 'Registration failed: ' . $e->getMessage();
    }
}

elseif (isset($_GET['action']) && $_GET['action'] === 'update_preference') {
    if (!isset($_SESSION['user'])) {
        $response['message'] = 'Unauthorized';
        echo json_encode($response);
        exit;
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    try {
        $result = $dbClient->from('user_preferences')
            ->upsert([
                'user_id' => $_SESSION['user']['id'],
                'theme' => $data['theme']
            ])
            ->execute();
        
        $response = ['status' => 'success'];
    } catch (Exception $e) {
        $response['message'] = 'Failed to update preference: ' . $e->getMessage();
    }
}

// User search implementation
if (isset($_GET['search'])) {
    $searchTerm = '%' . $_GET['search'] . '%';
    
    try {
        $users = $dbClient->from('users')
            ->select('id, email')
            ->ilike('email', $searchTerm)
            ->limit(5)
            ->execute()
            ->getResult();
        
        echo json_encode($users);
    } catch (Exception $e) {
        echo json_encode(['message' => 'Search failed: ' . $e->getMessage()]);
    }
    exit;
}

echo json_encode($response);