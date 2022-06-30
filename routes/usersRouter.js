const router = require('express').Router();
require('dotenv').config();
const User = require('../schemas/usersSchema');
// const authMiddleware = require('../middlewares/authMiddleware');
// 사용자 인증 미들웨어 추가예정

// 마이페이지 조회: 사용자 인증
router.get(
  '/mypage/:userNum',
  // authMiddleware,
  async (req, res) => {
    const { userNum } = req.params;
    const existingUser = await User.findOne({ userNum: parseInt(userNum) });
    res
      .status(200)
      .json({ existingUser, message: '마이 페이지 불러오기 성공' });
  }
);

// 마이페이지 수정: 사용자 인증
router.put(
  '/mypage/:userNum',
  // authMiddleware,
  async (req, res) => {
    const { userNum } = req.params;
    const { userId } = res.locals.user;
    const { nickname, userImage, mbti, introduction } = req.body;

    const existingUser = await User.findOne({ userNum: parseInt(userNum) });

    if (userId !== existingUser.userId) {
      res.status(400).json({ success: false, message: '내 정보가 아닙니다' });
    } else {
      await User.updateOne(
        { userNum: parseInt(userNum) },
        { $set: { nickname, userImage, mbti, introduction } }
      );
      res.status(200).json({ success: true, message: '내 정보 수정 성공' });
    }
  }
);

// MBTI 성격 별 검색 기능: 사용자 인증
router.get(
  '/userList',
  // authMiddleware,
  async (req, res) => {
    const userList = await User.find();
    res.status(200).send({ userList });
  }
);

module.exports = router;
