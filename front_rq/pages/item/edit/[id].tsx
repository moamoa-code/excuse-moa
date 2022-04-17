// 상품 수정
import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState } from 'react';
import { Form, Input, Button, Tag, Checkbox, Divider, Space, notification } from 'antd';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useQuery, useMutation, useQueryClient } from 'react-query';
import { loadMyInfoAPI } from '../../../apis/user';
import { loadItemAPI, addCustomerToItemAPI } from '../../../apis/item';
import useInput from '../../../hooks/useInput';
import AppLayout from '../../../components/AppLayout';
import User from '../../../interfaces/user';
import Item from '../../../interfaces/item';
import ItemEdit from '../../../components/ItemEdit';
import { CheckCircleOutlined } from '@ant-design/icons';
import Router from 'next/router';

const EditItem = () => {
  const router = useRouter();
  // const queryClient = useQueryClient();
  const { id } = router.query; // 제품의 id
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { data: item } = useQuery<Item>(['item', id], () => loadItemAPI(Number(id)));
  
  return (
    <AppLayout>
      <div style={{maxWidth: '800px', padding: '10px', margin: '0 auto'}}>
        <ItemEdit item={item} myUserInfo={myUserInfo} />
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
  if (response.role !== 'PROVIDER' && response.role !== 'ADMINISTRATOR') { // 로그인 안했으면 홈으로
    return {
      redirect: {
        destination: '/unauth',
        permanent: false,
      },
    };
  }
  const id = context.params?.id as string;
  await queryClient.prefetchQuery(['user'], () => loadMyInfoAPI());
  await queryClient.prefetchQuery(['item', id], () => loadItemAPI(Number(id)));
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default EditItem;
