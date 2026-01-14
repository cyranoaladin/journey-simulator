const mongoose = require('mongoose');
const User = require('./models/User'); // Assurez-vous du chemin
const bcrypt = require('bcryptjs');

const MONGO_URI = "mongodb://localhost:27018/mfai-r-series";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connecté à Mongo.");

    const email = "rescue@mfai.app";
    const password = "RescuePass2026!";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Nettoyage préventif
    await User.deleteOne({ email });

    const user = new User({
      email,
      password: hashedPassword,
      username: "RescueOne",
      role: "admin",
      isVerified: true
    });

    await user.save();
    console.log(`✅ Utilisateur créé : ${email} / ${password}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur Seed:", error);
    process.exit(1);
  }
}

seed();
