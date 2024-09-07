const express = require('express');
const endpoints = require('../controllers/AppController');
const router = express.Router();

router.get('/status', endpoints.getStatus);
router.get('/stats', endpoints.getStats);

export {router};
