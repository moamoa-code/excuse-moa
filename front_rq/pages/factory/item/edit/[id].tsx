import { Breadcrumb, Button, message } from "antd";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import React from "react";
import { dehydrate, QueryClient, useQuery } from "react-query";
import { loadItemAPI } from "../../../../apis/item";
import { loadMyInfoAPI, loadProviderByIdAPI } from "../../../../apis/user";
import AppLayout from "../../../../components/AppLayout";
import ItemEdit from "../../../../components/ItemEdit";
import { Container800 } from "../../../../components/Styled";
import User from "../../../../interfaces/user";

// --(관리자)제품 수정 페이지--
const EditItem = () => {
  const router = useRouter();
  // const queryClient = useQueryClient();
  const { id } = router.query; // 제품의 id
  const { data: myUserInfo } = useQuery<User>("user", loadMyInfoAPI);
  const { data: item } = useQuery<any>(
    ["item", id],
    () => {
      return loadItemAPI(Number(id));
    },
    {
      onSuccess: (item) => {
        loadProviderByIdAPI(item.UserId)
          .then((response) => {
          })
          .catch((error) => {
            message.error(error.response.data);
          });
      },
    }
  );

  return (
    <AppLayout>
      <Container800>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/factory/">
              <a>관리자페이지</a>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>제품관리</Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/factory/item/list">
              <a>제품목록</a>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>제품수정</Breadcrumb.Item>
        </Breadcrumb>
        <br />
        <ItemEdit item={item} myUserInfo={myUserInfo} />
        <br />
        <br />
        <Button onClick={() => Router.replace(`/factory/item/list`)}>
          목록으로 돌아가기
        </Button>
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
  if (response.role !== "ADMINISTRATOR") {
    // 관리자 권한
    return {
      redirect: {
        destination: "/unauth",
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

export default EditItem;
