import React, { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import AddressForm from '../../components/AddressForm';
import { GetServerSidePropsContext } from 'next';
import axios from 'axios';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { loadMyInfoAPI, logOutAPI, registAddrAPI, resignAPI } from '../../apis/user';
import User from '../../interfaces/user';
import styled from 'styled-components';
import { Button, Divider, notification, Popconfirm, Typography } from 'antd';
import router from 'next/router';

const Container600 = styled.div`
  max-width: 600px;
  margin 0 auto;
  padding: 10px;
`
const RegistAddress = () => {
  const [ loading, setLoading ] = useState(false);
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { Title, Paragraph } = Typography;

  const openNotification = () => {
    notification.open({
      message: `계정 삭제 신청이 완료되었습니다.`,
      description:
        `그동안 이용해 주셔서 대단히 감사드립니다.`,
      duration: 10,
    });
  };

  const onResign = () => {
    resignAPI()
    .then(() => {
      openNotification();
      logOutAPI();
      router.replace('/');
    })
    .catch((error) => {
      console.error(error);
    })
  };

  return (
    <AppLayout>
      <Container600>
        <Divider><Title level={4}>계정 삭제</Title></Divider><br />
        <Paragraph>
          <pre>
            완전한 계정 삭제에는 시간이 소요되며 관리자가 확인하여 처리 해 드립니다.
            주문내역 등의 일부 데이터는 서버에 남아있을 수 있습니다.<br />
            초기화, 기능장애등의 이유로 탈퇴 후 재 가입을 원하시는 경우는 관리자에게 문의해 주세요.

            <span><br /><br />동의하실 경우 아래의 버튼을 눌러 계정삭제 신청을 해 주세요.</span>
          </pre>
        </Paragraph>

        <Popconfirm
              title="계정 삭제에 동의하십니까?"
              onConfirm={onResign}
              okText="계정 삭제"
              cancelText="아니오"
            >
              <Button danger loading={loading}>
                계정 삭제 신청
              </Button>
            </Popconfirm>
      </Container600>
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