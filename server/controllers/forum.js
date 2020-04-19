const Comment = require('../models/comment');
const Post = require('../models/post');

//method to create a post on forum
exports.createPost = (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    comments: [],
    creator: req.userData.userId
  });

  post.save().then(createdPost => {
    res.status(201).json({
      message: "Post created successfully",
      postId: createdPost._id
    });
  });
};

//method to create a comment for a post on forum - have to get the post id from req
exports.createComment = (req, res, next) => {
  //need to load the specific post from db by it's ID
  Post.findById(req.params.postId, (err, post) => {
    if (err) {
      //didnt find the post - returns error
      res.status(400).json({
        message: "Wasn't able to find the Post you want to comment on!"
      });
    }
    else {

      const comment = new Comment({
        title: req.body.title,
        content: req.body.content,
        postId: req.params.postId,
        creator: req.userData.userId
      });

      Post.updateOne(
        { 
          _id: req.params.postId 
        }, 
        {
          $push: { comments: [ comment ] }
        })
        .then(result => {
          const isModified = result.n > 0;

          if (isModified) {
            //then save it on the comments scheme and return success
            comment.save().then(createdComment => {
              res.status(201).json({
                message: "Comment created successfully",
                commentId: createdComment._id
              });
            });
          } else {
            res.status(401).json({ message: 'Not authorized!' })
          }
        });
    }
  });
};

exports.deletePost = (req, res, next) => {
  //to delete the post from the posts scheme
  Post.deleteOne({ _id: req.params.postId, creator: req.userData.userId }, (err) => {
    if (err) {
      res.status(401).json({ message: "Wasn't able to delete the post!" });
    } else {
      //if the post is deleted from Post DB - delete the posts comments from Comments DB
      //no need to handle error - the post might be without comments
      Comment.deleteMany({ postId: req.params.postId }, function (err) { });
      res.status(200).json({ message: 'Post deleted' });
    }
  });
};

exports.deleteComment = (req, res, next) => {
  //we need to delete from the comments array of that post 
  Comment.find(
    { 
      _id: req.params.commentId,
      creator: req.userData.userId 
    }
  )
  .then(() => {
    Post.findById(req.params.postId).then(post => {
      Post.updateOne(
      {
        _id: req.params.postId
      },
      {
        $pull: { comments: { _id: req.params.commentId } } 
      })
      .then(result => {
        const isModified = result.n > 0;

        if (isModified) {
          Comment.deleteOne(
            { 
              _id: req.params.commentId, 
              creator: req.userData.userId 
            })
            .then(result => {
              const isDeleted = result.n > 0;

              if (isDeleted) {
                res.status(200).json({ message: "Comment deleted" });
              } else {
                res.status(401).json({ message: "Unable to delete the comment" });
              }
            });
        } else {
          res.status(401).json({ message: "Unable to delete the comment" })
        }
      })
    })
  })
  .catch(err => res.status(401).json({ message: "Unable to delete the comment" }))
};

exports.getPosts = (req, res, next) => {
  Post.find().then(documents => res.status(200).json(documents));
};

exports.getPost = (req, res, next) => {
  Post.findById(req.params.postId)
  .then(post => res.status(200).json(post))
  .catch(() => res.status(404).json({ message: 'Post not found!' }));
};

exports.updatePost = (req, res, next) => {
  Post.updateOne(
    {
      _id: req.params.postId,
      creator: req.userData.userId
    }
    , {
      title: req.body.title,
      content: req.body.content
    }
  )
  .then(post => res.status(200).json(
    { 
      message: 'Post updated',
      post: post
    }))
  .catch(() => res.status(401).json({ message: 'Not authorized!' }));
};

exports.updateComment = (req, res, next) => {
  //first we need to use the old comment instance and remove it from the post comments array
  Comment.findOneAndUpdate(
    { 
      _id: req.params.commentId, 
      creator: req.userData.userId 
    },
    {
      title: req.body.title,
      content: req.body.content
    })
    .then(updatedComment => {
      Post.findById(req.params.postId)
      .then(post => {
        let commentIndex = -1;
        
        for(let i = 0; i < post.comments.length; i++) {
          commentIndex++;
          
          if(post.comments[i]._id === updatedComment._id) {
            break;
          }
        }

        post.comments[commentIndex] = updatedComment;
        
        Post.updateOne(
          { 
            _id: req.params.postId, 
            creator: req.userData.userId 
          },
          post
        )
        .then(result => {
          const isModified = result.n > 0;
          
          if(isModified) {
            res.status(200).json({ message: 'Comment updated' });
          } else {
            res.status(401).json({ message: 'Comment updated but not in post' })
          }
        })
      })
      .catch(() => res.status(401).json({ message: "Comment found but the linked post is missing" }));
    }
  )
  .catch(() => res.status(400).json({ message: "Comment not found" }));
};