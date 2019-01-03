const express = require('express');
const auth = require('../middleware/auth');
const posts = require('../controllers/posts');
const extractFile = require('../middleware/multer');
const router = express.Router();

router.post("/", auth, extractFile, posts.createPost);
  
router.put('/:id', auth, extractFile, posts.editPost);

router.get("/", posts.getPosts);

router.get('/:id', posts.getPost);

router.delete("/:id", auth, posts.deletePost);

module.exports = router;