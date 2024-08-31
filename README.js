# Project Structure
/backend
  /models
    - User.js
    - Post.js
    - Comment.js
  - server.js
  - routes.js
  - config.js
/frontend
  /src
    - components
      - LoginForm.js
      - RegisterForm.js
      - PostForm.js
      - PostList.js
      - CommentForm.js
    - App.js
    - index.js
  - package.json
- package.json


#npm init -y
#npm install express mongoose bcryptjs jsonwebtoken cors

module.exports = {
  mongoURI: 'your_mongo_connection_string',
  jwtSecret: 'your_jwt_secret',
};

// this all you  need to start your project

# user.js 
// Table User 

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);



// this copy of php 
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


    // post.js Table POST 
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  caption: { type: String },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', PostSchema);

// version php .
CREATE TABLE Posts (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    image_url VARCHAR(255) NOT NULL,
    caption TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);



// Table comment 

CREATE TABLE Comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT,
    user_id INT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES Posts(post_id) ON


const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Comment', CommentSchema);

# Route.js 
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const { jwtSecret } = require('./config');
const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware to Protect Routes
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Post Routes
router.post('/posts', authMiddleware, async (req, res) => {
  try {
    const { imageUrl, caption } = req.body;
    const post = new Post({ user: req.userId, imageUrl, caption });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/posts', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'username').populate('comments');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Comment Routes
router.post('/comments', authMiddleware, async (req, res) => {
  try {
    const { postId, content } = req.body;
    const comment = new Comment({ post: postId, user: req.userId, content });
    await comment.save();

    const post = await Post.findById(postId);
    post.comments.push(comment._id);
    await post.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// server.js 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { mongoURI } = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/api', routes);

app.listen(5000, () => console.log('Server running on port 5000'));




# Frontend (React)
# Install Dependencies


# npx create-react-app frontend
# cd frontend
# npm install axios


// LoginFrom.js

import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', { email, password });
      setToken(response.data.token);
      alert('Logged in successfully');
    } catch (error) {
      console.error(error);
      alert('Failed to log in');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginForm;


// register.js 

import React, { useState } from 'react';
import axios from 'axios';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/register', { username, email, password });
      alert('Registered successfully');
    } catch (error) {
      console.error(error);
      alert('Failed to register');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterForm;

// postFrom .js

import React, { useState } from 'react';
import axios from 'axios';

const PostForm = ({ token }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/posts',
        { imageUrl, caption },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Post created successfully');
      setImageUrl('');
      setCaption('');
    } catch (error) {
      console.error(error);
      alert('Failed to create post');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      <button type="submit">Create Post</button>
    </form>
  );
};

export default PostForm;


#PostList.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CommentForm from './CommentForm';

const PostList = ({ token }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/posts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPosts();
  }, [token]);

  return (
    <div>
      {posts.map((post) => (
        <div key={post._id}>
          <h3>{post.user.username}</h3>
          <img src={post.imageUrl} alt="Post" />
          <p>{post.caption}</p>
          <CommentForm postId={post._id} token={token} />
          <div>
            {post.comments.map((comment) => (
              <div key={comment._id}>
                <strong>{comment.user.username}</strong>: {comment.content}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList;

#comment from.js
import React, { useState } from 'react';
import axios from 'axios';

const CommentForm = ({ postId, token }) => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:5000/api/comments',
        { postId, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContent('');
      alert('Comment added successfully');
    } catch (error) {
      console.error(error);
      alert('Failed to add comment');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <button type="submit">Comment</button>
    </form>
  );
};

export default CommentForm;


#app.js 
import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import PostForm from './components/PostForm';
import PostList from './components/PostList';

function App() {
  const [token, setToken] = useState('');

  if (!token) {
    return (
      <div>
        <h1>Register</h1>
        <RegisterForm />
        <h1>Login</h1>
        <LoginForm setToken={setToken} />
      </div>
    );
  }

  return (
    <div>
      <h1>Create a Post</h1>
      <PostForm token={token} />
      <h1>Posts</h1>
      <PostList token={token} />
    </div>
  );
}

export default App;

# index.js 
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);


    




