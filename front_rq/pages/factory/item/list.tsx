import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Table, Typography } from "antd";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import React, { useState } from "react";
import { dehydrate, QueryClient, useQuery } from "react-query";
import { useMediaQuery } from "react-responsive";
import { loadItemListAPI } from "../../../apis/item";
import { loadMyInfoAPI, loadProvidersAPI } from "../../../apis/user";
import AppLayout from "../../../components/AppLayout";
import ItemView from "../../../components/ItemView";
import MyTable from "../../../components/MyTable";
import { ContainerWide, OptionContainer } from "../../../components/Styled";
import UserInfoBox from "../../../components/UserInfoBox";
import User from "../../../interfaces/user";

// --(관리자)제품 목록 페이지--
const FactoryItemList = () => {
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:768px)",
  });
  const { data: myUserInfo } = useQuery<User>("user", loadMyInfoAPI);
  const [loading, setLoading] = useState(false);
  const { data: providerList } = useQuery("userList", loadProvidersAPI);
  const [itemList, setItemList] = useState<any>([]);
  const [selectedProvider, setSelectedProvider] = useState<any>(null); // 선택된 판매자
  const { Title } = Typography;

  // 특정 판매자의 제품 불러오기
  const onLoadItems = (v) => () => {
    setLoading(true);
    setSelectedProvider(v);
    loadItemListAPI(v.key)
      .then((result) => {
        setItemList(result);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const columns = [
    {
      title: "코드명",
      dataIndex: "codeName",
      type: "id",
      key: "codeName",
    },
    {
      title: "제품명",
      dataIndex: "name",
      type: "title",
      key: "name",
      render: (text, record) => <>{text}</>,
    },
    {
      title: "포장종류",
      dataIndex: "packageName",
      key: "packageName",
    },
    {
      title: "무게단위",
      dataIndex: "unit",
      type: "right",
      key: "unit",
    },
    {
      title: "공급가",
      dataIndex: "supplyPrice",
      key: "supplyPrice",
    },
    {
      title: "공개범위",
      dataIndex: "scope",
      key: "scope",
      render: (text, record) => {
        if (text === "PRIVATE") {
          return <>특정</>;
        }
        if (text === "GROUP") {
          return <>모든고객</>;
        }
        if (text === "PUBLIC") {
          return <>모든회원</>;
        } else {
          return <>{text}</>;
        }
      },
    },
  ];

  const expandable = {
    expandedRowRender: (record) => (
      <ItemView item={record} myUserInfo={myUserInfo} />
    ),
    columnWidth: 20,
    expandIcon: ({ expanded, onExpand, record }) =>
      expanded ? (
        <DownOutlined
          style={{ color: "#64707a", fontSize: "8pt", margin: "0px" }}
          onClick={(e) => onExpand(record, e)}
        />
      ) : (
        <RightOutlined
          style={{ color: "#64707a", fontSize: "8pt" }}
          onClick={(e) => onExpand(record, e)}
        />
      ),
  };

  return (
    <AppLayout>
      <ContainerWide>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/factory/">
              <a>관리자페이지</a>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>제품관리</Breadcrumb.Item>
          <Breadcrumb.Item>제품목록</Breadcrumb.Item>
        </Breadcrumb>
        <br />
        <Title level={4}>판매사 선택</Title>
        <OptionContainer>
          {providerList?.map((v) => {
            return (
              <p className="provider" onClick={onLoadItems(v)}>
                {v.company}
              </p>
            );
          })}
        </OptionContainer>
        <br />
        {selectedProvider ? <UserInfoBox userInfo={selectedProvider} /> : null}
        <br />
        <br />
        <Title level={4}>{selectedProvider?.company} 제품목록</Title>
        {isMobile ? (
          <MyTable
            rowKey="id"
            columns={columns}
            expandable={expandable}
            dataSource={itemList}
          />
        ) : (
          <Table
            size="small"
            rowKey="id"
            columns={columns}
            expandable={expandable}
            dataSource={itemList}
          />
        )}
        <br />
        <Link href="/factory/item/regist">
          <a>
            <Button type="primary"> + 새로운 제품 추가</Button>
          </a>
        </Link>
      </ContainerWide>
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
    // 관리자 권한
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

export default FactoryItemList;
