const express = require('express');
const multer = require('multer'); // 파일업로드, formData처리
const path = require('path');
const fs = require('fs'); // 폴더처리
const router = express.Router();

const db = require('../models');
const { User } = require('../models'); // 시퀄라이즈 - MySQL DB연결
const { Post } = require('../models'); // 시퀄라이즈 - MySQL DB연결
const { Op } = require("sequelize"); // 시퀄라이즈 연산자 사용

const { isLoggedIn, isProvider } = require('./middlewears'); // 로그인 검사 미들웨어
const { text } = require('express');

// 아마존 S3에 사진 업로드
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const user = require('../models/user');

// 파일 업로드, 이름 변경 처리 + 아마존 S3
AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: 'ap-northeast-2', // 서울
});
const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: 'excuse-moa',
    key (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, `original/${Date.now()}_${path.basename(file.originalname).substring(0,5)+ext}`)
    }
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

// // 업로드 폴더 생성
// try {
//   fs.accessSync('uploads');
// } catch (error) {
//   console.log('uploads 폴더가 없으므로 생성합니다.');
//   fs.mkdirSync('uploads');
// }
// // 파일 업로드, 이름 변경 처리
// const upload = multer({
//   storage: multer.diskStorage({
//     destination(req, file, done) {
//       done(null, 'uploads');
//     },
//     filename(req, file, done) {
//       const ext = path.extname(file.originalname);
//       console.log('#### ile.originalname',file.originalname)
//       console.log('#### ext',ext)
//       const basename = path.basename(file.originalname, ext).substring(0,5);
//       console.log('#### ext',basename)
//       done(null, basename + '_' + new Date().getTime() + ext);
//     },
//   }),
//   limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
// });

// 게시글 등록
router.post('/regist', isProvider, upload.none(), async (req, res, next) => {
  try {
    let done = false;
    let post;
    let scope = req.body.scope;
    if (req.body.content?.length > 999) {
      return res.status(401).send('1000자(줄바꿈 포함)를 초과했습니다.');
    }
    const me = await User.findOne({
      where: { id: req.user.id },
    });
    if (req.body.scope !== 'PRIVATE' && req.body.scope !== 'GROUP' && req.body.scope !== 'PUBLIC') {
      scope = 'PRIVATE';
    }
    let provider;
    if (me.role === 'ADMINISTRATOR'){
      if (req.body.providerId !== null && req.body.providerId !== undefined){
        provider = await User.findOne({
          where: { id: req.body.providerId },
        });
      }
    }
    if (me.role === 'ADMINISTRATOR' && scope !== 'PUBLIC' && !provider) {
      return res.status(403).send('판매자가 존재하지 않습니다.');
    }
    if (me.role === 'ADMINISTRATOR'){
      if (scope === 'PUBLIC'){
        if (req.body.imgSrc !== undefined) {
          post = await Post.create({
            title: req.body.title,
            content: req.body.content,
            scope: scope,
            UserId: req.user.id,
            imgSrc: req.body.imgSrc,
          })
        } else {
          post = await Post.create({
            title: req.body.title,
            content: req.body.content,
            scope: scope,
            UserId: req.user.id,
          })
        }
        done = true;
      }
      else if (!done && (scope === 'PRIVATE' || scope === 'GROUP')){
        if (req.body.imgSrc !== undefined) {
          post = await Post.create({
            title: req.body.title,
            content: req.body.content,
            scope: scope,
            UserId: provider.id,
            imgSrc: req.body.imgSrc,
          })
        } else {
          post = await Post.create({
            title: req.body.title,
            content: req.body.content,
            scope: scope,
            UserId: provider.id,
          })
        }
        done = true;
      }
    }
    if (done) {
      return res.status(200).json(post.id);
    }
    if (req.body.imgSrc !== undefined) {
      post = await Post.create({
        title: req.body.title,
        content: req.body.content,
        scope: scope,
        UserId: req.user.id,
        imgSrc: req.body.imgSrc,
      })
    } else {
      post = await Post.create({
        title: req.body.title,
        content: req.body.content,
        scope: scope,
        UserId: req.user.id,
      })
    }
    return res.status(200).json(post.id);
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});
// 사진 업로드 
router.post('/image', isLoggedIn, upload.array('image'), (req, res, next) => {
  // res.json(req.files[0].filename);
  res.json(req.files[0].location); // S3는 location
});

// 게시글 수정
router.post('/edit', isLoggedIn, upload.none(), async (req, res, next) => {
  try {
    const post = await Post.findOne({ 
        where: { id: req.body.postId } 
    });
    if (!post) {
      res.status(403).send('해당 게시글이 존재하지 않습니다.');
    }
    let scope = req.body.scope;
    if (req.body.scope !== 'PRIVATE' && req.body.scope !== 'GROUP' && req.body.scope !== 'PUBLIC'){
      scope = 'PRIVATE';
    }
    if (req.body.imgSrc !== undefined) {
      await Post.update({
        content: req.body.content,
        title: req.body.title,
        scope,
        imgSrc: req.body.imgSrc
      },{
        where: { id: post.id },
      });
    } else {
      await Post.update({
        content: req.body.content,
        title: req.body.title,
        scope,
        imgSrc: null,
      },{
        where: { id: post.id },
      });
    }
    res.status(200).json(post.id);
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 게시글 삭제
router.patch('/delete', isProvider, upload.none(), async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id }
    })
    const post = await Post.findOne({ 
      where: { id: req.body.id }
    });
    if (!post) {
      return res.status(403).send('해당 게시글이 존재하지 않습니다.');
    }
    if (post.UserId === req.user.id || user.role === 'ADMINISTRATOR' ){
      await Post.destroy({
        where: { id: post.id }
      })
    } else {
      return res.status(403).send('권한이 없습니다.');
    }
    res.status(200).send('ok');
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});

// 회원이 볼 수 있는 게시글 목록 불러오기
router.get('/list', isLoggedIn, async (req, res, next) => { 
  try {
    const user = await User.findOne({
      where: { id: req.user.id }
    })
    if (!user) {
      return res.status(404).send('유저가 존재하지 않습니다.');
    }
    const provider = await User.findOne({
      where: { id: user.ProviderId}
    })
    let myProviderPosts = [];
    if (provider) { // 판매자의 모든고객공개 공지
      myProviderPosts = await Post.findAll({
        order: [['createdAt', 'DESC']],
        where: {
          scope: 'GROUP',
          UserId: provider.id
        },
        include: [{
          model: User,
          attributes: ["id", "company"],
        }]
      });
    }
    const adminPosts = await Post.findAll({ // 관리자 공지
      order: [['createdAt', 'DESC']],
      where: {
        scope: 'PUBLIC'
      },
      include: [{
        model: User,
        attributes: ["id", "company"],
      }]
    });

    const myPrivatePosts = await user.getUserViewPosts({
      order: [['createdAt', 'DESC']],
      where: {
        scope: 'PRIVATE'
      },
      include: [{
        model: User,
        attributes: ["id", "company"],
      }]
    })

    let myPosts = [...myProviderPosts, ...adminPosts, ...myPrivatePosts];
    myPosts.sort((a, b) => b.id - a.id);

    return res.status(200).json(myPosts);
    
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 회원이 볼 수 있는 최근 게시글 3개 불러오기
router.get('/recent', isLoggedIn, async (req, res, next) => { 
  try {
    const user = await User.findOne({
      where: { id: req.user.id }
    })
    if (!user) {
      return res.status(404).send('유저가 존재하지 않습니다.');
    }
    const provider = await User.findOne({
      where: { id: user.ProviderId}
    })
    let myProviderPosts;
    if (provider) { // 판매자의 모든고객공개 공지
      myProviderPosts = await Post.findAll({
        order: [['createdAt', 'DESC']],
        where: {
          scope: 'GROUP',
          UserId: provider.id
        },
        limit: 3,
        include: [{
          model: User,
          attributes: ["id", "company"],
        }]
      });
    }
    const adminPosts = await Post.findAll({ // 관리자 공지
      order: [['createdAt', 'DESC']],
      where: {
        scope: 'PUBLIC'
      },
      limit: 3,
      include: [{
        model: User,
        attributes: ["id", "company"],
      }]
    });

    const myPrivatePosts = await user.getUserViewPosts({
      order: [['createdAt', 'DESC']],
      where: {
        scope: 'PRIVATE'
      },
      limit: 3,
      include: [{
        model: User,
        attributes: ["id", "company"],
      }]
    })
    let myPosts = [...myProviderPosts, ...adminPosts, ...myPrivatePosts];
    myPosts.sort((a, b) => b.id - a.id);
    myPosts = myPosts.slice(0, 3);
    return res.status(200).json(myPosts);
    
  } catch (error) {
    console.error(error);
    next(error);
  }
});


// 관리자 공지사항 3개 불러오기
router.get('/admin-recent', isLoggedIn, async (req, res, next) => { 
  try {
    const user = await User.findOne({
      where: { id: req.user.id }
    })
    if (!user) {
      return res.status(404).send('유저가 존재하지 않습니다.');
    }
    const adminPosts = await Post.findAll({ // 관리자 공지
      order: [['createdAt', 'DESC']],
      where: {
        scope: 'PUBLIC'
      },
      limit: 3,
      include: [{
        model: User,
        attributes: ["id", "company"],
      }]
    });
    return res.status(200).json(adminPosts);
    
  } catch (error) {
    console.error(error);
    next(error);
  }
});


// 작성한 게시글 목록 불러오기
router.get('/all', isProvider, async (req, res, next) => { 
  try {
    const posts = await Post.findAll({
      order: [['createdAt', 'DESC']],
      attributes: {
        exclude: ["imgSrc", "status", "content"],
      },
      include: [{
        model: User,
        attributes: ["id", "company", "key"],
      }]
    });
    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// 작성한 게시글 불러오기
router.get('/my', isLoggedIn, async (req, res, next) => { 
  try {
    const posts = await Post.findAll({
      order: [['createdAt', 'DESC']],
      where: { UserId: req.user.id },
      include: [{
        model: User,
        attributes: ["id", "company"],
      }]
    });
    if (posts) {
      return res.status(200).json(posts);
    } else {
      return res.status(404).send('제품이 존재하지 않습니다.');
    }
    
  } catch (error) {
    console.error(error);
    next(error);
  }
});


// 게시글 열람가능한 고객 등록
router.post('/add-customer', isLoggedIn, async (req, res, next) => {
  try {
    let provider;
    if (req.body.providerId !== null && req.body.providerId !== undefined){
      provider = await User.findOne({
        where: { id: req.body.providerId }
      });
    } else {
      provider = await User.findOne({
        where: { id: req.user.id }
      });
    }
    const post = await Post.findOne({
      where: { id: req.body.id }
    });
    if (!post) {
      return res.status(404).send('해당 게시글이 존재하지 않습니다.');
    }
    if (post.UserId !== provider.id) {
      return res.status(404).send('권한이 없습니다.');
    }
    // 유저 아이디 있는지 검사
    if(req.body.values.customerIds){
      await Promise.all(
        req.body.values.customerIds.map( customerId => {
          const user = User.findOne({ 
            where: { id: customerId },
            attributes: ["id"],
          })
          if (!user){
            return res.status(404).send('해당 유저가 존재하지 않습니다.');
          }
        })
      );
    }
    const postViewUsers = await post.getPostViewUsers();
    if (postViewUsers) { // 기존 제품열람가능 유저 제거
      const deletedUsers = await post.removePostViewUsers(postViewUsers);
    }
    // 제품 열람가능한 유저 추가
    const postUsers = await post.addPostViewUsers(req.body.values.customerIds);

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    next(error); // status 500
  }
});


// 게시글 상세 조회
router.get('/:postId', async (req, res, next) => { // GET /post/1
  try {
    const post = await Post.findOne({
      where: { id: req.params.postId },
    });
    if (!post) {
      return res.status(404).send('해당 게시글이 존재하지 않습니다.');
    }
    const fullPost = await Post.findOne({
      where: { id: post.id },
      include: [{
        model: User,
        as: 'PostViewUsers',
        attributes: ["id", "company", "name", "key"],
      }, {
        model: User,
        attributes: ["id", "company", "key"],
      }]
    })
    res.status(200).json(fullPost);
  } catch (error) {
    console.error(error);
    next(error);
  }
});


module.exports = router;