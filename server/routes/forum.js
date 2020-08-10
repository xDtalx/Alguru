const express = require('express');
const router = express.Router();
const ForumController = require('../controllers/forum');
const checkAuth = require('../filters/check-auth');
const { check } = require('express-validator');
const postValidations = [
  check('currentTitle', 'Title should be at least 6 characters').exists().trim().isLength({ min: 6 }),
  check('currentContent', 'Content should be at least 6 characters').exists().trim().isLength({ min: 6 })
];
const commentValidations = [
  check('currentContent', 'Content should be at least 1 characters').exists().trim().isLength({ min: 1 })
];
const emailVerificationValidation = (req, res, next) => {
  if (!req.userData.verified) {
    return res.status(401).json({ message: 'Please verify your email address first' });
  }

  next();
};

// post something
router.post('', checkAuth, emailVerificationValidation, postValidations, ForumController.createPost);

// comment on specific post - use the id to find the post
router.post('/:postId', checkAuth, emailVerificationValidation, commentValidations, ForumController.createComment);

// allow only the creator of the post to delete it
router.delete('/:postId', checkAuth, emailVerificationValidation, ForumController.deletePost);

// allow only the creator of the comment to delete it
router.delete('/:postId/:commentId', checkAuth, emailVerificationValidation, ForumController.deleteComment);

// view all posts
router.get('', ForumController.getPosts);

// view specific post
router.get('/:postId', ForumController.getPost);

// allow user to edit a post
router.put('/:postId', checkAuth, emailVerificationValidation, postValidations, ForumController.updatePost);

// allow user to edit a post
router.put(
  '/:postId/:commentId',
  checkAuth,
  emailVerificationValidation,
  commentValidations,
  ForumController.updateComment
);

// vote on comment
router.patch(
  '/:postId/:commentId',
  checkAuth,
  emailVerificationValidation,
  [
    check('username', 'Username in vote is invalid').exists().trim().isLength({ min: 6 }),
    check('isUp', 'Vote type not specified').exists()
  ],
  ForumController.voteOnComment
);

// vote on post
router.patch(
  '/:postId',
  checkAuth,
  emailVerificationValidation,
  [
    check('username', 'Username in vote is invalid').exists().trim().isLength({ min: 6 }),
    check('isUp', 'Vote type not specified').exists()
  ],
  ForumController.voteOnPost
);

module.exports = router;
