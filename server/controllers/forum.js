const Comment = require('../models/comment.js');
const Post = require('../models/post.js');
const Notification = require('../models/notification.js');
const User = require('../models/user.js');
const Vote = require('../models/vote.js');
const { validationResult } = require('express-validator');

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  const date = new Date().getTime();
  const post = new Post({
    currentTitle: req.body.currentTitle,
    currentContent: req.body.currentContent,
    currentDate: date,
    titles: [req.body.currentTitle],
    contents: [req.body.currentContent],
    comments: [],
    author: req.userData.username,
    dates: [date],
    votes: {}
  });

  await post.save().then((createdPost) => {
    res.status(201).json({
      message: 'Post created successfully',
      post: createdPost
    });
  });
};

exports.createComment = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  await Post.findById(req.params.postId)
    .then(async (post) => {
      const date = new Date().getTime();
      const comment = new Comment({
        currentTitle: req.body.currentTitle,
        currentContent: req.body.currentContent,
        currentDate: date,
        titles: [req.body.currentTitle],
        contents: [req.body.currentContent],
        postId: req.params.postId,
        author: req.userData.username,
        dates: [date],
        votes: {}
      });

      post.comments.push(comment);
      if (req.userData.username !== post.author) {
        await addNotificationToUserAsync(
          post.author.toLowerCase(),
          new Notification({
            sender: req.userData.username,
            title: 'Someone commented on your post',
            content: req.userData.username + ' commented on your post: ' + post.titles,
            seen: false,
            url: '/forum/post/' + req.params.postId,
            createdAt: new Date().getTime()
          })
        );
      }

      await Post.updateOne({ _id: req.params.postId }, post)
        .then(async (result) => {
          const isModified = result.n > 0;

          if (isModified) {
            await comment.save().then(async (createdComment) => {
              if (post.author !== req.userData.username) {
                await User.findOne({ _id: req.userData.userId }).then(async (user) => {
                  user.stats.contribComments++;
                  user.stats.contribPoints += 50;
                  await User.updateOne({ _id: req.userData.userId }, user);
                });
              }

              res.status(201).json({
                message: 'Comment created',
                comment: createdComment
              });
            });
          } else {
            res.status(500).json({ message: 'Updating post was unsuccessful' });
          }
        })
        .catch((err) =>
          res.status(500).json({
            message: 'Updating the post was unsuccessful',
            stacktrace: req.userData.isAdmin ? err : '😊'
          })
        );
    })
    .catch((err) =>
      res.status(400).json({
        message: 'Finding the requested post was unsuccessful',
        stacktrace: req.userData.isAdmin ? err : '😊'
      })
    );
};

exports.deletePost = async (req, res, next) => {
  let searchOptions;

  if (req.userData.isAdmin) {
    searchOptions = { _id: req.params.postId };
  } else {
    searchOptions = { _id: req.params.postId, author: req.userData.username };
  }

  await Post.deleteOne(searchOptions)
    .then(() =>
      Comment.deleteMany({ postId: req.params.postId })
        .then(() => res.status(200).json({ message: 'Post deleted' }))
        .catch((err) =>
          res.status(500).json({
            message: 'Not all posts comments deleted.',
            stacktrace: req.userData.isAdmin ? err : '😊'
          })
        )
    )
    .catch((err) =>
      res.status(401).json({ message: 'Not authorized!', stacktrace: req.userData.isAdmin ? err : '😊' })
    );
};

exports.deleteComment = async (req, res, next) => {
  let searchOptions;

  if (req.userData.isAdmin) {
    searchOptions = { _id: req.params.commentId };
  } else {
    searchOptions = { _id: req.params.commentId, author: req.userData.username };
  }

  await Comment.findById(req.params.commentId).then(
    async (comment) =>
      await Comment.deleteOne(searchOptions)
        .then(async (deleteResult) => {
          const isDeleted = deleteResult.n > 0;

          if (isDeleted) {
            await User.findOne({ username_lower: comment.author.toLowerCase() }).then(async (user) => {
              user.stats.contribComments--;
              user.stats.contribPoints -= 50;
              await User.updateOne({ username_lower: comment.author.toLowerCase() }, user);
            });

            await deleteCommentFromPostAsync(req, res);
          } else {
            res.status(500).json({ message: 'Deleting the comment was unsuccessful' });
          }
        })
        .catch((err) =>
          res.status(401).json({
            message: 'Not authorized!',
            stacktrace: req.userData.isAdmin ? err : '😊'
          })
        )
  );
};

exports.getPosts = async (req, res, next) => {
  await Post.find().then((documents) => res.status(200).json(documents));
};

exports.getPost = async (req, res, next) => {
  await Post.findById(req.params.postId)
    .then((post) => res.status(200).json(post))
    .catch((err) =>
      res.status(404).json({
        message: 'Post not found!',
        stacktrace: req.userData && req.userData.isAdmin ? err : '😊'
      })
    );
};

exports.updatePost = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  let searchOptions;

  if (req.userData.isAdmin) {
    searchOptions = { _id: req.params.postId };
  } else {
    searchOptions = { _id: req.params.postId, author: req.userData.username };
  }

  await Post.findOne(searchOptions)
    .then(async (post) => {
      post.currentTitle = req.body.currentTitle;
      post.currentContent = req.body.currentContent;
      post.currentDate = new Date().getTime();
      post.titles.push(req.body.currentTitle);
      post.contents.push(req.body.currentContent);
      post.dates.push(post.currentDate);

      await Post.updateOne(searchOptions, post)
        .then(async function (result) {
          const isModified = result.n > 0;

          if (isModified) {
            const updatedPost = await Post.findById(req.params.postId);
            res.status(200).json({ message: 'Post updated', post: updatedPost });
          } else {
            res.status(500).json({ message: 'Something went wrong. Post is not updated.' });
          }
        })
        .catch((err) =>
          res.status(401).json({ message: 'Not authorized!', stacktrace: req.userData.isAdmin ? err : '😊' })
        );
    })
    .catch((err) =>
      res.status(401).json({ message: 'Not authorized!', stacktrace: req.userData.isAdmin ? err : '😊' })
    );
};

exports.updateComment = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  let searchOptions;

  if (req.userData.isAdmin) {
    searchOptions = { _id: req.params.commentId };
  } else {
    searchOptions = { _id: req.params.commentId, author: req.userData.username };
  }

  await Comment.findOne(searchOptions)
    .then(async (comment) => {
      comment.currentTitle = req.body.currentTitle;
      comment.currentContent = req.body.currentContent;
      comment.currentDate = new Date().getTime();
      comment.titles.push(req.body.currentTitle);
      comment.contents.push(req.body.currentContent);
      comment.dates.push(comment.currentDate);

      await Comment.updateOne(searchOptions, comment).then(async (result) => {
        const isModified = result.n > 0;

        if (isModified) {
          return await updateCommentInPostAsync(req, res, comment);
        } else {
          return res.status(500).json({ message: 'Something went wrong. Comment did not updated.' });
        }
      });
    })
    .catch((err) => res.status(401).json({ message: 'Unauthorized!', stacktrace: req.userData.isAdmin ? err : '😊' }));
};

exports.voteOnComment = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  await Comment.findById(req.params.commentId)
    .then((comment) => putNewVoteAsync(req, res, comment, true))
    .catch((err) => res.status(401).json({ message: 'Unauthorized!', stacktrace: req.userData.isAdmin ? err : '😊' }));
};

exports.voteOnPost = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  await Post.findById(req.params.postId)
    .then((post) => putNewVoteAsync(req, res, post, false))
    .catch((err) => res.status(401).json({ message: 'Unauthorized!', stacktrace: req.userData.isAdmin ? err : '😊' }));
};

/* Utilities Functions */

async function deleteCommentFromPostAsync(req, res) {
  await Post.findById(req.params.postId)
    .then(async (post) => {
      let commentToDeleteIndex;

      for (let i = 0; i < post.comments.length; i++) {
        if (String(post.comments[i]._id) === req.params.commentId) {
          commentToDeleteIndex = i;
          break;
        }
      }

      post.comments.splice(commentToDeleteIndex, 1);

      await Post.updateOne({ _id: req.params.postId }, post).then(async (result) => {
        const isModified = result.n > 0;

        if (isModified) {
          res.status(200).json({ message: 'Comment deleted' });
        } else {
          res.status(500).json({ message: 'Comment deleted but post was not updated' });
        }
      });
    })
    .catch((err) =>
      res.status(401).json({ message: 'Not authorized!', stacktrace: req.userData.isAdmin ? err : '😊' })
    );
}

async function updateCommentInPostAsync(req, res, updatedComment) {
  await Post.findById(req.params.postId)
    .then(async function (post) {
      let oldComment;

      for (const currComment of post.comments) {
        if (String(currComment._id) === String(updatedComment._id)) {
          oldComment = currComment;
          break;
        }
      }

      oldComment.currentTitle = updatedComment.currentTitle;
      oldComment.currentContent = updatedComment.currentContent;
      oldComment.currentDate = updatedComment.currentDate;
      oldComment.titles = updatedComment.titles;
      oldComment.contents = updatedComment.contents;
      oldComment.dates = updatedComment.dates;

      await Post.updateOne({ _id: req.params.postId }, post)
        .then(async function (result) {
          const isModified = result.n > 0;

          if (isModified) {
            const comment = await Comment.findById(req.params.commentId);
            res.status(200).json({ message: 'Comment updated', comment: comment });
          } else {
            res.status(500).json({ message: 'Something went wrong. Comment updated in DB but not inside post.' });
          }
        })
        .catch((err) =>
          res
            .status(500)
            .json({ message: 'Comment updated but post not.', stacktrace: req.userData.isAdmin ? err : '😊' })
        );
    })
    .catch((err) =>
      res.status(400).json({
        message: 'Comment found but the linked post is missing',
        stacktrace: req.userData.isAdmin ? err : '😊'
      })
    );
}

async function putNewVoteAsync(req, res, toPutIn, isComment) {
  if (toPutIn.author === req.userData.username) {
    return res.status(403).json({ message: 'User cannot vote on his own post or comment' });
  } else if (toPutIn.votes.has(req.userData.username)) {
    return res.status(403).json({ message: 'User voted already' });
  }

  await addVoteNotificationAsync(toPutIn, isComment, req, res);

  if (isComment) {
    await updateCommentVotesAsync(toPutIn, req, res);
  } else {
    await updatePostVotesAsync(toPutIn, req, res);
  }
}

async function addVoteNotificationAsync(entity, isComment, req) {
  const messageToDisplay = `${req.userData.username} ${req.body.isUp ? 'upvoted' : 'downvoted'} your ${
    isComment ? 'comment in a post' : `post: ${entity.currentTitle}`
  }.`;

  await addNotificationToUserAsync(
    entity.author,
    new Notification({
      sender: req.userData.username,
      title: `Someone voted on your ${isComment ? 'comment' : 'post'}`,
      content: messageToDisplay,
      seen: false,
      url: `/forum/post/${isComment ? entity.postId : entity._id}`,
      createdAt: new Date().getTime()
    })
  );
}

async function addNotificationToUserAsync(username, notification) {
  await User.findOne({ username_lower: username.toLowerCase() })
    .then(async (user) => {
      if (user) {
        user.notifications.push(notification);
        await User.updateOne({ username_lower: username.toLowerCase() }, user);
      }
    })
    .catch((err) => console.log(err));
}

async function updatePostVotesAsync(post, req, res) {
  const newVote = new Vote({
    username: req.userData.username,
    isUp: req.body.isUp,
    message: req.body.message
  });

  post.votes.set(newVote.username, newVote);
  Post.updateOne({ _id: req.params.postId }, post)
    .then(async (result) => {
      const isModified = result.n > 0;

      if (isModified) {
        return res.status(200).json({ message: 'Post updated.' });
      } else {
        return res.status(500).json({ message: 'Something went wrong. Post was not updated.' });
      }
    })
    .catch((err) =>
      res
        .status(500)
        .json({ message: 'Something went wrong. Post was not updated.', stacktrace: req.userData.isAdmin ? err : '😊' })
    );
}

async function updateCommentVotesAsync(comment, req, res) {
  const newVote = new Vote({
    username: req.userData.username,
    isUp: req.body.isUp,
    message: req.body.message
  });

  comment.votes.set(newVote.username, newVote);
  Comment.updateOne({ _id: req.params.commentId }, comment)
    .then(async (result) => updateCommentVoteInPostAsync(req, res, result, comment, newVote))
    .catch((err) =>
      res.status(500).json({
        message: 'Something went wrong. Comment was not updated.',
        stacktrace: req.userData.isAdmin ? err : '😊'
      })
    );
}

async function updateCommentVoteInPostAsync(req, res, updateResult, commentToUpdate, newVote) {
  const isModified = updateResult.n > 0;

  if (isModified) {
    await Post.findById(req.params.postId)
      .then(async (post) => {
        let oldComment;

        for (const currComment of post.comments) {
          if (String(currComment._id) === String(commentToUpdate._id)) {
            oldComment = currComment;
            break;
          }
        }

        oldComment.votes.set(newVote.username, newVote);

        await Post.updateOne({ _id: req.params.postId }, post)
          .then(async function (result) {
            const isModified = result.n > 0;

            if (isModified) {
              const comment = await Comment.findById(req.params.commentId);
              res.status(200).json({ message: 'Comment updated', comment: comment });
            } else {
              res.status(500).json({ message: 'Something went wrong. Comment updated in DB but not inside post.' });
            }
          })
          .catch((err) =>
            res
              .status(500)
              .json({ message: 'Comment updated but post not.', stacktrace: req.userData.isAdmin ? err : '😊' })
          );
      })
      .catch((err) =>
        res.status(400).json({
          message: 'Comment found but the linked post is missing',
          stacktrace: req.userData.isAdmin ? err : '😊'
        })
      );
  } else {
    res.status(500).json({ message: 'Something went wrong. Comment was not updated.' });
  }
}
