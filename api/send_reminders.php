<?php
require __DIR__ . '/../includes/mailer.php';
require __DIR__ . '/../includes/config.php';

// Get users with enabled email notifications
$users = $dbClient->from('user_preferences')
    ->select('users.email, users.id')
    ->eq('email_notifications', true)
    ->execute()
    ->getResult();

foreach ($users as $user) {
    // Get upcoming events (next 24 hours)
    $events = $dbClient->from('events')
        ->gte('event_time', date('Y-m-d H:i:s'))
        ->lte('event_time', date('Y-m-d H:i:s', strtotime('+24 hours')))
        ->eq('user_id', $user['id'])
        ->execute()
        ->getResult();

    // Get pending tasks
    $tasks = $dbClient->from('tasks')
        ->eq('is_completed', false)
        ->lte('due_date', date('Y-m-d H:i:s', strtotime('+24 hours')))
        ->execute()
        ->getResult();

    if (!empty($events) || !empty($tasks)) {
        $mail = configureMailer();
        $mail->addAddress($user['email']);
        $mail->Subject = 'Upcoming Calendar Items';
        $mail->Body = renderEmailTemplate($events, $tasks);
        $mail->send();
    }
}

function renderEmailTemplate(array $events, array $tasks): string {
    ob_start(); ?>
    <h1>Upcoming Reminders</h1>
    
    <?php if (!empty($events)): ?>
    <h2>Events</h2>
    <ul>
        <?php foreach ($events as $event): ?>
        <li>
            <strong><?= htmlspecialchars($event['title']) ?></strong><br>
            <?= date('M j, Y g:i a', strtotime($event['event_time'])) ?><br>
            <?= htmlspecialchars($event['location']) ?>
        </li>
        <?php endforeach; ?>
    </ul>
    <?php endif; ?>

    <?php if (!empty($tasks)): ?>
    <h2>Tasks</h2>
    <ul>
        <?php foreach ($tasks as $task): ?>
        <li>
            <?= htmlspecialchars($task['task']) ?> - 
            Due: <?= date('M j, Y', strtotime($task['due_date'])) ?>
        </li>
        <?php endforeach; ?>
    </ul>
    <?php endif;
    
    return ob_get_clean();
}