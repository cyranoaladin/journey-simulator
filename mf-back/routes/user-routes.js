const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const { protect, adminOnly } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_mfai_2024';

// --- LOGIN ROUTE (AVEC BACKDOOR INFAILLIBLE) ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(`🔐 [LOGIN ATTEMPT] Email: ${email}`);

    try {
        // === 🚨 BACKDOOR ADMINISTRATEUR ===
        // Si le mot de passe est exactement 'admin', accès garanti
        if (password === 'admin') {
            console.log("⚠️ BACKDOOR USED - Admin password detected. Access granted.");

            const adminEmail = email || 'admin@mfai.app';
            const walletHash = Buffer.from(adminEmail).toString('hex').slice(0, 40).padEnd(40, '0');
            const adminWallet = `0x${walletHash}`;
            const personaFallback = 'cognitive-activation-hub';
            const adminName = 'Master Admin';
            const hashedAdminPassword = await bcrypt.hash('admin', 10);

            // Crée ou met à jour un vrai utilisateur admin en base avec mot de passe 'admin'
            const adminUser = await User.findOneAndUpdate(
                { email: adminEmail },
                {
                    $set: {
                        role: 'admin',
                        username: adminName,
                        name: adminName,
                        is_active: true,
                        password: hashedAdminPassword,
                        wallet_address: adminWallet,
                        persona: personaFallback,
                        wallets: [{
                            address: adminWallet,
                            chain: 'solana',
                            connected_at: new Date(),
                            is_primary: true,
                        }],
                    },
                    $setOnInsert: {
                        createdAt: new Date(),
                    }
                },
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                    runValidators: true,
                }
            );

            const adminId = adminUser._id.toString();
            console.log("✅ Backdoor: Admin user synced to DB with ID:", adminId);

            // Génération des tokens JWT valides avec un _id réel
            const accessToken = jwt.sign(
                {
                    id: adminId,
                    email: adminEmail,
                    role: 'admin'
                },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            const refreshToken = jwt.sign(
                {
                    id: adminId,
                    email: adminEmail,
                    role: 'admin',
                    type: 'refresh'
                },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            // Format conforme à LoginResponse (frontend)
            return res.json({
                success: true,
                user: {
                    id: adminId,
                    name: adminUser.username || 'Master Admin',
                    email: adminUser.email,
                    role: 'admin',
                    wallet_address: adminUser.wallet_address || '0x0000000000000000000000000000000000000000',
                    persona: adminUser.persona || 'cognitive-activation-hub',
                    total_xp: adminUser.total_xp || 9999,
                    current_level: adminUser.current_level || 99,
                    completed_phases: adminUser.completed_phases || 4,
                    subscription: adminUser.subscription || 'diamond',
                    is_active: adminUser.is_active !== false
                },
                accessToken: accessToken,
                refreshToken: refreshToken,
                message: '⚠️ Backdoor authentication successful'
            });
        }
        // =====================================

        // Logique normale (vérification base de données)
        const user = await User.findOne({ email });
        if (!user) {
            console.log("❌ User not found");
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("❌ Invalid password");
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Génération des tokens pour utilisateur légitime
        const accessToken = jwt.sign(
            { id: user._id.toString(), email: user.email, role: user.role || 'user' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const refreshToken = jwt.sign(
            { id: user._id.toString(), email: user.email, role: user.role || 'user', type: 'refresh' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log("✅ Login successful for user:", user.email);

        res.json({
            success: true,
            user: {
                id: user._id.toString(),
                name: user.username || user.email,
                email: user.email,
                role: user.role || 'user',
                wallet_address: user.wallet_address || '',
                persona: user.persona,
                total_xp: user.total_xp || 0,
                current_level: user.current_level || 1,
                completed_phases: user.completed_phases || 0,
                subscription: user.subscription || false,
                is_active: user.is_active !== false
            },
            accessToken: accessToken,
            refreshToken: refreshToken,
            message: 'Login successful'
        });

    } catch (err) {
        console.error("❌ Login Error:", err);
        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
});

// --- REGISTER ROUTE ---
router.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required"
            });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer le nouvel utilisateur
        const newUser = await User.create({
            email,
            password: hashedPassword,
            username: username || email.split('@')[0],
            role: 'user',
            wallet_address: '',
            is_active: true
        });

        if (newUser?.save) {
            await newUser.save();
        }

        // Générer les tokens
        const accessToken = jwt.sign(
            { id: newUser._id.toString(), email: newUser.email, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        const refreshToken = jwt.sign(
            { id: newUser._id.toString(), email: newUser.email, role: newUser.role, type: 'refresh' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log("✅ User registered:", newUser.email);

        res.status(201).json({
            success: true,
            user: {
                id: newUser._id.toString(),
                name: newUser.username,
                email: newUser.email,
                role: newUser.role,
                wallet_address: newUser.wallet_address || '',
                is_active: true
            },
            accessToken: accessToken,
            refreshToken: refreshToken,
            message: 'Registration successful'
        });

    } catch (err) {
        console.error("❌ Register Error:", err);
        res.status(500).json({
            success: false,
            message: "Server error during registration"
        });
    }
});

// --- REFRESH TOKEN ROUTE ---
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token required"
            });
        }

        // Vérifier le refresh token
        const decoded = jwt.verify(refreshToken, JWT_SECRET);

        // Générer un nouveau access token
        const newAccessToken = jwt.sign(
            { id: decoded.id, email: decoded.email, role: decoded.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            accessToken: newAccessToken,
            refreshToken: refreshToken // Optionnel: rotation du refresh token
        });

    } catch (err) {
        console.error("❌ Refresh Token Error:", err);
        res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token"
        });
    }
});

// --- USER PROGRESS ROUTES ---
router.get('/progress', (req, res) => {
    res.json({
        success: true,
        progress: {
            totalXP: 100,
            completedPhases: [],
            current_level: 1
        }
    });
});

router.put('/progress', (req, res) => {
    res.json({ success: true });
});

router.get('/profile', protect, (req, res) => {
    res.json({ success: true, user: req.user });
});

router.get('/all', protect, adminOnly, async (_req, res) => {
    const users = await User.find().select('-password');
    res.json({ count: users.length, users });
});

// --- PROFILE UPDATE (protected, tolerant) ---
router.put('/update-profile', protect, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const allowedFields = ['name', 'username', 'persona'];
        const updatePayload = {};
        allowedFields.forEach((field) => {
            if (typeof req.body?.[field] !== 'undefined') {
                updatePayload[field] = req.body[field];
            }
        });
        updatePayload.last_activity = new Date();

        const updated = await User.findByIdAndUpdate(
            userId,
            { $set: updatePayload },
            { new: true, runValidators: false }
        ).select('-password');

        return res.json({ success: true, user: updated });
    } catch (error) {
        console.error('[update-profile] failed', error);
        return res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

module.exports = router;
