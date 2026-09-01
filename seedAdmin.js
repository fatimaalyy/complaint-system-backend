require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Google DNS force setup

const mongoose = require('mongoose');
const User = require('./models/Users');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    await User.deleteOne({ email: 'admin@system.com' });

    await User.create({
      name: 'System Admin',
      email: 'admin@system.com',
      password: 'adminpassword123',
      role: 'ADMIN',
      isApproved: true,
      isActive: true
    });

    console.log('Initial Admin Account Created Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();