import { Divider, message, Typography } from "antd";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import Router from "next/router";
import React, { useState } from "react";
import { dehydrate, QueryClient, useQuery } from "react-query";
import { loadMyInfoAPI, registAddrAPI } from "../../apis/user";
import AddressForm from "../../components/AddressForm";
import AppLayout from "../../components/AppLayout";
import { ContainerMid, FormBox } from "../../components/Styled";
import User from "../../interfaces/user";

// --회원정보/주소록/주소추가 페이지--
const RegistAddress = () => {
  const [loading, setLoading] = useState(false);
  const { data: myUserInfo } = useQuery<User>("user", loadMyInfoAPI);
  const { Title } = Typography;

  // 주소 저장 버튼 클릭
  const submitDatas = (datas) => {
    registAddress(datas);
  };

  // 주소 추가 API
  const registAddress = (datas) => {
    setLoading(true);
    registAddrAPI(datas)
      .then(() => {
        message.success('새로운 주소 추가가 완료되었습니다.');
        Router.replace(`/user/addr-list`);
      })
      .catch((error) => {
        alert(error.response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <AppLayout>
      <ContainerMid>
        <Divider>
          <Title level={4}>새로운 주소 추가</Title>
        </Divider>
        <FormBox>
          <AddressForm submitDatas={submitDatas} loading={loading} />
        </FormBox>
      </ContainerMid>
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
  await queryClient.prefetchQuery(["user"], () => loadMyInfoAPI());
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default RegistAddress;
