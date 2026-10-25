import express from 'express';
import fs from 'fs';

const router = express.Router();
const loginPath = new URL('../login.txt', import.meta.url);

router.get('/', (req, res) => {
  res.render('register');
});

router.post('/', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  const userDetails = fs.readFileSync(loginPath, 'utf-8');
  const users = JSON.parse(userDetails);
  const existingUser = users.find((user) => user.username === username || user.email === email);

  if (existingUser) {
    return res.status(409).json({ error: 'Username or email already exists' });
  }

  const newUser = { username, email, password };
  users.push(newUser);
  fs.writeFileSync(loginPath, JSON.stringify(users, null, 2));

  return res.redirect('/login?message=User+registered+successfully');
});

export default router;