const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const email = 'admin@gmail.com'; // Updated to requested email
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let user = await User.findOne({ email });
    if (user) {
        user.password = hashedPassword;
        user.role = 'admin';
        await user.save();
        console.log('Updated existing admin user');
    } else {
        await User.create({
            name: 'Admin User',
            email,
            password: hashedPassword,
            role: 'admin',
            profileComplete: true
        });
        console.log('Created new admin user');
    }
    process.exit(0);
}).catch(console.error);
