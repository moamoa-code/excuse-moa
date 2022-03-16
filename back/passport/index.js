const passport = require('passport');
const local = require('./local');
const { User } = require('../models');

module.exports = () => {
    passport.serializeUser((user, done) => {
        done(null, user.id); // 서버 세션에 로그인된 user의 id만 저장
        // 최적화 위해 유저정보 통째가 아니라 id만 세션에 저장해 준다.
    });

    passport.deserializeUser(async (id, done) => {
        try { // 로그인 후 유저 정보가 필요할때 id를 이용해 데이터 찾는다.
            const user = await User.findOne({ where: { id }});
            // console.log('디시리얼 user', user);
            done(null, user); // req.user에 넣어줌
        } catch (error) {
            console.error(error);
            done(error);
        }
    });

    local();
};

// 프론트에서 서버로는 cookie만 보내요(clhxy)
// 서버가 쿠키파서, 익스프레스 세션으로 쿠키 검사 후 id: 1 발견
// id: 1이 deserializeUser에 들어감
// req.user로 사용자 정보가 들어감

// 요청 보낼때마다 deserializeUser가 실행됨(db 요청 1번씩 실행)
// 실무에서는 deserializeUser 결과물 캐싱