import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4000');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.post('/dashboard/session', authenticate, (req, res) => {
  res.setHeader('Set-Cookie', `accessToken=${req.authToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=15`);
  res.sendStatus(204);
});

app.get('/dashboard', authenticate, (req, res) => {
  const username = String(req.user.user).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
  res.send(`Welcome to the dashboard, ${username}`)
});

function authenticate(req, res, next) {
  const authorization = req.headers.authorization;
  let token;

  if (authorization) {
    const [scheme, bearerToken] = authorization.split(' ');
    if (scheme !== 'Bearer' || !bearerToken) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    token = bearerToken;
  } else {
    token = req.headers.cookie
      ?.split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith('accessToken='))
      ?.slice('accessToken='.length);
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    req.authToken = token;
    req.user = decoded;
    next();
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});