const express = require('express');
const app = express();
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

require('dotenv').config();
const mongoose = require('mongoose');
const usermodel = require('./models/user');
const Hisab = require('./models/hisabs');

const db = require('./config/mongoose-connection');


const session = require('express-session');
const { configDotenv } = require('dotenv');

app.use(
    session({
        secret: 'your_secret_key',
        resave: false,
        saveUninitialized: false,
    })
);

// Middleware to check if a user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/login');
}

app.use(morgan('dev'));

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure the 'hisab' directory exists on startup
const fileDirectory = path.join(__dirname, 'hisab');
if (!fs.existsSync(fileDirectory)) {
    fs.mkdirSync(fileDirectory);
}

app.get('/home', async function(req, res) {
    try {
        const userId = req.session.userId;
        const user = await usermodel.findById(userId).populate('hisabs'); // Populate the hisabs field with actual data

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Pass the 'hisabs' data to the view
        res.render('index', { hisabs: user.hisabs });
    } catch (err) {
        console.error('Error fetching hisabs:', err);
        res.status(500).send('Server error');
    }
});

app.get('/', (req, res) => {
    res.render('login');
});
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to log out');
        }
        res.redirect('/login');  // Redirect to the login page after logout
    });
});

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await usermodel.findOne({ email });
    if (existingUser) {
        return res.status(400).send('User already exists. Please login.');
    }

    // Create new user
    const newUser = await usermodel.create({ name, email, password });

    res.redirect('/login');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists and password matches
    const user = await usermodel.findOne({ email });
    if (!user || user.password !== password) {
        return res.status(400).send('Invalid credentials. Please try again.');
    }
    req.session.userId = user._id;
    res.redirect('/home');
});

app.get('/create', function(req, res){
    res.render('create');
});

app.get('/edit/:filename', function(req, res){
    fs.readFile(path.join(fileDirectory, req.params.filename), 'utf8', function(err, filedata){
        if(err) return res.status(500).send('Error reading file');
        res.render('edit', {filedata, filename: req.params.filename});
    });
});

app.get('/hisaab/:filename', async (req, res) => {
    const hisab = await Hisab.findOne({ filename: req.params.filename });

    if (!hisab) {
        return res.status(404).send('Hisaab not found');
    }

    // Pass the filename to the view along with filedata
    res.render('hisab', { filedata: hisab.content, filename: hisab.filename });
});


app.get('/delete/:filename', async (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(fileDirectory, filename);

    // Check if the file exists before deleting
    fs.exists(filePath, async (exists) => {
        if (!exists) {
            return res.status(404).send('File not found');
        }

        // Delete the file
        fs.unlink(filePath, async (err) => {
            if (err) {
                return res.status(500).send('Error deleting file');
            }

            // After deleting the file, remove the reference from the user's `hisabs`
            const userId = req.session.userId;
            const user = await usermodel.findById(userId).populate('hisabs');

            if (!user) {
                return res.status(404).send('User not found');
            }

            // Find the hisab document to delete from the user’s hisabs
            const hisab = await Hisab.findOne({ filename });

            if (hisab) {
                // Remove the hisab from the user's hisabs array
                user.hisabs.pull(hisab._id);
                await user.save();

                // Also delete the hisab document from the database
                await hisab.deleteOne();
            }

            // Redirect to the home page after deletion
            res.redirect('/home');
        });
    });
});


app.post('/createhisaab', isAuthenticated, async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).send('Title and content are required.');
    }

    const userId = req.session.userId;
    const user = await usermodel.findById(userId);

    if (!user) {
        return res.status(400).send('User not found');
    }

    const fileName = `${title.replace(/\s+/g, '_')}.txt`;

    // Save hisab to DB
    const newHisab = await Hisab.create({
        title,
        filename: fileName,
        content,
        user: userId,
    });

    // Associate hisab with user
    user.hisabs.push(newHisab._id);
    await user.save();

    // Write the file locally
    fs.writeFileSync(path.join(fileDirectory, fileName), content);

    res.redirect('/home');
});

app.post('/update/:filename', function(req, res){
    fs.writeFile(path.join(fileDirectory, req.params.filename), req.body.content, function(err){
        if(err) return res.status(500).send('Error writing file');
        res.redirect('/home');
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
