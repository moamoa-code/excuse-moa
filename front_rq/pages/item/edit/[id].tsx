import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import React from 'react';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { loadItemAPI } from '../../../apis/item';
import { loadMyInfoAPI } from '../../../apis/user';
import AppLayout from '../../../components/AppLayout';
import ItemEdit from '../../../components/ItemEdit';
import Item from '../../../interfaces/item';
import User from '../../../interfaces/user';

// --(판매회원)제품 수정 페이지--
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
