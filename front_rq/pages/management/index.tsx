import {
  ShopOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { message, Typography } from "antd";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Link from "next/link";
import router from "next/router";
import React, { useEffect, useState } from "react";
import { dehydrate, QueryClient, useQuery } from "react-query";
import { loadMyInfoAPI } from "../../apis/user";
import AppLayout from "../../components/AppLayout";
import { Container800 } from "../../components/Styled";
import User from "../../interfaces/user";

// --판매자 페이지--
const Management = () => {
  const { data: myUserInfo } = useQuery<User>("user", loadMyInfoAPI);
  const { Title } = Typography;

  // 권한 없을경우 오류페이지로
  useEffect(() => {
    if (myUserInfo?.role !== "PROVIDER") {
      message.error("권한이 없습니다.");
      router.replace(`/unauth`);
    }
  }, [myUserInfo]);

  return (
    <AppLayout>
      <Head>
        <title>관리자페이지</title>
      </Head>
      <Container800>
        <Title level={4}>
          <UserOutlined /> 고객관리
        </Title>
        <Link href="/management/create-user">
          <a>고객생성</a>
        </Link>
        <br />
        <Link href="/management/user-multi-create">
          <a>여러고객생성</a>
        </Link>
        <br />
        <Link href="/management/customers">
          <a>고객관리 및 등록</a>
        </Link>
        <br />
        <br />
        <Title level={4}>
          <ShopOutlined /> 제품관리
        </Title>
        <Link href="/item/regist">
          <a>제품등록</a>
        </Link>
        <br />
        <Link href="/management/items">
          <a>제품목록</a>
        </Link>
        <br />
        <br />
        <Title level={4}>
          <UnorderedListOutlined /> 공지사항 관리
        </Title>
        <Link href="/post/regist">
          <a>공지사항 등록</a>
        </Link>
        <br />
        <Link href="/management/posts">
          <a>공지사항 목록</a>
        </Link>
        <br />
      </Container800>
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
        destination: "/unauth",
        permanent: false,
      },
    };
  }
  if (response.role !== "PROVIDER" && response.role !== "ADMINISTRATOR") {
    // 로그인 안했으면 홈으로
    return {
      redirect: {
        destination: "/unauth",
        permanent: false,
      },
    };
  }
  await queryClient.prefetchQuery(["user"], () => loadMyInfoAPI());
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default Management;
