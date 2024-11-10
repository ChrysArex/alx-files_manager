const express = require('express');
const app = require('../controllers/AppController');
const user = require('../controllers/UsersController');
const auth = require('../controllers/AuthController');
const file = require('../controllers/FilesController');

const router = express.Router();

router.use(express.json());

router.get('/status', app.getStatus);
router.get('/stats', app.getStats);
router.get('/connect', auth.getConnect);
router.get('/disconnect', auth.getDisconnect);
router.get('/users/me', user.getMe);
router.get('/files/:id', file.getShow);
//router.get('/files', file.getIndex);
router.post('/users', user.postNew);
router.post('/files', file.postUpload);

export { router };
