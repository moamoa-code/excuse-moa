// 주문서 목록
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useEffect, useState } from 'react';
import { dehydrate, QueryClient, useQuery, useMutation, useQueryClient } from 'react-query';
import { loadMyInfoAPI, loadProvidersAPI } from '../../apis/user';
import AppLayout from '../../components/AppLayout';
import { Container800, ListBox } from '../../components/Styled';

const Tests = () => {
  const [someArray, setSomeArray] = useState([1,2,3,4,5,6,7,8,9]);
  const [selectedArray, setSelectedArray] = useState([]);
  
  return (
    <AppLayout>
      <Container800>
      {someArray.map((v) => {
        return (
          <button
            onClick={()=> {
              let array = selectedArray;
              array = [...array, v];
              return setSelectedArray(array);
            }}
          >
            {v}
          </button>
        )
      })}
      {JSON.stringify(selectedArray)}
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
  // if (!response) { // 로그인 안했으면 홈으로
  //   return {
  //     redirect: {
  //       destination: '/unauth',
  //       permanent: false,
  //     },
  //   };
  // }
  // if (response.role !== 'ADMINISTRATOR') { // 관리자 권한
  //   return {
  //     redirect: {
  //       destination: '/unauth',
  //       permanent: false,
  //     },
  //   };
  // }
  await queryClient.prefetchQuery(['user'], () => loadMyInfoAPI());
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default Tests;
