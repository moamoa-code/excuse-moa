import { PlusOutlined } from "@ant-design/icons";
import { Button, Table, Typography } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import Router from "next/router";
import React, { useEffect, useState } from "react";
import { dehydrate, QueryClient, useQuery } from "react-query";
import { useMediaQuery } from "react-responsive";
import { loadRecentReceivedOrdersAPI } from "../apis/order";
import { loadAdnminPostAPI, loadRecentPostAPI } from "../apis/post";
import { loadMyInfoAPI } from "../apis/user";
import AppLayout from "../components/AppLayout";
import Intro from "../components/intro";
import MyTable from "../components/MyTable";
import PostView from "../components/PostView";
import { Container800, HGap } from "../components/Styled";
import User from "../interfaces/user";

// -- 메인 페이지 --
const Home = () => {
  const [posts, setPosts] = useState([]);
  const [orderData, setOderdata] = useState([]);
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:768px)",
  });
  const { data: myUserInfo } = useQuery<User>(["user"], loadMyInfoAPI, {
    onSuccess(data) {
      // -> SSR 안되는 문제로 주석처리
      // if(data?.role === 'CUSTOMER') {
      //   loadRecentPostAPI()
      //   .then((response) => {
      //     setPosts(response);
      //   })
      // } if (data?.role === 'PROVIDER' || data?.role === 'ADMINISTRATOR') {
      //   loadRecentReceivedOrdersAPI(data.key)
      //   .then((response) => {
      //     setOderdata(response);
      //   })
      // } if (data?.role === 'PROVIDER') {
      //   loadAdnminPostAPI()
      //   .then((response) => {
      //     setPosts(response);
      //   })
      // }
    },
  });
  const [isLoggedin, setIsloggedin] = useState(false);
  const { Title } = Typography;

  // (구매회원, 판매회원) 메인에 표시할 공지사항, 최근주문내역 불러오기
  const getPostsOrOrdersData = (user) => {
    if (user?.role === "CUSTOMER") {
      loadRecentPostAPI().then((data) => {
        setPosts(data);
      });
    }
    if (user?.role === "PROVIDER" || user?.role === "ADMINISTRATOR") {
      loadRecentReceivedOrdersAPI(user.key).then((data) => {
        setOderdata(data);
      });
    }
    if (user?.role === "PROVIDER") {
      loadAdnminPostAPI().then((data) => {
        setPosts(data);
      });
    }
  };

  // 로그인시 데이터 가져오기
  useEffect(() => {
    if (myUserInfo) {
      setIsloggedin(true);
      getPostsOrOrdersData(myUserInfo);
    } else {
      setIsloggedin(false);
    }
  }, [myUserInfo]);

  // 최근 공지사항 테이블 칼럼
  const postColumns = [
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
      title: "작성자",
      dataIndex: "User",
      key: "User",
      render: (text) => <>{text?.company}</>,
    },
    {
      title: "작성일",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 140,
      render: (text) => (
        <>
          {dayjs(text).format("YY.MM.DD HH:mm")}
          {}
        </>
      ),
    },
  ];

  // 최근주문내역 테이블 칼럼
  const orderColumns = [
    {
      title: "주문번호",
      dataIndex: "id",
      type: "id",
      key: "id",
    },
    {
      title: "총 공급가",
      key: "totalPrice",
      dataIndex: "totalPrice",
    },
    {
      title: "총 중량",
      key: "totalWeight",
      type: "right",
      dataIndex: "totalWeight",
    },
    {
      title: "고객사",
      dataIndex: "Customer",
      type: "title",
      key: "Customer",
      render: (text, record) => {
        return <>{text?.company ?? record.name}</>;
      },
    },
    {
      title: "주문일시",
      dataIndex: "date",
      key: "date",
      type: "sub",
      render: (text, record) => <>{dayjs(text).format("YY.MM.DD HH:mm")}</>,
    },
    {
      title: "주문상태",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "",
      key: "action",
      type: "right",
      render: (text, record) => (
        <Link href={`/management/check-order/${record.id}`}>
          <a>보기</a>
        </Link>
      ),
    },
  ];

  // 로그인 안했을 경우 인트로 페이지 보여줌
  if (!isLoggedin) {
    return (
      <AppLayout>
        <Intro />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Container800>
        <Title level={5}>{myUserInfo?.company}</Title>
        {myUserInfo?.role === "NOVICE" ? (
          <p>관리자의 승인 이후 이용 가능합니다.</p>
        ) : null}
        {myUserInfo?.role === "RESIGNED" ? (
          <p>회원탈퇴 처리 중 입니다.</p>
        ) : null}
        {myUserInfo?.role === "CUSTOMER" ? (
          <>
            <Title level={5}>공지사항</Title>
            <PostView post={posts[0]} />
            <HGap />
            {isMobile ? (
              <MyTable
                columns={postColumns}
                dataSource={posts.slice(0, 2)}
                rowKey="id"
                expandable={{
                  expandedRowRender: (record) => <PostView post={record} />,
                }}
              />
            ) : (
              <>
                <Table
                  columns={postColumns}
                  dataSource={posts.slice(0, 2)}
                  pagination={{ hideOnSinglePage: true }}
                  rowKey="id"
                  expandable={{
                    expandedRowRender: (record) => <PostView post={record} />,
                  }}
                />
              </>
            )}
            <Button
              onClick={() => Router.replace(`/post/list`)}
              size="large"
              type="text"
              block
            >
              <PlusOutlined /> 전체 공지사항 보기
            </Button>
          </>
        ) : null}
        {myUserInfo?.role === "PROVIDER" ? (
          <>
            <Title level={5}>관리자 공지사항</Title>
            {isMobile ? (
              <MyTable
                columns={postColumns}
                dataSource={posts.slice(0, 2)}
                rowKey="id"
                expandable={{
                  expandedRowRender: (record) => <PostView post={record} />,
                }}
              />
            ) : (
              <>
                <Table
                  columns={postColumns}
                  dataSource={posts.slice(0, 2)}
                  pagination={{ hideOnSinglePage: true }}
                  rowKey="id"
                  expandable={{
                    expandedRowRender: (record) => <PostView post={record} />,
                  }}
                />
              </>
            )}
            <Button
              onClick={() => Router.replace(`/post/list`)}
              type="text"
              size="large"
              block
            >
              <PlusOutlined /> 전체 공지사항 보기
            </Button>
            <HGap />
            <HGap />
            <Title level={5}>최근 주문현황</Title>
            {isMobile ? (
              <MyTable
                columns={orderColumns}
                dataSource={orderData}
                rowKey="id"
              />
            ) : (
              <>
                <Table
                  columns={orderColumns}
                  dataSource={orderData}
                  pagination={{ hideOnSinglePage: true }}
                  rowKey="id"
                />
              </>
            )}
            <Link href="/management/check-order/list">
              <a>
                <Button type="text" size="large" block>
                  <PlusOutlined /> 전체 주문 목록 보기
                </Button>
              </a>
            </Link>
          </>
        ) : null}
      </Container800>
    </AppLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const cookie = context.req ? context.req.headers.cookie : ""; // 쿠키 넣어주기
  axios.defaults.headers.Cookie = "";
  // const orderId = context.params?.id as string;
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(["user"], loadMyInfoAPI);
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default Home;