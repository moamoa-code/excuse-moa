import React, { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import AddressForm from '../../components/AddressForm';
import { GetServerSidePropsContext } from 'next';
import axios from 'axios';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { loadMyInfoAPI, registAddrAPI } from '../../apis/user';
import User from '../../interfaces/user';
import styled from 'styled-components';
import { Divider, notification, Typography } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import Router from 'next/router';

const Container500 = styled.div`
  max-width: 500px;
  margin 0 auto;
  padding: 10px;
`


const RegistAddress = () => {
  const [ loading, setLoading ] = useState(false);
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { Title } = Typography;

  const submitDatas = (datas) => {
    console.log('got it')
    registAddress(datas);
  }

  const openNotification = () => {
    notification.open({
      message: `새로운 주소 추가가 완료되었습니다.`,
      description:
        ``,
      icon: <SmileOutlined style={{ color: '#108ee9' }} />,
      duration: 4,
    });
  };

  const registAddress = (datas) => {
    setLoading(true);
    registAddrAPI(datas)
      .then(() => {
        openNotification();
        Router.replace(`/user/addr-list`);
      })
      .catch((error) => {
        alert(error.response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <AppLayout>
      <Container500>
        <Divider><Title level={4}>새로운 주소 추가</Title></Divider><br />
        <AddressForm submitDatas={submitDatas} loading={loading}/>
      </Container500>
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
        destination: '/login',
        permanent: false,
      },
    };
  }
  const id = context.params?.id as string;
  await queryClient.prefetchQuery(['user'], () => loadMyInfoAPI());
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default RegistAddress;