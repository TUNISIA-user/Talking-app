// first do this 
// second this
// third app 


const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const port = 3000;

// Initialize Sequelize (using SQLite for simplicity)
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite'
});

// Define the Post model
const Post = sequelize.define('Post', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

// Middleware
app.use(bodyParser.json());

// Routes
app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.findAll();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Unable to retrieve posts' });
    }
});

app.post('/posts', async (req, res) => {
    try {
        const { title, content } = req.body;
        const newPost = await Post.create({ title, content });
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: 'Unable to create post' });
    }
});

// Start server and sync database
app.listen(port, async () => {
    await sequelize.sync({ force: true });
    console.log(`Server is running on http://localhost:${port}`);
});
