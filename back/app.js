const express = require("express");
const cors = require("cors");
const morgan = require("morgan"); // front에서 보내는 요청 console 해주는 툴
const dotenv = require("dotenv"); // 환경설정 정보 저장
const hpp = require("hpp");
const helmet = require("helmet");

const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path"); // 파일이름 관련

const db = require("./models");
const passportConfig = require("./passport"); // 패스포트(로그인관련)

const userRouter = require("./routes/user");
const itemRouter = require("./routes/item");
const orderRouter = require("./routes/order");
const postRouter = require("./routes/post");
const inventoryRouter = require("./routes/inventory");

dotenv.config();
const app = express();
// db.sequelize.sync({ alter: true }) // 테이블 수정 가능 설정
db.sequelize
  .sync({ logging: false })
  .then(() => {
    console.log("db 연결 성공");
  })
  .catch(console.error);
passportConfig();
let port = 80; // 포트번호
//     origin: ['http://localhost:3060', 'http://excusemoa.com'],
if (process.env.NODE_ENV === "production") {
  //배포모드일 떄
  port = 80;
  console.log("production 배포모드");
  app.use(morgan("combiend"));
  app.use(hpp());
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: ['http://localhost:3060', 'http://localhost:3070', 'http://excusemoa.com', 'http://moaorder.com'],
      credentials: true,
    })
  );
  // npm i pm2 cross-env helmet hpp
} else {
  port = 3070;
  console.log("dev 개발모드");
  app.use(morgan("dev"));
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
}

app.use("/", express.static(path.join(__dirname, "uploads")));
// front에서 이미지 폴더 접근 === '/back'(__dirname) + 'uploads'
app.use(express.json()); // req.body 파싱
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      // 쿠키 공유를 위한 필수 옵션
      httpOnly: true,
      secure: false,
      // domain: process.env.NODE_ENV === 'production' && '.excusemoa.com',
      domain: process.env.NODE_ENV === "production" && ".moaorder.com",
      // 백, 프론트 서버 IP 다르다면 쿠키공유 위해 도메인설정 필수
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.send("hello express");
});

// 다른 라우터 불러오기
app.use("/user", userRouter);
app.use("/item", itemRouter);
app.use("/order", orderRouter);
app.use("/post", postRouter);
app.use("/inventory", inventoryRouter);

app.listen(port, () => {
  console.log("서버 실행 중");
});
