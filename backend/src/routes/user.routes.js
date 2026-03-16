const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate.middleware');

router.get('/search', userController.searchUsers);
router.get('/:id', userController.getUserById);

router.get('/', authenticate, userController.getAllUsers);
router.get('/me/profile', authenticate, userController.getMyProfile);
router.put('/me/profile', authenticate, userController.updateUser);
router.put('/me/password', authenticate, userController.changePassword);
router.delete('/me/profile', authenticate, userController.deleteUser);

module.exports = router;
