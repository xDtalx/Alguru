const Comment = require('../models/comment');
const Post = require('../models/post');
const { validationResult } = require('express-validator');

// method to create a post on forum
exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    comments: [],
    creator: req.userData.userId,
  });

  post.save().then((createdPost) => {
    res.status(201).json({
      message: 'Post created successfully',
      post: createdPost,
    });
  });
};

// method to create a comment for a post on forum - have to get the post id from req
exports.createComment = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  // need to load the specific post from db by it's ID
  Post.findById(req.params.postId)
    .then((post) => {
      const comment = new Comment({
        title: req.body.title,
        content: req.body.content,
        postId: req.params.postId,
        creator: req.userData.userId,
      });

      post.comments.set(String(comment._id), comment);

      Post.updateOne({ _id: req.params.postId }, post)
        .then((result) => {
          const isModified = result.n > 0;

          if (isModified) {
            // then save it on the comments scheme and return success
            comment.save().then((createdComment) => {
              res.status(201).json({
                message: 'Comment created',
                comment: createdComment,
              });
            });
          } else {
            res.status(500).json({ message: 'Updating post was unsuccessful' });
          }
        })
        .catch(() => res.status(500).json({ message: 'Updating the post was unsuccessful' }));
    })
    .catch(() => res.status(400).json({ message: 'Finding the requested post was unsuccessful' }));
};

exports.deletePost = (req, res, next) => {
  // to delete the post from the posts scheme
  Post.deleteOne({ _id: req.params.postId, creator: req.userData.userId })
    .then(() => {
      // if the post is deleted from Post DB - delete the posts comments from Comments DB
      // no need to handle error - the post might be without comments
      Comment.deleteMany({ postId: req.params.postId })
        .then(() => res.status(200).json({ message: 'Post deleted' }))
        .catch(() => res.status(500).json({ message: 'Not all posts comments deleted.' }));
    })
    .catch(() => res.status(401).json({ message: 'Not authorized!' }));
};

exports.deleteComment = (req, res, next) => {
  // we need to delete from the comments array of that post
  Comment.find({ _id: req.params.commentId, creator: req.userData.userId })
    .then(() => {
      Post.findById(req.params.postId).then((post) => {
        post.comments.delete(req.params.commentId);

        Post.updateOne({ _id: req.params.postId, creator: req.userData.userId }, post).then((result) => {
          const isModified = result.n > 0;

          if (isModified) {
            Comment.deleteOne({
              _id: req.params.commentId,
              creator: req.userData.userId,
            }).then((result) => {
              const isDeleted = result.n > 0;

              if (isDeleted) {
                res.status(200).json({ message: 'Comment deleted' });
              } else {
                res.status(500).json({ message: 'Deleting the comment was unsuccessful' });
              }
            });
          } else {
            res.status(401).json({ message: 'Not authorized!' });
          }
        });
      });
    })
    .catch(() => res.status(401).json({ message: 'Not authorized!' }));
};

exports.getPosts = (req, res, next) => {
  Post.find().then((documents) => res.status(200).json(documents));
};

exports.getPost = (req, res, next) => {
  Post.findById(req.params.postId)
    .then((post) => res.status(200).json(post))
    .catch(() => res.status(404).json({ message: 'Post not found!' }));
};

exports.updatePost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  Post.updateOne(
    { _id: req.params.postId, creator: req.userData.userId },
    { title: req.body.title, content: req.body.content },
  )
    .then((post) => res.status(200).json({ message: 'Post updated', post: post }))
    .catch(() => res.status(401).json({ message: 'Not authorized!' }));
};

exports.updateComment = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  // first we need to use the old comment instance and remove it from the post comments array
  Comment.findOneAndUpdate(
    { _id: req.params.commentId, creator: req.userData.userId },
    { title: req.body.title, content: req.body.content },
  )
    .then((updatedComment) => {
      Post.findById(req.params.postId)
        .then((post) => {
          post.comments.set(req.params.commentId, updatedComment);
          Post.updateOne({ _id: req.params.postId }, post).then((result) => {
            const isModified = result.n > 0;

            if (isModified) {
              res.status(200).json({ message: 'Comment updated', comment: updatedComment });
            } else {
              res.status(500).json({ message: 'Comment updated but not in post' });
            }
          });
        })
        .catch(() => res.status(400).json({ message: 'Comment found but the linked post is missing' }));
    })
    .catch(() => res.status(401).json({ message: 'Unauthorized!' }));
};
