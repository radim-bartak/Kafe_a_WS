const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const { verifyToken } = require('../utils/auth');

router.post('/order', (req, res) => {
    const { token, coffee, doppio, espresso, long, milk } = req.body;
    const user = verifyToken(token);
    if (!user) return res.status(401).json({ error: 'Invalid token' });

    db.query(
        'INSERT INTO coffee_log (user_id, coffee_id, count) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?)',
        [user.id, 1, coffee, user.id, 2, doppio, user.id, 3, espresso, user.id, 4, long, user.id, 5, milk], 
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ message: 'Objednávka úspěšně přijata' });
        }
    );
});

router.get('/summary', (req, res) => {
    db.query(
        `SELECT user.username,
                SUM(CASE WHEN coffee_id = 1 THEN count ELSE 0 END) AS total_coffee,
                SUM(CASE WHEN coffee_id = 2 THEN count ELSE 0 END) AS total_doppio,
                SUM(CASE WHEN coffee_id = 3 THEN count ELSE 0 END) AS total_espresso,
                SUM(CASE WHEN coffee_id = 4 THEN count ELSE 0 END) AS total_long,
                SUM(CASE WHEN coffee_id = 5 THEN count ELSE 0 END) AS total_milk
         FROM coffee_log
         JOIN user ON coffee_log.user_id = user.id
         GROUP BY user.username`,
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