import { CheckCircleOutlined } from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Checkbox,
  Descriptions,
  Form,
  Input,
  message,
  notification,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import axios from "axios";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { dehydrate, QueryClient, useQuery, useQueryClient } from "react-query";
import { useMediaQuery } from "react-responsive";
import { loadItemListAPI, loadMyItemsAPI } from "../../../apis/item";
import {
  addCustomerAPI,
  addItemToCustomerAPI,
  deleteCustomerAPI,
  loadMyInfoAPI,
  loadProviderAPI,
  loadProvidersAPI,
  loadUserAPI,
  removeItemToCustomerAPI,
} from "../../../apis/user";
import AppLayout from "../../../components/AppLayout";
import MyTable from "../../../components/MyTable";
import { Container800 } from "../../../components/Styled";
import User from "../../../interfaces/user";

// --(관리자)판매자-구매자 관리 페이지--
const ProviderList = () => {
  const { Title, Text } = Typography;
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data: myUserInfo } = useQuery<User>("user", loadMyInfoAPI);
  const { data: userList } = useQuery("userList", loadProvidersAPI);
  const [form] = Form.useForm();
  const [selectedProvider, setSelectedProvider] = useState<any>("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>("");
  const [itemsOfProvider, setItemsOfProvider] = useState<any>([]);
  const { Search } = Input;
  const [isVisible, setIsvisible] = useState(false);
  const [isCustomerSelected, setIsCustomerSelected] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:768px)",
  });
  const divRef = useRef<HTMLDivElement>(null);

  const openNotification = (text) => {
    notification.open({
      message: `${text}`,
      description: ``,
      icon: <CheckCircleOutlined style={{ color: "#108ee9" }} />,
      duration: 2,
    });
  };

  // 판매회원 key로 검색
  const onSearchProvider = (value) => {
    setLoading(true);
    setIsvisible(false);
    loadUserAPI(String(value).trim())
      .then((response) => {
        if (response.role !== "PROVIDER") {
          return message.error("판매자 회원이 아닙니다.");
        }
        setSelectedProvider(response);
        setIsvisible(true);
        divRef.current?.scrollIntoView({ behavior: "smooth" });
      })
      .catch((error) => {
        message.error(error.response.data);
        setLoading(false);
        setIsvisible(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 구매회원 key로 검색
  const onSearchCustomer = (value) => {
    setLoading(true);
    setIsvisible(false);
    loadUserAPI(String(value).trim())
      .then((response) => {
        setSelectedCustomer(response);
        setIsCustomerSelected(true);
        setIsvisible(true);
        divRef.current?.scrollIntoView({ behavior: "smooth" });
      })
      .catch((error) => {
        message.error(error.response.data);
        setLoading(false);
        setIsvisible(true);
        divRef.current?.scrollIntoView({ behavior: "smooth" });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 판매회원정보 보기
  const onViewUserInfo = (key) => () => {
    setIsvisible(false);
    setLoading(true);
    loadProviderAPI(String(key))
      .then((response) => {
        setSelectedProvider(response);
        setIsCustomerSelected(false);
        setSelectedCustomer("");
        setIsvisible(true);
        divRef.current?.scrollIntoView({ behavior: "smooth" });
      })
      .catch((error) => {
        alert(error.response.data);
        setLoading(false);
        setIsvisible(false);
      })
      .finally(() => {
        setLoading(false);
      });
    loadItemListAPI(String(key))
      .then((response) => {
        setItemsOfProvider(response);
      })
      .catch((error) => {
        alert(error.response.data);
        setLoading(false);
        setIsvisible(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 판매자의 고객목록 회원 태그 클릭 (구매회원 정보 보기)
  const onCustomerSelect = (id) => () => {
    setLoading(true);
    loadUserAPI(String(id))
      .then((response) => {
        setSelectedCustomer(response);
        if (selectedProvider.Customers.find((v) => v.id === response.id)) {
          setIsMember(true);
        } else {
          setIsMember(false);
        }
        setIsCustomerSelected(true);
      })
      .catch((error) => {
        alert(error.response.data);
        setLoading(false);
        setIsCustomerSelected(false);
      })
      .finally(() => {
        setLoading(false);
        form.resetFields();
      });
  };

  const onToggleItem = (e) => {
    // 고객에 열람가능 제품 추가/제거
    const itemId = parseInt(e.target.value);
    if (e.target.checked) {
      setLoading(true);
      addItemToCustomerAPI({
        itemId: itemId,
        customerKey: selectedCustomer.key,
      })
        .then(() => {})
        .catch((error) => {
          message.error(error.response.data);
          setLoading(false);
        })
        .finally(() => {
          queryClient.invalidateQueries("myItems");
          setLoading(false);
          openNotification("고객에 열람가능한 제품을 추가했습니다.");
        });
    } else {
      setLoading(true);
      removeItemToCustomerAPI({
        itemId: itemId,
        customerKey: selectedCustomer.key,
      })
        .then(() => {})
        .catch((error) => {
          message.error(error.response.data);
          setLoading(false);
        })
        .finally(() => {
          queryClient.invalidateQueries("myItems");
          setLoading(false);
          openNotification("고객에 열람가능한 제품을 제거했습니다.");
        });
    }
  };

  // 고객으로 등록
  const onAddCustomer = () => {
    setLoading(true);
    setIsvisible(false);
    addCustomerAPI({
      providerKey: selectedProvider.key,
      customerKey: selectedCustomer.key,
    })
      .then((response) => {
        openNotification("고객 등록이 완료됐습니다.");
        setIsvisible(true);
        setIsMember(true);
      })
      .catch((error) => {
        alert(error.response.data);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 고객 해제
  const onDeleteCustomer = () => {
    setLoading(true);
    setIsvisible(false);
    deleteCustomerAPI({
      providerKey: selectedProvider.key,
      customerKey: selectedCustomer.key,
    })
      .then((response) => {
        openNotification("고객 해제가 완료됐습니다.");
        setIsvisible(true);
        setIsMember(false);
      })
      .catch((error) => {
        alert(error.response.data);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 판매회원 목록 테이블 컬럼
  const userTableColumns = [
    {
      title: "아이디",
      dataIndex: "key",
      key: "key",
      type: "id",
      render: (text, record) => (
        <b>
          <span onClick={onViewUserInfo(text)}>{text}</span>
        </b>
      ),
    },
    {
      title: "회사명",
      type: "title",
      dataIndex: "company",
      key: "company",
    },
    {
      title: "회원구분",
      key: "role",
      dataIndex: "role",
      filters: [
        {
          text: "판매자",
          value: "PROVIDER",
        },
        {
          text: "구매자",
          value: "CUSTOMER",
        },
        {
          text: "비회원",
          value: "NOVICE",
        },
        {
          text: "탈퇴요청",
          value: "RESIGNED",
        },
      ],
      onFilter: (value, record) => record.role.indexOf(value) === 0,
    },
    {
      title: "담당자",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "",
      key: "action",
      type: "right",
      render: (text, record) => (
        <span style={{ color: "#4aa9ff" }} onClick={onViewUserInfo(record.key)}>
          보기
        </span>
      ),
    },
  ];

  return (
    <AppLayout>
      <Container800>
        <Head>
          <title>판매회원 관리</title>
        </Head>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link href="/factory/">
              <a>관리자페이지</a>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>회원관리</Breadcrumb.Item>
          <Breadcrumb.Item>판매회원관리</Breadcrumb.Item>
        </Breadcrumb>
        <br />
        <Title level={4}>판매회원 관리</Title>
        {isMobile ? (
          <MyTable
            size="small"
            rowKey="id"
            columns={userTableColumns}
            dataSource={userList}
          />
        ) : (
          <Table rowKey="id" columns={userTableColumns} dataSource={userList} />
        )}

        <Title level={4} style={{ marginTop: "30px" }}>
          판매자 검색
        </Title>
        <Search
          placeholder="ID / 사업자 등록번호"
          onSearch={onSearchProvider}
          enterButton
        />
        {isVisible ? (
          <div id={"editForm"} ref={divRef}>
            <br />
            <span style={{ fontSize: "15pt", fontWeight: "bold" }}>
              판매자 상세정보{" "}
            </span>
            <br />
            <Descriptions style={{ marginTop: "30px" }} bordered>
              <Descriptions.Item label="아이디/사업자번호" span={2}>
                {selectedProvider?.key}
              </Descriptions.Item>
              <Descriptions.Item label="회사명" span={2}>
                {selectedProvider?.company}
              </Descriptions.Item>
              <Descriptions.Item label="담당자 성함" span={2}>
                {selectedProvider?.name}
              </Descriptions.Item>
              <Descriptions.Item label="담당자 전화번호" span={2}>
                {selectedProvider?.phone}
              </Descriptions.Item>
              <Descriptions.Item label="담당자 이메일" span={2}>
                {selectedProvider?.email}
              </Descriptions.Item>
              <Descriptions.Item label="회원구분" span={2}>
                {selectedProvider?.role}
              </Descriptions.Item>
            </Descriptions>
            <br />
            <Title level={4} style={{ marginTop: "30px" }}>
              구매자 검색
            </Title>
            <Search
              placeholder="ID / 사업자 등록번호"
              onSearch={onSearchCustomer}
              enterButton
            />
            <br />
            <br />
            <span style={{ fontSize: "15pt", fontWeight: "bold" }}>
              {selectedProvider?.company}의 고객목록
            </span>
            <br />
            <br />
            <Space wrap>
              {selectedProvider.Customers.map((v) => (
                <>
                  {/* {printTags(myUserInfo.Customers, v)} */}
                  <Tag color="blue" onClick={onCustomerSelect(v.key)}>
                    {v.company} / {v.name}
                  </Tag>
                </>
              ))}
            </Space>
            {isCustomerSelected ? (
              <>
                <Title level={4} style={{ marginTop: "30px" }}>
                  구매회원 정보
                </Title>
                <Descriptions style={{ marginTop: "30px" }} bordered>
                  <Descriptions.Item label="아이디/사업자등록번호">
                    {selectedCustomer?.key}
                  </Descriptions.Item>
                  <Descriptions.Item label="회사명">
                    {selectedCustomer?.company}
                  </Descriptions.Item>
                  <Descriptions.Item label="담당자 성함">
                    {selectedCustomer?.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="담당자 전화번호">
                    {selectedCustomer?.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="담당자 이메일">
                    {selectedCustomer?.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="등급">
                    {selectedCustomer?.role}
                  </Descriptions.Item>
                </Descriptions>
                <br />
                {isMember ? (
                  <Popconfirm
                    title="고객 등록을 해제하시겠습니까?"
                    okText="해제"
                    cancelText="취소"
                    onConfirm={onDeleteCustomer}
                  >
                    <Button loading={loading}>고객 등록 해제</Button>
                  </Popconfirm>
                ) : (
                  <Popconfirm
                    title="고객으로 등록하시겠습니까?"
                    okText="등록"
                    cancelText="취소"
                    onConfirm={onAddCustomer}
                  >
                    <Button loading={loading}>
                      {selectedProvider?.company}의 고객으로 등록
                    </Button>
                  </Popconfirm>
                )}
                <br />
                <br />
                <span style={{ fontSize: "15pt", fontWeight: "bold" }}>
                  {selectedCustomer?.company}의 열람가능한 제품 등록
                </span>
                <br />
                <br />
                <Form
                  initialValues={{
                    // 제품 볼 수 있는 유저 체크
                    userItems: selectedCustomer?.UserViewItems?.map(
                      (v) => v.id
                    ),
                  }}
                  form={form}
                >
                  <Form.Item name="userItems">
                    <Checkbox.Group>
                      <Space size={8} wrap>
                        {itemsOfProvider ? (
                          <>
                            {itemsOfProvider.map((v) => {
                              if (v.scope === "PRIVATE") {
                                return (
                                  <Tag>
                                    <Checkbox
                                      value={v.id}
                                      disabled={loading}
                                      onClick={onToggleItem}
                                    >
                                      ({v.id}) {v.name} {v.packageName} {v.unit}
                                    </Checkbox>
                                  </Tag>
                                );
                              }
                            })}
                          </>
                        ) : null}
                      </Space>
                    </Checkbox.Group>
                  </Form.Item>
                </Form>
              </>
            ) : null}
          </div>
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
  const key = context.params?.key as string;
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
  await queryClient.prefetchQuery(["myItems"], () => loadMyItemsAPI());

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default ProviderList;
