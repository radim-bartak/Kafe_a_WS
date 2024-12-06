const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const QRCode = require('qrcode');
const http = require('http');

const app = express();
const server = http.createServer(app);
const port = 3001;
app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' blob: data:; script-src 'self'; style-src 'self'");
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

const { registerUser, loginUser } = require('./utils/auth');
require('./utils/websocket')(server);

app.post('/auth/register', registerUser);
app.post('/auth/login', loginUser);

app.use('/tasks', require('./routes/tasks'));
app.use('/orders', require('./routes/orders'));

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

app.post('/generate_qr', (req, res) => {
    const { text } = req.body;
    QRCode.toDataURL(text, (err, url) => {
        if (err) throw err;
        res.json({ url });
    });
});

app.use(express.static(path.join(__dirname, 'public')));



app.listen(3000, () => {
    console.log('Server started on port 3000');
});