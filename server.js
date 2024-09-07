const express = require('express');
const app = express();
const routes = require('./routes/index.js');

const PORT = process.env['PORT'] ? process.env['PORT'] : 5000;

app.use(routes.router);
app.listen(PORT);
