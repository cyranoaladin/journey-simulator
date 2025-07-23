var express = require('express');
var router = express.Router();
const userController = require('../controllers/user-controller');
/* GET users listing. */
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/profile', userController.getUserProfile);
router.put('/update-profile', userController.updateUserProfile);
router.delete('/delete-profile', userController.deleteUser);
router.get('/all', userController.getAllUsers);
router.put('/role/:id', userController.changeUserRole);
router.put('/subscription/:id', userController.subscription)

module.exports = router;