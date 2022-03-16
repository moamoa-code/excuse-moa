// 구매자가 구매가능 제품 목록
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useState } from 'react';
import { Typography } from 'antd';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { loadMyInfoAPI } from '../../apis/user';
import AppLayout from '../../components/AppLayout';
import User from '../../interfaces/user';
import Item from '../../interfaces/item';
import { loadPostListAPI } from '../../apis/post';
import PostList from '../../components/PostList';




const CustomerPostList = () => {
  // const queryClient = useQueryClient();
  const { data: posts } = useQuery<Item>(['posts'], loadPostListAPI);
  const { Title } = Typography;

  return (
    <AppLayout>
      <div style={{maxWidth: '800px', padding: '10px', margin: '0 auto'}}>
        <Title level={4}>판매자 공지사항</Title>
        <PostList posts={posts} />
      </div>
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
