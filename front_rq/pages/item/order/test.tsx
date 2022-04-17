// 주문서 목록
import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Table, Typography, DatePicker, Button, Space, Divider, message } from 'antd';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useQuery, useMutation, useQueryClient } from 'react-query';
import { loadMyInfoAPI } from '../../../apis/user';
import { loadMyOrdersAPI } from '../../../apis/order';
import OrderList from '../../../components/OrderList';

import User from '../../../interfaces/user';

import 'moment/locale/ko';
import styled from 'styled-components';
import AppLayout from '../../../components/AppLayout';

const Container800 = styled.div`
max-width: 800px;
padding: 20px;
margin: 0 auto;
@media screen and (max-width: 600px) {
  padding: 10px;
}
`

const Test = () => {
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  return (
    <AppLayout>
      <Container800>
        <OrderList userInfo={myUserInfo} mode="CUSTOMER"/>
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
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default Test;
