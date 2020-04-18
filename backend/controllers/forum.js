const Comment = require('../models/comment');
const Post = require('../models/post');

//method to create a post on forum
exports.createPost = (req, res, next) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    commentsArray: Array,
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
  const comment = new Comment({
    title: req.body.title,
    content: req.body.content,
    postId: req.params.postId,
    creator: req.userData.userId
  });

  //need to load the specific post from db by it's ID
  Post.findById(req.params.postId, (err, post) => {
    if (err) {
      //didnt find the post - returns error
      res.status(400).json({
        message: "Wasn't able to find the Post you want to comment on!"
      });
    }
    else {
      //update the comments array on db
      post.commentsArray.push(comment);

      Post.updateOne(
        {
          _id: req.params.postId
        }
        ,
        { commentsArray: post.commentsArray })
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
  Comment.find({ _id: req.params.commentId, creator: req.userData.userId }, (err, comment) => {
    if (err) {
      //didnt find the comment - returns error
      res.status(400).json({
        message: "Wasn't able to delete the comment!"
      });
    }
    else {
      //find the comment - remove it from the post array first and then from the comment db

      //find the post and remove the comment from it's array
      Post.findById(req.params.postId, (err, post) => {
        if (err) {
          //didnt find the post - returns error
          res.status(400).json({
            message: "Wasn't able to delete the comment from the array!"
          });
        }
        else {
          post.commentsArray.remove({ _id: "5e9f3fce5aa6e64f74c5b37f" });
          res.status(400).json({
            post: post
          });

          //need to update the post in his db 
          Post.updateOne(
            {
              _id: req.params.postId
            }
            ,
            { commentsArray: post.commentsArray })
            .then(result => {
              const isModified = result.n > 0;

              if (isModified) {
                //now we need to remove it from the comments db
                //remove from comments db 
                Comment.deleteOne({ _id: req.params.commentId, creator: req.userData.userId })
                  .then(result => {
                    const isDeleted = result.n > 0;

                    if (isDeleted) {
                      res.status(200).json({ message: 'Comment has been deleted successfully' });
                    } else {
                      res.status(401).json({ message: "Wasn't able to delete the comment!" });
                    }
                  });
              } else {
                res.status(401).json({ message: 'Cant delete the comment from the array!' })
              }
            });
        }
      });
    }
  });
};

exports.getPosts = (req, res, next) => {
  Post.find().then(documents => res.status(200).json(documents));
};

exports.getPost = (req, res, next) => {
  Post.findById(req.params.postId, (err, post) => {
    if (err) {
      res.status(404).json({ message: 'Post not found!' });
    } else {
      res.status(200).json(post);
    }
  });
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
    },
    (err, raw) => {
      if (err) {
        res.status(401).json({ message: 'Not authorized!' });
      } else {
        res.status(200).json({ message: 'Update post successful' });
      }
    })
};

exports.updateComment = (req, res, next) => {
  //first we need to use the old comment instance and remove it from the post comments array
  Comment.find({ _id: req.params.commentId, creator: req.userData.userId }, (err, oldComment) => {
    if (err) {
      //didnt find the old comment - returns error
      res.status(400).json({
        message: "Wasn't able to find the old comment to edit!"
      });
    } else {
      Post.findById(req.params.postId, (err, post) => {
        if (err) {
          //didnt find the old comment - returns error
          res.status(400).json({
            message: "Wasn't able to find the post to edit the comments array!"
          });
        }
        else {
          //find the old comment index and push the new comment
          var indexOfOldComment = post.commentsArray.findIndex(oldComment);
          post.commentsArray[indexOfOldComment].title = req.body.title;
          post.commentsArray[indexOfOldComment].content = req.body.content;
          //update it on post DB
          Post.updateOne(
            {
              _id: req.params.postId
            }
            ,
            { commentsArray: post.commentsArray })
            .then(result => {
              const isModified = result.n > 0;

              if (isModified) {
                //now we need to update it in the comments db
                //edit in comments db 
                Comment.updateOne(
                  {
                    _id: req.params.commentId
                  }
                  , { title: req.body.title, content: req.body.content })
                  .then(result => {
                    const isUpdated = result.n > 0;

                    if (isUpdated) {
                      res.status(200).json({ message: 'Updated comment successfully' });
                    } else {
                      res.status(401).json({ message: "Wasn't able to update the comment!" });
                    }
                  });
              } else {
                res.status(401).json({ message: 'Cant update the comment in the array!' })
              }
            });
        }
      });
    }
  });
};