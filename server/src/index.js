import app from './app.js';

const PORT = process.env.PORT || 2052;

app.listen(PORT, () => {
    console.log('Server is up on port: ' + PORT);
})