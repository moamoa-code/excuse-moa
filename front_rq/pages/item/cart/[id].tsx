// @ts-nocheck
// -> AddressList.tsx UseRef 문제 해결 못함
// 카트에 담긴 제품 불러오기 / 주문하기
import { DeleteOutlined } from "@ant-design/icons";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Table,
  Typography,
} from "antd";
import axios, { AxiosError } from "axios";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import React, { useState } from "react";
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import { useMediaQuery } from "react-responsive";
import { loadCartAPI, removeCartAPI } from "../../../apis/item";
import { orderItemAPI } from "../../../apis/order";
import { loadAddrsAPI, loadMyInfoAPI } from "../../../apis/user";
import AddressList from "../../../components/AddressList";
import AppLayout from "../../../components/AppLayout";
import MyTable from "../../../components/MyTable";
import { Container800 } from "../../../components/Styled";
import useInput from "../../../hooks/useInput";
import Item from "../../../interfaces/item";
import User from "../../../interfaces/user";

const ViewCartItems = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { Title } = Typography;
  // const queryClient = useQueryClient();
  const { id } = router.query; // 유저 id
  // const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { data: myUserInfo } = useQuery<User>("me", loadMyInfoAPI, {
    onSuccess: (data) => {
      loadAddrsAPI(data.id)
        .then((response) => {
          setAddrs(response);
        })
        .catch((error) => {
          alert(error.response.data);
        });
    },
  });
  const { data: cartItems } = useQuery<Item[]>("cartItems", () =>
    loadCartAPI(String(id))
  );
  const [loading, setLoading] = useState(false);
  const [theMap, setTheMap] = useState<
    Map<number, { qty: number; tag: string | null }>
  >(new Map());
  const [comment, onChangeComment] = useInput("");
  const [addrId, setId] = useState();
  const [addrs, setAddrs] = useState([{}]); // 주소 목록
  const [name, setName] = useState(""); // 서버에 보낼 주소 데이터
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const [qty, setQty] = useState(10);
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:768px)",
  });

  const onChangeQty = (target) => (value) => {
    // 수량 변경
    let tag = "";
    if (theMap.has(target)) {
      tag = theMap.get(target).tag;
    }
    setTheMap((prev) => new Map(prev).set(target, { qty: value, tag }));
  };

  const onChangeTag = (target) => (value) => {
    // 표기사항 변경
    let qty = 1;
    if (theMap.has(target)) {
      qty = theMap.get(target).qty;
    }
    const tag = value.target.value;
    setTheMap((prev) => new Map(prev).set(target, { qty: qty, tag: tag }));
  };

  const onSubmit = () => {
    // 주문하기
    const newMap = new Map(theMap);
    const userId = String(id);
    cartItems.map((item) => {
      // 맵에 수량 없으면 1로 채우기
      if (!theMap.has(item.id)) {
        newMap.set(item.id, { qty: 1, tag: "" });
      }
    });
    setTheMap(newMap);
    const items = Object.fromEntries(newMap); // back에서 받기위해 형변환
    orderItemAPI({ items, comment, userId, zip, address, name, phone })
      .then((result) => {
        router.replace(`/item/order/${result}`);
      })
      .catch((error) => {
        alert(error.response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const mutation = useMutation<
    void,
    AxiosError,
    { itemId: number; userId: string }
  >(removeCartAPI, {
    onMutate: () => {
      setLoading(true);
    },
    onError: (error) => {
      alert(error.response?.data);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries("cartItems"); // 카트 목록 다시 불러오기
      setTheMap((prev) => {
        // 해시맵에서 제거한 제품 키 제거
        const newMap = new Map(prev);
        newMap.delete(Number(result));
        return newMap;
      });
      message.success("장바구니에서 상품을 제거했습니다.");
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const onClickRemove = (id) => () => {
    // 장바구니에서 제품 제거
    const itemId = id;
    const userId = myUserInfo.id;
    mutation.mutate({ itemId, userId });
  };

  const columns = [
    {
      title: "제품명",
      type: "title",
      dataIndex: "name",
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
      key: "unit",
      width: 80,
    },
    {
      title: "공급가",
      key: "supplyPrice",
      dataIndex: "supplyPrice",
    },
    {
      title: "표기사항",
      key: "action",
      type: "input",
      render: (text, record) => (
        <Input
          style={{ maxWidth: "120px" }}
          size="medium"
          onChange={onChangeTag(record.id)}
        />
      ),
    },
    {
      title: "수량",
      key: "action",
      type: "input",
      render: (text, record) => (
        <>
          {JSON.stringify(record.id)}
          <InputNumber
            key={record.id}
            type="number"
            style={{ maxWidth: "50px" }}
            size="medium"
            onChange={onChangeQty(record.id)}
            min={1}
            defaultValue={1}
          />
        </>
      ),
    },
    {
      title: "",
      key: "action",
      type: "right",
      width: 40,
      render: (text, record) => (
        <Button
          icon={
            <DeleteOutlined style={{ color: "#f4f4f", fontSize: "16pt" }} />
          }
          loading={loading}
          onClick={onClickRemove(record.id)}
        ></Button>
      ),
    },
  ];

  return (
    <AppLayout>
      <Container800>
        <Title level={4}>장바구니</Title>
        <Form onFinish={onSubmit}>
          {isMobile ? (
            <MyTable rowKey="id" columns={columns} dataSource={cartItems} />
          ) : (
            <Table
              size="small"
              rowKey="id"
              columns={columns}
              dataSource={cartItems}
            />
          )}

          <br />
          <Title level={4}>배송지 입력</Title>
          <AddressList
            setId={setId}
            addrs={addrs}
            setName={setName}
            setPhone={setPhone}
            setAddress={setAddress}
            setZip={setZip}
          />
          <br />
          <Form.Item label="기타 요구사항">
            <Input.TextArea
              name="user-price"
              value={comment}
              onChange={onChangeComment}
            />
          </Form.Item>
          <Button
            htmlType="submit"
            style={{ display: "block", margin: "20px auto" }}
            type="primary"
          >
            주문하기
          </Button>
        </Form>
      </Container800>
    </AppLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const cookie = context.req ? context.req.headers.cookie : ""; // 쿠키 넣어주기
  axios.defaults.headers.Cookie = "";
  const id = context.params?.id as string;
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
  await queryClient.prefetchQuery(["user"], () => loadMyInfoAPI);
  await queryClient.prefetchQuery(["addrs"], () => loadAddrsAPI);
  await queryClient.prefetchQuery(["cartItems", id], () => loadCartAPI(id));
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default ViewCartItems;
