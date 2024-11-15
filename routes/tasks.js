const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { verifyToken } = require('../utils/auth'); // Pro ověření tokenu

// Endpoint pro přidání nového úkolu
router.post('/add_task', (req, res) => {
    const { token, title} = req.body;
    if (!token) return res.status(401).json({ error: 'Token must be provided' });

    try {
        const user = verifyToken(token);
        if (!user) return res.status(401).json({ error: 'Invalid token' });

        db.query('INSERT INTO task (title) VALUES (?)', [title], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            const taskId = result.insertId;
            db.query(
                'INSERT INTO task_log (created_by, task_id) VALUES (?, ?)',
                [user.id, taskId],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }
                    res.json({ message: 'Task added' });
                }
            );
        });
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Endpoint pro dokončení úkolu
router.post('/complete_task', (req, res) => {
    const { token, task_id } = req.body;
    const user = verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });

    db.query('UPDATE task_log SET is_completed = TRUE, assigned_to = (?) WHERE task_id = (?)', [user.id, task_id], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ message: 'Úkol označen jako dokončený' });
        }
    );
});


// Endpoint pro vymazání dokončených úkolů
router.post('/clear_tasks', (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(401).json({ error: 'Token must be provided' });

    try {
        const user = verifyToken(token);
        if (!user) return res.status(401).json({ error: 'Invalid token' });

        db.query('DELETE FROM task_log WHERE is_completed = TRUE', (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ message: 'Completed tasks cleared' });
        });
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Endpoint pro načtení seznamu úkolů
router.get('/tasks', (req, res) => {
    db.query(
        `SELECT task.id as task_id, task.title, task_log.is_completed, task_log.created_at, 
                user.username AS created_by, assigned.username AS assigned_name
         FROM task_log
         JOIN user ON task_log.created_by = user.id
         LEFT JOIN user as assigned ON task_log.assigned_to = assigned.id
         JOIN task ON task_log.task_id = task.id`,
        (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json(results);
        }
    );
});
module.exports = router;
