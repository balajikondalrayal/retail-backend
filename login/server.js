import express from 'express';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import registerRouter from './register/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_ACCESS_TOKEN = process.env.ACCESS_TOKEN || '';

const loginPath = new URL('./login.txt', import.meta.url);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename) + '/ejs';

app.set('view engine', 'ejs');
app.set('views', __dirname);

app.use('/register', registerRouter);

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  // Validate username and password 
  // (this is just a placeholder, implement your own logic to check credentials from DB)
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  const loginData = JSON.parse(fs.readFileSync(loginPath, 'utf-8')); 
  const user = loginData.find((u) => (u.username === username || u.email === username) && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const token = jwt.sign({ user: username }, JWT_ACCESS_TOKEN, { expiresIn: '15s' });
  res.json({ token });
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});