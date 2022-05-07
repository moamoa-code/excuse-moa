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
import { Container800, ContainerMid, HGap } from '../components/Styled';
import MyTable from '../components/MyTable';
import { useMediaQuery } from 'react-responsive';

// 메인 페이지
const Home = () => {
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
        console.log('setOderdata', data);
      })
    } if (user?.role === 'PROVIDER') {
      loadAdnminPostAPI()
      .then((data) => {
        setPosts(data);
        console.log('setOderdata', data);
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
        <ContainerMid>
          <Title level={4}>로그인이 필요한 서비스 입니다.</Title>
          { myUserInfo ? <UserProfile /> : <LoginForm /> }
        </ContainerMid>
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
