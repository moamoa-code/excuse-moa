// 판매자의 게시글 리스트
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Table, Typography } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import React, { useState } from "react";
import { dehydrate, QueryClient, useQuery } from "react-query";
import { useMediaQuery } from "react-responsive";
import { loadMyPostListAPI } from "../../apis/post";
import { loadMyInfoAPI } from "../../apis/user";
import AppLayout from "../../components/AppLayout";
import MyTable from "../../components/MyTable";
import PostView from "../../components/PostView";
import { ContainerBig, HGap } from "../../components/Styled";
import Item from "../../interfaces/item";

// --판매회원이 작성한 공지사항 목록--
const ProviderPostList = () => {
  const { data: posts } = useQuery<Item[]>(["myposts"], loadMyPostListAPI);
  const { Title } = Typography;
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:768px)",
  });

  // 공지사항 테이블 컬럼
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      type: "id",
      key: "id",
    },
    {
      title: "제목",
      dataIndex: "title",
      type: "title",
      key: "title",
    },
    {
      title: "작성일",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text, record) => (
        <>
          {dayjs(text).format("YY.MM.DD HH:mm")}
          {}
        </>
      ),
    },
    {
      title: "열람범위",
      dataIndex: "scope",
      key: "scope",
      render: (text, record) => {
        if (text === "GROUP") {
          return <>모든 고객</>;
        } else if (text === "PRIVATE") {
          return <>특정 고객</>;
        } else {
          return <>{text}</>;
        }
      },
    },
    {
      title: "",
      key: "action",
      type: "right",
      render: (text, record) => (
        <Link href={`/post/edit/${record.id}`}>
          <a>수정</a>
        </Link>
      ),
    },
  ];
  
  // 공지사항 테이블 확장설정
  const expandable = {
    expandedRowRender: (record) => <PostView post={record} />,
    expandIcon: ({ expanded, onExpand, record }) =>
      expanded ? (
        <DownOutlined
          style={{ color: "#64707a", fontSize: "8pt" }}
          onClick={(e) => onExpand(record, e)}
        />
      ) : (
        <RightOutlined
          style={{ color: "#64707a", fontSize: "8pt" }}
          onClick={(e) => onExpand(record, e)}
        />
      ),
    expandRowByClick: true,
  };

  return (
    <AppLayout>
      <ContainerBig>
        <Title level={4}>작성한 공지사항 목록</Title>
        {isMobile ? (
          <MyTable
            rowKey="id"
            columns={columns}
            expandable={expandable}
            dataSource={posts}
          />
        ) : (
          <Table
            rowKey="id"
            columns={columns}
            expandable={expandable}
            dataSource={posts}
          />
        )}
        <HGap />
        <Link href="/post/regist">
          <a>
            <Button type="primary">+ 새로운 글 작성</Button>
          </a>
        </Link>
      </ContainerBig>
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
  await queryClient.prefetchQuery(["myposts"], loadMyPostListAPI);
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default ProviderPostList;
