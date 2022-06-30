const express = require("express");
// const authMiddleware = require("../middlewares/auth-middleware");
const User = require("../schemas/users");
const Post = require("../schemas/posts");
const Images = require("../schemas/image");
const router = express.Router();

//s3
const aws = require('aws-sdk');
const s3 = new aws.S3();

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-northeast-2",
});

// Post 전체 정보 불러오기
router.get('/postList', async (req, res) => {
  try {
    const posts = await Post.find().sort({ postId: -1 }); //오름차순 정렬
    res.status(200).json({
      posts,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Post 상세 보기
router.get(
  '/posts/:postId',
   authMiddlewares,
  async (req, res) => {
    try {
      const { postId } = req.params;
      const posts= await Post.findOne({ postId: parseInt(postId) });
      const existingComment = await Comment.find({
        postId: parseInt(postId),
      }).sort({ postId: -1 });

      res.status(200).json({
        posts,
        existingComment,
        message: '상세페이지 보기 성공',
      });
    } catch (err) {
      res.status(400).json({
        errorMessage: '상세페이지 보기 실패',
      });
      console.log('Post 상세페이지 보기 실패: ' + err);
    }
  }
);
//Post 작성
router.post(
  '/posts/postId',
  authMiddlewares,
  async (req, res) => {
    try {
      const { userId } = res.locals.user;
      const existingUser = await User.findOne({ _id: userId });
      const {
        postCategory,
        postImage,
        postContent,
      } = req.body;

      const createdAt = new Date();
      // const date = now.toLocaleDateString('ko-KR');
      // const hours = now.getHours();
      // const minutes = now.getMinutes();
      const userNickname = existingUser.userNickname;
      const authorId = existingUser._id;
      const createPost = await Post.create({
        postCategory,
        postImage,
        createdAt,
        postContent,
        userNickname,
        authorId,
      });

      res
        .status(200)
        .json({ Posts: createPost, message: 'Post 생성 성공.' });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        errorMessage: 'Post생성 실패',
      });
    }
  }
);

// Post 수정 :

router.put(
  '/posts/:postId',
  authMiddlewares,
  async (req, res) => {
    const { postId } = req.params;
    const { userId } = res.locals.user.userId;
    const createdAt = new Date();
    const { 
      postCategory, 
      postImage, 
      postContent 
      } =
      req.body;
    const existingPost = await Post.findOne({ postId: parseInt(postId) });

    if (userId !== existingPost.authorId.toString()) {
      res.status(400).json({ success: false, message: '내 게시물이 아닙니다' });
    } else {
      await Post.updateOne(
        { postId: parseInt(postId) },
        {
          $set: {
            postCategory, 
            postImage,
            createdAt, 
            postContent,
          },
        }
      );
      res.status(200).json({ success: true, message: '게시물 수정 완료' });
    }
  }
);

// Post 삭제 : 유저확인,삭제되는 포스트와 같은 postId값 가진 댓글들도 삭제
router.delete('posts/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;
  const userId = res.locals.user.userId;

  const existPost = await Post.findOne({ postId: parseInt(postId) });
  const existComment = await Comment.find({ postId: parseInt(postId) });

  if (userId === existPost.userId) {
    if (existPost && existComment) {
      await Post.deleteOne({ postId: parseInt(postId) });
      await Comment.deleteMany({ postId: parseInt(postId) });
      res.send({ result: ' 성공' });
    } else if (existPost) {
      await Post.deleteOne({ postId: parseInt(postId) });
      res.status(200).send({ result: '포스트 삭제 성공' });
    }
  } else {
    res.status(401).send({ result: '포스트 삭제 실패' });
  }
});

// 좋아요 추가 기능
router.post('/likes/:postId', auth, async (req, res) => {
  const { userId } = res.locals.user
  const { postId } = req.params
  const isLike = await Like.findOne({ userId:userId,postId})
  if (isLike) {
      return res
          .status(400)
          .json({ errorMessage: '이미 좋아요 되어있는 상태입니다.' })
  } else {
      await Like.create({userId,postId })
      const existLikes = await Comments.findOne({postId:postId})
      if (existLikes) {
          const countLikes = existLikes.countLikes + 1
          await Comments.updateOne(
              { postId: postId },
              { $set: { countLikes } }
          )
      }
  }
  res.status(201).json({ message: '좋아요 추가 되었습니다.' })
})

// 좋아요 제거 기능
router.delete('/likes/:postId',auth,
  async (req, res) => {
      const { userId } = res.locals.user
      const { postId } = req.params
      const isLike = await Like.findOne({ postId, userId })
      if (!isLike) {
          return res
              .status(400)
              .json({ errorMessage: '이미 좋아요 되어있지 않은 상태입니다.' })
      } else {
          await Like.deleteOne({ userId, postId })
          const existLikes = await Comments.findOne({ postId: postId })
          if (existLikes) {
              const countLikes = existLikes.countLikes - 1
              await Comments.updateOne(
                  { postId: postId },
                  { $set: { countLikes } }
              )
          }
      }
      res.status(201).json({ message: '좋아요 취소 되었습니다.' })
  }
)

router.get('/likes/:postId', async (req, res) => {
  const { postId } = req.params
  const existLikeUsers = await Like.find({ postId })
  const likeUsers = existLikeUsers.map((item) => item.userId)
  res.json({ likeUsers })
})
// <---좋아요 개수 API-->
// 특정 글에 대한 좋아요가 몇 개인지만 보여주는 API
router.get("/like/:postId", async (req, res) => {
  const { postId } = req.params;
  const comment = awaitComments.findOne({ postId: Number(postId) });
  const likes = comment["likes"];

  res.json({
    likes,
  });
});

module.exports = router;