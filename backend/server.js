const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

const app = express();
const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key'; // Use environment variable for secret key

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, { // Use environment variable for MongoDB URI
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// Define User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  password: { type: String, required: true },
});


const User = mongoose.model('User', userSchema);

// User registration endpoint
app.post('/register', async (req, res) => {
  const { username, email, mobile, password } = req.body;

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(409).json({ field: 'username', message: 'Username already exists. Please choose a different username.' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(409).json({ field: 'email', message: 'Email already exists. Please choose a different email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, mobile, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: 'User successfully registered' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// User login endpoint
app.post('/login', async (req, res) => {
  const { emailid, password } = req.body;

  try {
    const user = await User.findOne({ email: emailid });
    if (!user) {
      return res.status(404).json({ message: 'User Not Found! Please Enter Valid Email Id' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Password is incorrect!' });
    }

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// Forgot password endpoint
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const resetToken = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER, // Use environment variable
        pass: process.env.EMAIL_PASS, // Use environment variable
      },
    });

    // Set up email details (e.g., subject, body)
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `Please use the following link to reset your password: http://localhost:5000/reset-password/${resetToken}`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    console.error('Error during forgot password process:', error);
    res.status(500).json({ message: 'Error sending password reset email' });
  }
});

// Define Blog schema and model
// Update the Blog schema to reference the User model for comments
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  tags: [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [
    {
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Reference to User model
    }
  ]
});


const Blog = mongoose.model('Blog', blogSchema);

// Middleware to authenticate user with JWT token
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};


// Endpoint to fetch a single blog by ID
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username') // Populate the author's username
      .populate('comments.author', 'username'); // Populate the username of authors of comments

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Failed to fetch blog' });
  }
});


// Endpoint to create a new blog post (requires authentication)
app.post('/api/blogs', authenticate, async (req, res) => {
  const { title, content, category, tags: tagsCsv } = req.body;

  try {
    // Convert comma-separated tags into an array
    const tags = tagsCsv ? tagsCsv.split(',').map(tag => tag.trim()) : [];

    // Validate tags as an array of strings
    if (!Array.isArray(tags) || !tags.every(tag => typeof tag === 'string')) {
      return res.status(400).json({ message: 'Tags must be an array of strings.' });
    }

    // Optionally: Validate tags further, e.g., length, prohibited characters
    if (tags.some(tag => tag.length === 0 || tag.length > 50)) {
      return res.status(400).json({ message: 'Tags must be non-empty and up to 50 characters long.' });
    }

    const newBlog = new Blog({ title, content, category, tags, author: req.user.userId });
    await newBlog.save();
    res.status(201).json({ message: 'Blog successfully published' });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Failed to publish blog' });
  }
});

app.put('/api/blogs/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, content, category, tags: tagsCsv } = req.body;

  try {
    // Log the incoming update request
    console.log('Received update request:', { id, title, content, category, tagsCsv });

    // Convert comma-separated tags into an array and trim whitespace
    const tags = tagsCsv ? tagsCsv.split(',').map(tag => tag.trim()) : [];

    // Validate tags as an array of non-empty strings with a max length of 50
    if (!Array.isArray(tags) || !tags.every(tag => typeof tag === 'string' && tag.length > 0 && tag.length <= 50)) {
      return res.status(400).json({ message: 'Tags must be an array of non-empty strings with a maximum length of 50 characters each.' });
    }

    // Find the blog post by ID
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Check if the requesting user is the author of the blog post
    if (blog.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You do not have permission to edit this post.' });
    }

    // Update the blog fields only if new values are provided
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.category = category || blog.category;
    blog.tags = tags.length > 0 ? tags : blog.tags;

    // Save the updated blog post
    await blog.save();

    // Log success and respond with updated blog information
    console.log('Blog successfully updated:', blog);
    res.status(200).json({ message: 'Blog successfully updated', blog });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Failed to update blog', error: error.message });
  }
});

// Endpoint to like or unlike a blog post
app.post('/api/blogs/:id/like', authenticate, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const userId = req.user.userId;
    const alreadyLiked = blog.likes.includes(userId);

    if (alreadyLiked) {
      // Remove the like
      blog.likes = blog.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Add the like
      blog.likes.push(userId);
    }

    await blog.save();

    res.json({
      message: alreadyLiked ? 'Blog unliked successfully' : 'Blog liked successfully',
      likes: blog.likes.length,
      likedByUser: !alreadyLiked
    });
  } catch (error) {
    console.error('Error liking/unliking blog:', error);
    res.status(500).json({ message: 'Failed to like/unlike blog' });
  }
});


app.post('/api/blogs/:postId/comment', authenticate, async (req, res) => {
  const { commentText } = req.body; // Still receiving 'commentText' from frontend
  const postId = req.params.postId;

  try {
    const blog = await Blog.findById(postId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const user = await User.findById(req.user.userId); // Fetch the user's data
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newComment = {
      text: commentText, // Use 'text' here to match schema
      username: user.username,
    };

    blog.comments.push(newComment);
    await blog.save();

    res.status(201).json({ message: 'Comment added successfully', comment: newComment });
  } catch (error) {
    console.error('Error commenting on blog:', error);
    res.status(500).json({ message: 'Failed to add comment' });
  }
});


// Endpoint to delete a comment (requires authentication)
// Delete a comment from a blog post
// Delete a comment from a blog post
app.delete('/api/blogs/:postId/comments/:commentId', authenticate, async (req, res) => {
  const { postId, commentId } = req.params;

  try {
    // Check if postId and commentId are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'Invalid postId or commentId' });
    }

    // Find the blog post and remove the comment
    const updatedBlog = await Blog.findByIdAndUpdate(
      postId,
      { $pull: { comments: { _id: commentId } } }, // Removes the comment with the specified id
      { new: true } // Returns the updated document
    );

    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const comment = updatedBlog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the requesting user is the author of the comment
    if (comment.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this comment.' });
    }

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});


app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username')
      .populate('comments.author', 'username');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Failed to fetch blog' });
  }
});

// Endpoint to edit a comment (requires authentication)
app.put('/api/blogs/:postId/comments/:commentId', authenticate, async (req, res) => {
  const { postId, commentId } = req.params;
  const { newText } = req.body;

  try {
    const blog = await Blog.findById(postId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if the requesting user is the author of the comment
    if (comment.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You do not have permission to edit this comment.' });
    }

    // Update the comment text
    comment.text = newText;
    await blog.save();

    res.json({ message: 'Comment successfully updated', comment });
  } catch (error) {
    console.error('Error editing comment:', error);
    res.status(500).json({ message: 'Failed to edit comment' });
  }
});




app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username') // Populate the author's username
      .populate('comments.author', 'username'); // Populate the username of authors of comments

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Failed to fetch blog' });
  }
});



// Endpoint to fetch blogs created by the authenticated user
app.get('/api/user/blogs', authenticate, async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user.userId }).populate('author', 'username');
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    res.status(500).json({ message: 'Failed to fetch user blogs' });
  }
});



app.get('/api/allblogs', async (req, res) => {
  try {
    let query = {};

    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { content: { $regex: req.query.search, $options: 'i' } },
        { tags: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    if (req.query.username) {
      const user = await User.findOne({ username: req.query.username });
      if (user) {
        query.author = user._id;
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    if (req.query.category) {
      console.log('Category filter applied:', req.query.category);
      query.category = req.query.category;
    }

    const blogs = await Blog.find(query)
      .populate('author', 'username')
      .populate('comments.author', 'username');

    res.json(blogs);
  } catch (error) {
    console.error('Error fetching all blogs:', error);

    if (error.code === 'ECONNRESET') {
      res.status(500).json({ message: 'Connection reset by server, please try again later.' });
    } else {
      res.status(500).json({ message: 'Failed to fetch all blogs', error: error.message });
    }
  }
});


// Endpoint to delete a blog post by ID
app.delete('/api/blogs/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    if (blog.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this post.' });
    }
    await Blog.findByIdAndDelete(id);
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Failed to delete blog post' });
  }
});


app.post('/api/blogs/:postId/unlike', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const postId = req.params.postId;

    // Find the blog post by its ID
    const blogPost = await Blog.findById(postId);

    if (!blogPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user has liked the post
    const likedIndex = blogPost.likes.indexOf(userId);
    if (likedIndex === -1) {
      return res.status(400).json({ message: 'You have not liked this post' });
    }

    // Remove the user's like from the post
    blogPost.likes.splice(likedIndex, 1);
    await blogPost.save();

    res.json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ message: 'Failed to unlike the post' });
  }
});

// Endpoint to fetch a single blog by ID
app.get('/api/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'username');
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Failed to fetch blog' });
  }
});

app.get('/api/blog/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'username');
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Failed to fetch blog' });
  }
});

// Endpoint to fetch user details
app.get('/api/user', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId, 'username email mobile');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Failed to fetch user details' });
  }
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get all usernames
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username'); // Only fetch usernames
    res.json(users);
  } catch (error) {
    console.error('Error fetching usernames:', error);
    res.status(500).json({ message: 'Failed to fetch usernames' });
  }
});




// Delete a user by ID
app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});



// Endpoint to update user password
app.put('/api/user/password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Failed to update password' });
  }
});

// Endpoint to fetch liked posts of the authenticated user
app.get('/api/user/liked-posts', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find all blog posts liked by the user and populate the author and comments
    const likedPosts = await Blog.find({ likes: userId })
      .populate('author', 'username')  // Populate the author's username
      .populate('comments.author', 'username'); // Populate the username of authors of comments

    res.json({ likedPosts });
  } catch (error) {
    console.error('Error fetching liked posts:', error);
    res.status(500).json({ message: 'Failed to fetch liked posts' });
  }
});


// Configure multer to accept various image formats
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      cb(null, `${Date.now()}${ext}`);
    } else {
      cb(new Error('Invalid file type'), null);
    }
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res) => {
  if (req.file) {
    res.status(200).json({ message: 'File uploaded successfully', file: req.file });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
