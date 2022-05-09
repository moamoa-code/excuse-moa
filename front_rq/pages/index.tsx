import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '../components/AppLayout';
import UserProfile from '../components/UserProfile';
import LoginForm from '../components/LoginForm';
import { GetServerSidePropsContext } from 'next';
import axios from 'axios';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { loadMyInfoAPI } from '../apis/user';
import User from '../interfaces/user';
import { Typography, Button, Table } from 'antd';
import PostView from '../components/PostView';
import { loadAdnminPostAPI, loadRecentPostAPI } from '../apis/post';
import { PlusOutlined } from '@ant-design/icons';
import Router from 'next/router';
import styled from 'styled-components';
import { loadReceivedOrdersAPI, loadRecentReceivedOrdersAPI } from '../apis/order';
import dayjs from 'dayjs';
import { Container800, ContainerMax, ContainerMid, HGap } from '../components/Styled';
import MyTable from '../components/MyTable';
import { useMediaQuery } from 'react-responsive';

const IntroContainer = styled.div`
text-align: center;
  .section {
    padding: 69px 25px 69px 25px;
    margin: 10px 0 10px 0;
    text-align: center;
    h1  {
      color: #4e4e4e;
      font-size: 18pt;
    }
    h2 {
      font-size: 14pt;
  }
  :nth-of-type(even) {
    background-color: #f9f9f9;
  }
  .grey {
    color:pink;
    background-color:grey;
  }
  button {
    margin: 5px;
    font-size: 14pt;
    padding: 0 15px;
    height: 40px;
    line-height: 40px;
    background-color: white;
    border: solid 1px #d3d3d3;
    border-radius: 20px;
  }
}
`

// 메인 페이지
const Home = () => {
  const [ content, setContent ] = useState('intro');
  const [ posts, setPosts ] = useState([]);
  const [ orderData, setOderdata ] = useState([]);
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:768px)",
  });
  const { data: myUserInfo } = useQuery<User>(['user'], loadMyInfoAPI, {
    onSuccess(data) {
      // -> SSR 안되는 문제로 주석처리
      // if(data?.role === 'CUSTOMER') {
      //   loadRecentPostAPI()
      //   .then((response) => {
      //     setPosts(response);
      //   })
      // } if (data?.role === 'PROVIDER' || data?.role === 'ADMINISTRATOR') {
      //   loadRecentReceivedOrdersAPI(data.key)
      //   .then((response) => {
      //     setOderdata(response);
      //     console.log('setOderdata', response);
      //   })
      // } if (data?.role === 'PROVIDER') {
      //   loadAdnminPostAPI()
      //   .then((response) => {
      //     setPosts(response);
      //     console.log('setOderdata', response);
      //   })
      // }
    }
  });
  const [ isLoggedin, setIsloggedin ] = useState(false)
  const { Title } = Typography;

  const getPostsOrOrdersData = (user) => {
    if(user?.role === 'CUSTOMER') {
      loadRecentPostAPI()
      .then((data) => {
        setPosts(data);
      })
    } if (user?.role === 'PROVIDER' || user?.role === 'ADMINISTRATOR') {
      loadRecentReceivedOrdersAPI(user.key)
      .then((data) => {
        setOderdata(data);
      })
    } if (user?.role === 'PROVIDER') {
      loadAdnminPostAPI()
      .then((data) => {
        setPosts(data);
      })
    }
  }

  useEffect(() => { // 로그인시 데이터 가져오기.
    console.log('useEffect 실행됨');
    if (myUserInfo) {
      getPostsOrOrdersData(myUserInfo);
    } 
  }, [myUserInfo]);

  const postColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      type: 'id',
      key: 'id',
    }, {
      title: '제목',
      dataIndex: 'title',
      type: 'title',
      key: 'title',
    }, {
      title: '작성자',
      dataIndex: 'User',
      key: 'User',
      render: (text, record) => (
        <>{text?.company}</>
      ),
    }, {
      title: '작성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (text, record) => (
        <>{dayjs(text).format('YY.MM.DD HH:mm')}{}</>
      ),
    }, 
  ]

  const orderColumns = [
    {
      title: '주문번호',
      dataIndex: 'id',
      type: 'id',
      key: 'id',
    }, {
      title: '총 공급가',
      key: 'totalPrice',
      dataIndex: 'totalPrice',
    }, {
      title: '총 중량',
      key: 'totalWeight',
      type: 'right',
      dataIndex: 'totalWeight',
    }, {
      title: '고객사',
      dataIndex: 'Customer',
      type: 'title',
      key: 'Customer',
      render: (text, record) => {
        return <>{text?.company ?? record.name}</>
      },
    }, {
      title: '주문일시',
      dataIndex: 'date',
      key: 'date',
      type: 'sub',
      render: (text, record) => (
        <>{dayjs(text).format('YY.MM.DD HH:mm')}</>
      ),
    }, {
      title: '주문상태',
      dataIndex: 'status',
      key: 'status',
    }, {
      title: '',
      key: 'action',
      type: 'right',
      render: (text, record) => (
        <Link href={`/management/check-order/${record.id}`}><a>보기</a></Link>
      ),
    }
  ]

  useEffect(() => {
    console.log('myUserInfo');
    if (myUserInfo) {
      console.log(true)
      setIsloggedin(true);
    } else {
      setIsloggedin(false);
      console.log(false)
    }
  }, [myUserInfo]);

  if (!isLoggedin) {
    return (
      <AppLayout>
        <ContainerMax>
          {content === 'intro' ?
            <IntroContainer>
              <div className='section'>
                <h1>
                  B2B 원두커피 주문관리 시스템
                </h1>
                <h2>
                  소규모 사업자 원두커피 주문 관리에 최적화된 시스템!<br />
                  복잡한 ERP나 수기장부는 이제 그만, 꼭 필요한 기능만 담았습니다.<br />
                  간편하게 원두커피를 주문 해 보세요.
                </h2>
              </div>
              <div className='section grey'>
                <h1>
                  편리한 모바일 인터페이스
                </h1>
                <h2>
                  KIOSK, 온라인 쇼핑몰과 비슷한 친숙한 UI로 간편하게 이용가능합니다.
                </h2>
              </div>
              <div className='section'>
                <h1>
                  판매회원 혹은 구매회원으로 시작해 보세요.
                </h1>
                  <button onClick={()=>setContent('customer')}>구매회원</button>
                    <br />
                  <button onClick={()=>setContent('provider')}>판매회원</button>
              </div>
            </IntroContainer>
          : content === 'customer' ?
            <IntroContainer>
              <div className='section'>
                <h1>
                  시작 방법
                </h1>
                <p>
                  판매자가 생성한 구매회원의 아이디로 로그인 하거나 <br />
                  회원가입 후, 판매자에게 이용신청을 할 수 있습니다. <br />
                  지정된 판매자에 문의하세요!
                </p>
                <HGap />
                <button onClick={()=>setContent('intro')}>뒤로가기</button>
              </div>
            </IntroContainer>
          : content === 'provider' ?
            <IntroContainer>
              <div className='section'>
                <h1>
                  고객 관리
                </h1>
                <p>
                  판매자는 고객을 생성하고 관리할 수 있습니다. <br />
                  따로 회원가입으로 가입한 고객을 판매자의 회원으로 등록할 수 있습니다.
                </p>
              </div>
              <div className='section'>
                <h1>
                  제품 주문
                </h1>
                <p>
                  판매자가 생성한 고객이 직접 시스템을 통해 제품주문이 가능하며<br />
                  판매자가 구매자를 선택해 발주가 가능합니다.
                </p>
              </div>
              <div className='section'>
                <h1>
                  고객 맞춤 관리
                </h1>
                <p>
                  구매자별로 노출가능한 제품, 공지사항을 설정 할 수 있습니다.
                </p>
                <HGap />
                <button onClick={()=>setContent('intro')}>뒤로가기</button>
              </div>
            </IntroContainer>
          :null}
        </ContainerMax>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
        <Container800>
          <Title level={5}>{myUserInfo?.company}</Title>
          {myUserInfo?.role === 'NOVICE' ?
            <p>관리자의 승인 이후 이용 가능합니다.</p>
          :null}
          {myUserInfo?.role === 'RESIGNED' ?
            <p>회원탈퇴 처리 중 입니다.</p>
          :null}
          {myUserInfo?.role === 'CUSTOMER'?
            <>
              <Title level={5}>공지사항</Title>
              <PostView post={posts[0]} /><HGap />
              {isMobile?
                <MyTable 
                  columns={postColumns}
                  dataSource={posts.slice(0,2)}
                  rowKey="id"
                  expandable={{
                    expandedRowRender: (record) => 
                    <PostView post={record}/>,
                  }}
                />
              :<>
                <Table
                  columns={postColumns}
                  dataSource={posts.slice(0,2)}
                  pagination={{ hideOnSinglePage: true }}
                  rowKey="id"
                  expandable={{
                    expandedRowRender: (record) => 
                    <PostView post={record}/>,
                  }}
                />
              </>}

              <Button 
                onClick={() => (Router.replace(`/post/list`))}
                size="large"
                type="text"
                block>
                  <PlusOutlined /> 전체 공지사항 보기
              </Button>
            </>
          : null }
          {myUserInfo?.role === 'PROVIDER'?
          <>
          <Title level={5}>관리자 공지사항</Title>
            {isMobile?
              <MyTable 
                columns={postColumns}
                dataSource={posts.slice(0,2)}
                rowKey="id"
                expandable={{
                  expandedRowRender: (record) => 
                  <PostView post={record}/>,
                }}
              />
            :<>
              <Table
                columns={postColumns}
                dataSource={posts.slice(0,2)}
                pagination={{ hideOnSinglePage: true }}
                rowKey="id"
                expandable={{
                  expandedRowRender: (record) => 
                  <PostView post={record}/>,
                }}
              />
            </>}
            <Button 
              onClick={() => (Router.replace(`/post/list`))}
              type="text"
              size="large"
              block>
              <PlusOutlined /> 전체 공지사항 보기
            </Button>
            <HGap /><HGap />
            <Title level={5}>최근 주문현황</Title>
            {isMobile?
              <MyTable 
                columns={orderColumns}
                dataSource={orderData}
                rowKey="id"
              />
            :<>
              <Table
                columns={orderColumns}
                dataSource={orderData}
                pagination={{ hideOnSinglePage: true }}
                rowKey="id"
              />
            </>}
            <Link href="/management/check-order/list"><a>            
                <Button 
                // onClick={() => (Router.replace(`/management/check-order/list`))}
                type="text"
                size="large"
                block>
                  <PlusOutlined /> 전체 주문 목록 보기
              </Button>
            </a></Link>

          </>
          : null }
        </Container800>
        
    </AppLayout>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const cookie = context.req ? context.req.headers.cookie : ''; // 쿠키 넣어주기
  axios.defaults.headers.Cookie = '';
  // const orderId = context.params?.id as string;
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(['user'], loadMyInfoAPI);
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default Home;
