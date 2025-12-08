const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: false 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: false // Optionnel car les users Web3 n'en ont pas
  },
  wallet_address: { 
    type: String, 
    required: false, // LA CORRECTION EST ICI (n'est plus requis)
    unique: true,
    sparse: true     // Permet d'avoir plusieurs utilisateurs sans wallet (null)
  },
  wallets: [{
    address: String,
    chain: String,
    is_primary: Boolean
  }],
  persona: { 
    type: String, 
    default: 'investor' 
  },
  role: { 
    type: String, 
    default: 'user',
    enum: ['user', 'admin']
  },
  total_xp: { 
    type: Number, 
    default: 0 
  },
  current_level: { 
    type: Number, 
    default: 1 
  },
  last_activity: { 
    type: Date, 
    default: Date.now 
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', userSchema);
