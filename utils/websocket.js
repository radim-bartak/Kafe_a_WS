const WebSocket = require('ws');
const db = require('./db');

function initializeWebSocket(server) {
    const wss = new WebSocket.Server({ server });
    
    wss.on('connection', (ws) => {
        console.log('New WebSocket client connected');
        ws.on('close', () => console.log('WebSocket client disconnected'));
    });

    
function checkForNewTasks() {
    const query = `
        SELECT task.title, user.username, task_log.created_at, task.id, task_log.is_completed FROM task_log
        inner join user on user.id = task_log.assigned_to inner join task on task.id = task_log.task_id 
        ORDER BY created_at DESC;
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return;
        }

        if (results.length > 0) {
            const message = JSON.stringify({ type: 'tasksUpdate', data: results });
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }else {
            const message = JSON.stringify({ type: 'clearTasks'});
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    });
};
    
    setInterval(checkForNewTasks, 1000);
}

module.exports = initializeWebSocket;
