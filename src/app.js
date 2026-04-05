const express = require('express');
const path = require('path');
const uploadRoutes = require('./routes/upload');
const donateRoutes = require('./routes/donate');
require('./services/cronService');
const app = express();
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/docs.html'));
});
app.use('/', uploadRoutes);
app.use('/', donateRoutes);
module.exports = app;
