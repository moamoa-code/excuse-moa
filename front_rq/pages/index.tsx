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
import { loadRecentPostAPI } from '../apis/post';
import { PlusOutlined } from '@ant-design/icons';
import Router from 'next/router';
import styled from 'styled-components';
import { loadReceivedOrdersAPI } from '../apis/order';
import dayjs from 'dayjs';

const Container800 = styled.div`
max-width: 800px;
padding: 20px;
margin: 0 auto;
@media screen and (max-width: 600px) {
  padding: 10px;
}
`
const Container500 = styled.div`
max-width: 500px;
padding: 20px;
margin: 0 auto;
@media screen and (max-width: 600px) {
  padding: 10px;
}
`

// 메인 페이지
const Home = () => {
  const [ postData, setPostdata ] = useState({});
  const [ orderData, setOderdata ] = useState([]);
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI, {
    onSuccess(data) {
      if(data?.role === 'CUSTOMER'){
        loadRecentPostAPI()
        .then((data) => {
          setPostdata(data);
        })
      } if (data?.role === 'PROVIDER' || data?.role === 'ADMINISTRATOR') {
        loadReceivedOrdersAPI(data.id, 3)
        .then((data) => {
          setOderdata(data);
          console.log('setOderdata',data);
        })
      }
    }
  });
  const [ isLoggedin, setIsloggedin ] = useState(false)
  const { Title } = Typography;

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
        <Container500>
          <Title level={4}>로그인이 필요한 서비스 입니다.</Title>
          { myUserInfo ? <UserProfile /> : <LoginForm /> }
        </Container500>
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
            <p>계정삭제 처리 중 입니다.</p>
          :null}
          {myUserInfo?.role === 'CUSTOMER'?
            <>
              <Title level={5}>판매자 공지사항</Title>
              <PostView post={postData} />
              <Button 
                onClick={() => (Router.replace(`/post/list`))}
                type="dashed"
                size="large"
                block>
                  <PlusOutlined /> 전체 공지사항 보기
              </Button>
            </>
          : null }
          {myUserInfo?.role === 'PROVIDER' || myUserInfo?.role === 'ADMINISTRATOR'?
          <>
            <Title level={5}>최근 주문현황</Title>
            <Table
              pagination={false}
              size="small"
              rowKey="id"
              columns={[
                {
                  title: '주문일시',
                  dataIndex: 'date',
                  key: 'date',
                  render: (text, record) => (
                    <>{dayjs(text).format('YY.MM.DD HH:mm')}</>
                  ),
                }, {
                  title: '고객사',
                  dataIndex: 'Customer',
                  key: 'date',
                  render: (text, record) => (
                    <>{text?.company ?? record.name}</>
                  ),
                }, {
                  title: '주문상태',
                  dataIndex: 'status',
                  key: 'status',
                }, {
                  title: '',
                  key: 'action',
                  render: (text, record) => (
                    <Link href={`/management/check-order/${record.id}`}><a>자세히</a></Link>
                  ),
                }
              ]}
              dataSource={orderData}
            />
            <Link href="/management/check-order/list"><a>            
                <Button 
                // onClick={() => (Router.replace(`/management/check-order/list`))}
                type="dashed"
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
  const orderId = context.params?.id as string;
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(['user'], () => loadMyInfoAPI());
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default Home;
