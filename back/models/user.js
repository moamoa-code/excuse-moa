// 유저 테이블. 
// 크게 구매자, 판매자가 있으며 사업자번호로 가입한다.
// 가입시 비회원이며 관리자가 등급을 변경해줘야 서비스를 이용가능하다.

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', { // MySQL에는 users 테이블 생성
    id: {  // 회원번호
      type: DataTypes.INTEGER,
      allowNull: false, // 필수
      primaryKey: true,
      autoIncrement: true,
      unique: true, // 유일한 값
    },
    key: { // 로그인용 아이디 (사업자등록번호, 전화번호 등)
      type: DataTypes.STRING(30),
      allowNull: false, // 필수
      unique: true, // 유일한 값
    },
    hqNumber: { // 본사 사업자번호
      type: DataTypes.STRING(30),
      allowNull: true,
    }, 
    password: { // 비밀번호
      type: DataTypes.STRING(100),
      allowNull: false, // 필수
    },
    company : { // 회사명
      type: DataTypes.STRING(20),
      allowNull: false, // 필수
    },
    name : { // 담당자 이름
      type: DataTypes.STRING(12),
      allowNull: true, 
    },
    phone: { // 담당자 전화번호
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: { // 담당자 이메일
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    memo: { // 관리자 전용 회원 메모
      type: DataTypes.STRING(30), 
      allowNull: true,
    },
    role: { // 회원등급
      type: DataTypes.STRING(15),
      defaultValue: "NOVICE", 
      // 비회원 NOVICE, 판매자 PROVIDER, 구매자 CUSTOMER, 관리자 ADMINISTRATOR, 탈퇴신청 RESIGNED, 탈퇴완료 TERMINATED
      allowNull: false, // 필수
    },
    ProviderId: {  // 
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },{
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci' // 한글 처리
  });
  User.associate = (db) => { // 릴레이션(관계) 정의
    db.User.hasMany(db.Address); // 주소목록
    db.User.hasMany(db.Order, { as: 'Customer'}); // 주문내역
    db.User.hasMany(db.Order, { as: 'Provider'}); // 공급자
    db.User.hasMany(db.Post); // 등록한 게시글
    db.User.hasMany(db.Item); // 등록한 제품.
    // db.User.belongsTo(db.User, {as: 'Manager'}); // == Provider 지정 판매자
    // db.User.hasMany(db.User, {as: 'Customers'});
    db.User.belongsToMany(db.User, { through: 'UsersRelation', as: 'Providers', foreignKey: 'CustomerId' }); // 판매자-구매자 관계
    db.User.belongsToMany(db.User, { through: 'UsersRelation', as: 'Customers', foreignKey: 'ProviderId' }); // 판매자-구매자 관계
    db.User.belongsToMany(db.Item, { through: 'ItemUsers', as: 'UserViewItems' }); // 열람가능한 제품
    db.User.belongsToMany(db.Post, { through: 'PostUsers', as: 'UserViewPosts' }); // 열람가능 게시글
    db.User.belongsToMany(db.Item, { through: "Carts", as: 'cartItem'}); // 장바구니
  };
  return User;
};