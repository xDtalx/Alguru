const express = require('express');
const router = express.Router();

const ForumController = require('../controllers/forum');
const checkAuth = require('../filters/check-auth');

//post something
router.post('', checkAuth, ForumController.createPost);

//comment on specific post - use the id to find the post
router.post('/:postId', checkAuth, ForumController.createComment);

//allow only the creator of the post to delete it
router.delete('/:postId', checkAuth, ForumController.deletePost);

//allow only the creator of the comment to delete it
router.delete('/:postId/:commentId', checkAuth, ForumController.deleteComment);

//view all posts
router.get('', ForumController.getPosts);

//view specific post
router.get('/:postId', ForumController.getPost);

//allow user to edit a post
router.put('/:postId', checkAuth, ForumController.updatePost);

//allow user to edit a post
router.put('/:postId/:commentId', checkAuth, ForumController.updateComment);



module.exports = router;