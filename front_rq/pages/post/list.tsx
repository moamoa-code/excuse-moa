// 구매자가 볼 수 있는 공지사항 목록
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useState } from 'react';
import { Typography } from 'antd';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { loadMyInfoAPI } from '../../apis/user';
import AppLayout from '../../components/AppLayout';
import Item from '../../interfaces/item';
import { loadPostListAPI } from '../../apis/post';
import PostList from '../../components/PostList';
import { Container800 } from '../../components/Styled';
import MyTable from '../../components/MyTable';
import dayjs from 'dayjs';
import PostView from '../../components/PostView';
import { useMediaQuery } from 'react-responsive';
import styled from 'styled-components';

const CustomerPostList = () => {
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:768px)",
  });
  const { data: posts } = useQuery<Item>(['posts'], loadPostListAPI);
  const { Title } = Typography;

  const columns = [
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
  return (
    <AppLayout>
      <Container800>
        <Title level={4}>공지사항</Title>
        {!isMobile?
          <PostList posts={posts} />
          :
          <MyTable 
            dataSource={posts}
            columns={columns}
            rowKey="id"
            expandable={{
              expandedRowRender: (record) => 
              <PostView post={record}/>,
            }}
          />
        }
        <br/><br/>
      </Container800>
    </AppLayout>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const cookie = context.req ? context.req.headers.cookie : ''; // 쿠키 넣어주기
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  const queryClient = new QueryClient();
  const response = await loadMyInfoAPI();
  if (!response) { // 로그인 안했으면 홈으로
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  await queryClient.prefetchQuery(['user'], () => loadMyInfoAPI());
  await queryClient.prefetchQuery(['posts'], () => loadPostListAPI());
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default CustomerPostList;
