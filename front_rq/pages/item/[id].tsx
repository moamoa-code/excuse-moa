import axios from "axios";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import React from "react";
import { dehydrate, QueryClient, useQuery } from "react-query";
import { loadItemAPI } from "../../apis/item";
import { loadMyInfoAPI } from "../../apis/user";
import AppLayout from "../../components/AppLayout";
import ItemView from "../../components/ItemView"; // 제품 상세정보 보기 컴포넌트
import { Container800 } from "../../components/Styled";
import Item from "../../interfaces/item";
import User from "../../interfaces/user";

// 제품 상세보기
const ViewItem = () => {
  const router = useRouter();
  // const queryClient = useQueryClient();
  const { id } = router.query; // 제품의 id
  const { data: myUserInfo } = useQuery<User>("user", loadMyInfoAPI);
  const { data: item } = useQuery<Item>(["item", id], () =>
    loadItemAPI(Number(id))
  );

  return (
    <AppLayout>
      <Container800>
        {JSON.stringify(item)}
        <ItemView item={item} myUserInfo={myUserInfo} />
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
  const id = context.params?.id as string;
  await queryClient.prefetchQuery(["user"], () => loadMyInfoAPI());
  await queryClient.prefetchQuery(["item", id], () => loadItemAPI(Number(id)));
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default ViewItem;
