const express =  require('express');
const authRouter = express.Router();

const {
    handleRegister,
    handleLogin,
    } = require('../controllers/functions');

authRouter.route('/register')
.post(handleRegister);

authRouter.route('/login')
.post(handleLogin);

module.exports = authRouter;