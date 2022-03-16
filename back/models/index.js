const Sequelize = require('sequelize');
const env = process.env.NODE_NEV || 'development';  // 환경변수 -> 개발모드
const config = require('../config/config')[env];  // config에서 devlopment부분만 가져옴
const db = {};

// ERD보기 https://www.erdcloud.com/d/3SLMvSoco88QiwMFH

// 데이터베이스 접속정보입력 -> 시퀄라이즈가 노드와 MySQL 연결해줌.
const sequelize = new Sequelize(config.database, config.username, config.password, config);

// 만든 모델 불러오기
db.Address = require('./address')(sequelize, Sequelize);
db.Item = require('./item')(sequelize, Sequelize);
db.Order = require('./order')(sequelize, Sequelize);
db.OrderDetail = require('./orderDetail')(sequelize, Sequelize);
db.User = require('./user')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate){
    db[modelName].associate(db); // associate 반복 실행하면서 관계들 자동 연결
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
