const {Post} = require('../models/post');

exports.createPost = (req, res, next) => {
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
  }

exports.editPost = (req, res, next)=>{
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
  }

exports.getPosts = (req, res, next) => {
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
  }

exports.getPost = (req, res, next)=>{
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
  }

exports.deletePost = (req, res, next) => {
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
  }