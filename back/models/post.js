// 모델 -> 대문자 단수, MySQL 소문자 복수
module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', { // MySQL에는 users 테이블 생성
    // id는 mySQL에서 자동 생성됨.
    title: {
      type: DataTypes.STRING(25),
      allowNull: false, // 필수
    },
    status: { // 긴급공지, 확인됨
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    content: { // 메시지
      type: DataTypes.STRING(250),
      allowNull: false, // 필수
    },
    imgSrc: { // 이미지
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    scope: {
      type: DataTypes.STRING(10),
      defaultValue: "PRIVATE", // PRIVATE, GROUP, PUBLIC
      allowNull: false,
    },
    type : {
      type: DataTypes.STRING(10),
      defaultValue: "NOTICE",
      allowNull: false,
    }
  },{
    // modelName: 'Post',
    // tableName: 'posts',
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci' // 한글 처리
  });
  Post.associate = (db) => { // 릴레이션(관계) 정의
    db.Post.belongsTo(db.User); // 글 작성한 유저
    db.Post.belongsToMany(db.User, { through: 'PostUsers', as: 'PostViewUsers'}); // 메세지 열람가능 유저
  };
  return Post;
};