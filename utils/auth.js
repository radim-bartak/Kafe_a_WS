const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db');

function verifyToken(token) {
    try {
        return jwt.verify(token, 'secretkey');
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

function registerUser(req, res){
    const { username, password } = req.body;

    db.query('SELECT * FROM user WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length > 0) {
            return res.status(400).json({ error: 'Username already in use' });
        }

        db.query('INSERT INTO user (username, password) VALUES (?, ?)', [username, password], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Internal server error' });
            }
            const token = jwt.sign({ id: result.insertId }, 'secretkey', { expiresIn: '1h' });
            res.json({ message: 'User registered', token });
        });
    });
}

function loginUser(req, res){
    const { username, password } = req.body;

    db.query('SELECT username, password FROM user WHERE username = ?', [username], (err, result) => {
        if (err) throw err;
        if (password === result[0].password) {
            const token = jwt.sign({ id: result[0].id }, 'secretkey', { expiresIn: '1h' });
            res.json({ token });
        } else {
            res.status(400).send('Invalid credentials');
        }
    });
}

module.exports = {
    verifyToken,
    registerUser,
    loginUser
};