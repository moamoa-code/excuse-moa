import {
  Button,
  Divider,
  message,
  notification,
  Popconfirm,
  Typography,
} from "antd";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import router from "next/router";
import React, { useEffect, useState } from "react";
import { dehydrate, QueryClient, useQuery } from "react-query";
import styled from "styled-components";
import { loadMyInfoAPI, logOutAPI, resignAPI } from "../../apis/user";
import AppLayout from "../../components/AppLayout";
import User from "../../interfaces/user";

const Container600 = styled.div`
  max-width: 600px;
  margin 0 auto;
  padding: 10px;
`;

// --회원정보/수정/회원탈퇴 신청 페이지--
const RegistAddress = () => {
  const [loading, setLoading] = useState(false);
  const { data: myUserInfo } = useQuery<User>("user", loadMyInfoAPI);
  const { Title, Paragraph } = Typography;

  useEffect(() => {
    if (myUserInfo?.role === "ADMINISTRATOR") {
      router.replace("/");
    }
  }, [myUserInfo]);

  const openNotification = () => {
    notification.open({
      message: `회원 탈퇴 신청이 완료되었습니다.`,
      description: `그동안 이용해 주셔서 대단히 감사드립니다.`,
      duration: 10,
    });
  };

  const onResign = () => {
    if (myUserInfo?.role === "ADMINISTRATOR") {
      return message.error("관리자면 스스로 DB에서 회원삭제 하십시오.");
    }
    // 회원정보 삭제하지 않고 key 변경, 탈퇴회원 처리
    resignAPI()
      .then(() => {
        openNotification();
        logOutAPI();
        router.replace("/");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <AppLayout>
      <Container600>
        <Head>
          <title>회원 탈퇴</title>
        </Head>
        <Divider>
          <Title level={4}>회원 탈퇴</Title>
        </Divider>
        <br />
        <Paragraph>
          <pre>
            완전한 회원 탈퇴에는 시간이 소요되며 관리자가 확인하여 처리 해
            드립니다. 주문내역 등의 일부 데이터는 서버에 남아있을 수 있습니다.
            <br />
            초기화, 기능장애등의 이유로 탈퇴 후 재 가입을 원하시는 경우는
            관리자에게 문의해 주세요.
            <br />
            회원 탈퇴신청 즉시 모든 서비스를 이용 하실 수 없습니다.
            <span>
              <br />
              <br />
              동의하실 경우 아래의 버튼을 눌러 계정삭제 신청을 해 주세요.
            </span>
          </pre>
        </Paragraph>

        <Popconfirm
          title="회원 탈퇴에 동의하십니까?"
          onConfirm={onResign}
          okText="회원 탈퇴"
          cancelText="아니오"
        >
          <Button danger loading={loading}>
            회원 탈퇴 신청
          </Button>
        </Popconfirm>
      </Container600>
    </AppLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const cookie = context.req ? context.req.headers.cookie : ""; // 쿠키 넣어주기
  axios.defaults.headers.Cookie = "";
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  const queryClient = new QueryClient();
  const response = await loadMyInfoAPI();
  if (!response) {
    // 로그인 안했으면 홈으로
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  const id = context.params?.id as string;
  await queryClient.prefetchQuery(["user"], () => loadMyInfoAPI());
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default RegistAddress;