import { Typography } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { GetServerSidePropsContext } from "next";
import React from "react";
import { dehydrate, QueryClient, useQuery } from "react-query";
import { useMediaQuery } from "react-responsive";
import { loadPostListAPI } from "../../apis/post";
import { loadMyInfoAPI } from "../../apis/user";
import AppLayout from "../../components/AppLayout";
import MyTable from "../../components/MyTable";
import PostList from "../../components/PostList";
import PostView from "../../components/PostView";
import { Container800 } from "../../components/Styled";
import Item from "../../interfaces/item";

// --판매회원, 구매회원이 볼 수 있는 공지사항 목록 페이지--
const PostListPage = () => {
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:768px)",
  });
  const { data: posts } = useQuery<Item>(["posts"], loadPostListAPI);
  const { Title } = Typography;

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
  return (
    <AppLayout>
      <Container800>
        <Title level={4}>공지사항</Title>
        {!isMobile ? (
          <PostList posts={posts} />
        ) : (
          <MyTable
            dataSource={posts}
            columns={columns}
            rowKey="id"
            expandable={{
              expandedRowRender: (record) => <PostView post={record} />,
            }}
          />
        )}
        <br />
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
        destination: "/",
        permanent: false,
      },
    };
  }
  await queryClient.prefetchQuery(["user"], () => loadMyInfoAPI());
  await queryClient.prefetchQuery(["posts"], () => loadPostListAPI());
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default PostListPage;