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
