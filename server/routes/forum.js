const express = require('express');
const router = express.Router();
const ForumController = require('../controllers/forum');
const checkAuth = require('../filters/check-auth');
const { check } = require('express-validator');
const validations = [
  check('currentTitle', 'Title should be at least 6 characters').exists().trim().isLength({ min: 6 }),
  check('currentContent', 'Content should be at least 6 characters').exists().trim().isLength({ min: 6 })
];

// post something
router.post('', checkAuth, validations, ForumController.createPost);

// comment on specific post - use the id to find the post
router.post('/:postId', checkAuth, validations, ForumController.createComment);

// allow only the creator of the post to delete it
router.delete('/:postId', checkAuth, ForumController.deletePost);

// allow only the creator of the comment to delete it
router.delete('/:postId/:commentId', checkAuth, ForumController.deleteComment);

// view all posts
router.get('', ForumController.getPosts);

// view specific post
router.get('/:postId', ForumController.getPost);

// allow user to edit a post
router.put('/:postId', checkAuth, validations, ForumController.updatePost);

// allow user to edit a post
router.put('/:postId/:commentId', checkAuth, validations, ForumController.updateComment);

// vote on comment
router.patch(
  '/:postId/:commentId',
  checkAuth,
  [
    check('username', 'Username in vote is invalid').exists().trim().isLength({ min: 6 }),
    check('isUp', 'Vote type not specified').exists()
  ],
  ForumController.voteOnComment
);

module.exports = router;
