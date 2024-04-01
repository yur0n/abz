import express from 'express';

import generateToken from './middlewares/generateToken.js';
import createUser from './middlewares/createUser.js';
import errorHandler from './middlewares/errorHandler.js';
import { getUser, getUsers } from './middlewares/users.js';
import positions from './middlewares/positions.js';
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost';

const app = express();

app.use(express.static('public'));
app.use(express.json());

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', clientOrigin);
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Token, Content-Type');
	next();
});

app.options('*', (req, res) => {
  res.sendStatus(200);
});

app.get('/', (req, res) => {
	res.status(200).json({ success: true, message: 'Welcome to the API' });
});

app.get('/token', generateToken);

app.get('/users', getUsers);

app.post('/users', createUser);

app.get('/users/:id', getUser);

app.get('/positions', positions);

app.all('*', (req, res) => {
	res.status(404).json({ success: false, message: 'Page not found' });
});

app.use(errorHandler);

export default app;