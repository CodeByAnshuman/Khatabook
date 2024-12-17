const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('connected to database');
})
.catch((err) => {
    console.error('Failed to connect to database:', err);
});

module.exports = mongoose.connection; ;
