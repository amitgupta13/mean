const express = require('express');
const Post = require("../models/post");
const multer = require('multer');
const auth = require('../middleware/auth');
const router = express.Router();

const MIME_TYPE_MAP = {
  'image/png':'png',
  'image/jpg':'jpg',
  'image/jpeg':'jpg'
}

const storage = multer.diskStorage({
  destination: (req, file, cb)=>{
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid MIME Type');
    if(isValid){
      error = null;
    }
    cb(error, 'backend/images');
  },
  filename:(req, file, cb)=>{
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});

router.post("/", auth, multer({storage:storage}).single('image'), (req, res, next) => {
    const url = `${req.protocol}://${req.get('host')}`;
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath:`${url}/images/${req.file.filename}`,
      creator: req.user.userId
    });
    post.save().then(createdPost => {
      res.status(201).json({
        message: "Post added successfully",
        post:{
          ...createdPost,
          id:createdPost._id,
        }
      });
    })
    .catch(error=>{
      res.status(500).json({
        message:'creating a post failed'
      });
    });
  });
  
  router.put('/:id', auth, multer({storage:storage}).single('image'), (req, res, next)=>{
    let imagePath = req.body.imagePath;
    if(req.file){
      const url = `${req.protocol}://${req.get('host')}`;
      imagePath = `${url}/images/${req.file.filename}`;
    }
    const post = new Post({
      _id:req.body.id,
      title:req.body.title,
      content:req.body.content,
      imagePath: imagePath,
      creator:req.user.userId
    });
    Post.updateOne({_id:req.params.id, creator:req.user.userId}, post).then(result=>{
      if(result.nModified > 0){
        res.status(200).json({message:'update successful'});
      }else{
        res.status(401).json({message:'Not Authorized'});
      }
    })
    .catch(error=>{
      res.status(500).json({
        message:'Coudnt Update Post!'
      })
    });
  })
  
  router.get("/", (req, res, next) => {
    const pageSize = req.query.pagesize;
    const currentPage = req.query.page;
    const postQuery = Post.find();
    let fetchedPosts;
    if(pageSize && currentPage){
      postQuery
        .skip(pageSize * (currentPage - 1))
        .limit(pageSize);
    }
    postQuery.then(documents => {
      fetchedPosts = documents;
      return Post.countDocuments();
    })
    .then(count => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: fetchedPosts,
        maxPosts: count
      });
    })
    .catch(error=>{
      res.status(500).json({
        message:'Fetching Posts Failed'
      })
    });
  });
  
  router.get('/:id', (req, res, next)=>{
    Post.findById(req.params.id).then(post => {
      if(post){
        res.status(200).json(post);
      }else{
        res.status(404).json({
          message:'Post not Found'
        });
      }
    })
    .catch(error=>{
      res.status(500).json({
        message:'Fetching Post Failed'
      })
    })
  });
  
  router.delete("/:id", auth, (req, res, next) => {
    Post.deleteOne({ _id: req.params.id, creator:req.user.userId }).then(result => {
      console.log(result);
      if(result.n > 0){
        res.status(200).json({message:'Post Deleted'});
      }else{
        res.status(401).json({message:'Not Authorized'});
      }
    })
    .catch(error=>{
      res.status(500).json({
        message:'Couldnt Delete Post!'
      })
    });
  });

module.exports = router;