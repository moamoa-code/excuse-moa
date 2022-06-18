import {
  Button,
  Divider, Form, message,
  Space, Typography
} from "antd";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { createInventoryGroupAPI } from "../../apis/inventory";
import { loadMyInfoAPI } from "../../apis/user";
import AppLayout from "../../components/AppLayout";
import { Block, ContainerSmall, FormBox, Red } from "../../components/Styled";
import User from "../../interfaces/user";

// --재고 보고서 그룹 생성--
const CreateInventoryGroup = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: myUserInfo } = useQuery<User>("user", loadMyInfoAPI);
  const { Title } = Typography;
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const onSubmit = () => {
    const datas = { name, desc };
    createInventoryGroupAPI(datas)
      .then((res) => {
        message.success("보고서그룹이 생성됐습니다.");
        router.replace(`/inventory`);
      })
      .catch((error) => {
        message.error(JSON.stringify(error));
      });
    return;
  };

  return (
    <AppLayout>
      <ContainerSmall>
        <Head>
          <title>재고 보고서 그룹 생성</title>
        </Head>
        <Divider>
          <Title level={4}>재고 보고서 그룹 생성</Title>
        </Divider>
        <FormBox>
          <Form onFinish={onSubmit}>
            <Block>
              <label>
                <Red>* </Red>재고 보고서 이름
              </label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                placeholder=""
                maxLength={25}
                required
              />
            </Block>
            <Block>
              <label>재고 보고서 간단 설명</label>
              <input
                value={desc}
                onChange={(e) => {
                  setDesc(e.target.value);
                }}
                placeholder=""
                maxLength={100}
              />
            </Block>
            <Block>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  생성
                </Button>
                <Link href={`/inventory/`}>
                  <Button>목록으로</Button>
                </Link>
              </Space>
            </Block>
          </Form>
        </FormBox>
      </ContainerSmall>
    </AppLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const cookie = context.req ? context.req.headers.cookie : "";
  axios.defaults.headers.Cookie = "";
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  const response = await loadMyInfoAPI();
  if (!response) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
};

export default CreateInventoryGroup;
