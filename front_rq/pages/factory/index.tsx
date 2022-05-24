// 상품 등록 페이지
// 관리자, 판매자만 열람 가능
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";

import React from "react";
import Head from "next/head";
import { Typography } from "antd";
import { dehydrate, QueryClient, useQuery, useQueryClient } from "react-query";

import { loadMyInfoAPI } from "../../apis/user";
import AppLayout from "../../components/AppLayout";
import styled from "styled-components";
import {
  ShopOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";

const Container800 = styled.div`
  max-width: 800px;
  padding: 20px;
  margin: 0 auto;
  a:link {
    text-decoration: none;
  }
  a:visited {
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
  span {
    font-size: 12pt;
    margin: 10px 0 10px 0;
  }
  p {
    font-size: 20px;
  }
`;

const Factory = () => {
  const { Title } = Typography;
  return (
    <AppLayout>
      <Head>
        <title>관리자페이지</title>
      </Head>
      <Container800>
        <Title level={4}>
          <UserOutlined /> 고객관리
        </Title>
        <Link href="/factory/user/list" passHref>
          <a>
            <span>회원목록</span>
          </a>
        </Link>
        <br />
        <Link href="/factory/user/providers" passHref>
          <a>
            <span>판매자-구매자 관리</span>
          </a>
        </Link>
        <br />
        <Link href="/factory/user/create" passHref>
          <a>
            <span>회원생성</span>
          </a>
        </Link>
        <br />
        <Link href="/factory/user/multi-create" passHref>
          <a>
            <span>여러 회원 생성</span>
          </a>
        </Link>
        <br />
        <br />
        <Title level={4}>
          <ShopOutlined /> 제품관리
        </Title>
        <Link href="/factory/item/regist" passHref>
          <a>
            <span>제품등록</span>
          </a>
        </Link>
        <br />
        <Link href="/factory/item/list" passHref>
          <a>
            <span>제품목록</span>
          </a>
        </Link>
        <br />
        <br />
        <Title level={4}>
          <UnorderedListOutlined /> 공지사항 관리
        </Title>
        <Link href="/factory/post/regist">
          <a>
            <span>공지사항 등록</span>
          </a>
        </Link>
        <br />
        <Link href="/factory/post/list">
          <a>
            <span>공지사항 목록</span>
          </a>
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
  if (response.role !== "ADMINISTRATOR") {
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

export default Factory;
