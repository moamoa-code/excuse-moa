const { User } = require('../models'); // 시퀄라이즈 - MySQL DB연결

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) { // passport 기능, 로그인 됐는지 검사
    next(); // 다음 미들웨어로 보냄.
  } else {
    res.status(401).send('로그인이 필요합니다.');
  }
}

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) { // passport 기능, 로그인 됐는지 검사
    next(); // 다음 미들웨어로 보냄.
  } else {
    res.status(401).send('로그인하지 않른 사용자만 접근 가능합니다.');
  }
}

exports.isProvider = async (req, res, next) => {
  if (req.isAuthenticated()) { // passport 기능, 로그인 됐는지 검사
    try {
      const me = await User.findOne({
        where: { id: req.user.id }
      });
      if ( me.role !== 'ADMINISTRATOR' && me.role !== 'PROVIDER')  {
        console.log('권한없음');
        return res.status(403).send('열람권한이 없습니다.');
      }
      next(); // 다음 미들웨어로 보냄.
    }
    catch (error) {
      console.log(error);
      next(error);
    }
  } else {
    res.status(401).send('로그인이 필요합니다.');
  }
}