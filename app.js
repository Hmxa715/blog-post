const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { sequelize, Post, Comment } = require('./models');
const port = 3000;

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
// Session configuration
app.use(session({
    secret: 'welcome2dpl!', 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to make user info available in views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

const bcrypt = require('bcrypt');

// Mock user database (replace with your database logic)
let users = [];

// Registration route
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    res.redirect('/login');
});

// Login route
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = user; // Save user to session
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/login');
}

// Protect the routes you want
// Route to display all posts with comments
app.get('/', isAuthenticated, async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: [{ 
                model: Comment, 
                as: 'comments' // Ensure this alias matches the one defined in the model
            }]
        });
        res.render('index', { posts });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Route to display a single post with comments
app.get('/post/:id', async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id, {
            include: [{ 
                model: Comment, 
                as: 'comments' // Ensure this alias matches the one defined in the model
            }]
        });
        if (post) {
            res.render('post', { post });
        } else {
            res.status(404).send('Post not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Route to create a new post
app.post('/posts', async (req, res) => {
    try {
        const { title, body } = req.body;
        await Post.create({ title, body });
        res.redirect('/');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get('/create', (req, res) => {
    res.render('create');
});

app.post('/create', async (req, res) => {
    await Post.create(req.body);
    res.redirect('/');
});

// Route to display the edit form for a post
app.get('/post/:id/edit', async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (post) {
            res.render('edit', { post });
        } else {
            res.status(404).send('Post not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});
// Route to update a post
app.post('/post/:id/edit', async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (post) {
            await post.update(req.body);
            res.redirect(`/post/${req.params.id}`);
        } else {
            res.status(404).send('Post not found');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/post/:id/delete', async (req, res) => {
    const post = await Post.findByPk(req.params.id);
    await post.destroy();
    res.redirect('/');
});

// Route to submit a comment
app.post('/post/:id/comment', async (req, res) => {
    try {
        await Comment.create({
            body: req.body.body,
            postId: req.params.id
        });
        res.redirect(`/post/${req.params.id}`); // Use backticks for interpolation
    } catch (error) {
        res.status(500).send(error.message);
    }
});
app.use('/css', express.static('views/css'));

sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
});