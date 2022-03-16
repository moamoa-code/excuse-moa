const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const bcrypt = require('bcrypt'); // 비밀번호 복호화
const { User } = require('../models');

// 로그인 작업
// front의 form으로 받은 data > reducer, saga  > axios(/user/login, data) > 
// backend routes/user > data가 req.body로 > db에서 user 찾아서 값 비교

module.exports = () => {
    passport.use(new LocalStrategy({
        usernameField: 'id', // form으로 받은 data.id -> req.body.id
        passwordField: 'password', // form으로 받은 data.password -> req.body.password
    }, async (id, password, done) => {
        try {
            // console.log('local.js',id,password,done);
            const user = await User.findOne({
                where: { id } // 해당 id db에 있는지 확인.
            });
            if (!user){ // id 없을경우
                return done(null, false, { reason: '존재하지 않는 사용자 입니다.' });
                // (서버에러, 성공, 클라이언트에러)
            }
            const result = await bcrypt.compare(password, user.password); 
            // 입력한 비밀번호와 서버에 저장된 비밀번호 비교
            if (result){ // 비밀번호 일치할 경우 user정보 반환
                return done(null, user);
            }
            return done(null, false, { reason: '비밀번호가 틀렸습니다.' });
        } catch (error) { // 서버 에러시
            console.error(error);
            return done(error);
        }
    }));
}