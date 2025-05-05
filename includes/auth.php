// includes/auth.php
function canViewEvent($eventId) {
    $event = $dbClient->from('events')
        ->select('user_id, shared_with')
        ->eq('id', $eventId)
        ->execute()
        ->getResult();
    
    return $event['user_id'] === $_SESSION['user']['id'] 
        || in_array($_SESSION['user']['id'], $event['shared_with']);
}