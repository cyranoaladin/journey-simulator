var express = require('express');
var router = express.Router();
const userController = require('../controllers/user-controller');
const { protect, adminOnly } = require('../middleware/auth');

/* Authentication routes */
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/login-wallet', userController.loginWithWallet);
router.post('/logout', userController.logoutUser);
router.post('/refresh', userController.refreshToken);

/* Protected user routes */
router.get('/profile', protect, userController.getUserProfile);
router.put('/update-profile', protect, userController.updateUserProfile);
router.delete('/delete-profile', protect, userController.deleteUser);

/* Admin only routes */
router.get('/all', protect, adminOnly, userController.getAllUsers);
router.put('/role/:id', protect, adminOnly, userController.changeUserRole);
router.put('/subscription/:id', protect, adminOnly, userController.subscription);

/* Token and progress routes */
router.put('/tokens', protect, userController.updateTokenBalance);
router.post('/nft-certificates', protect, userController.addNFTCertificate);

module.exports = router;