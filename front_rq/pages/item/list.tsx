// 구매자가 구매가능 제품 목록
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useState } from 'react';
import { Typography } from 'antd';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { loadMyInfoAPI } from '../../apis/user';
import { loadCustomerItemsAPI } from '../../apis/item';
import useInput from '../../hooks/useInput';
import AppLayout from '../../components/AppLayout';
import ItemList from '../../components/ItemList'; // 제품 상세정보 보기 컴포넌트
import User from '../../interfaces/user';
import Item from '../../interfaces/item';


const CustomersItemList = () => {
  const router = useRouter();
  // const queryClient = useQueryClient();
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { data: items } = useQuery<Item>(['items'], loadCustomerItemsAPI);
  // const { data: allItems } = useQuery(['allItems'], loadMyGroupItemsAPI);
  const [loading, setLoading] = useState(false);
  const { Title } = Typography;

  return (
    <AppLayout>
      <div style={{maxWidth: '800px', padding: '10px', margin: '0 auto'}}>
        <Title level={4}>제품목록</Title>
        <ItemList items={items} myUserInfo={myUserInfo} />
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
  await queryClient.prefetchQuery(['items'], () => loadCustomerItemsAPI());
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default CustomersItemList;
