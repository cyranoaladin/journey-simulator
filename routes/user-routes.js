var express = require('express');
var router = express.Router();
const userController = require('../controllers/user-controller');
/* GET users listing. */
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
router.delete('/profile', userController.deleteUser);
router.get('/all', userController.getAllUsers);
router.put('/role/:id', userController.changeUserRole);

module.exports = router;