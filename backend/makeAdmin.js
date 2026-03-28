const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    await User.findOneAndUpdate({ email: 'admin@admin.com' }, { role: 'admin' });
    console.log('Made admin');
    process.exit(0);
});
