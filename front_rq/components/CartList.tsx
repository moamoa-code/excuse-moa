import { DeleteOutlined } from "@ant-design/icons";
import { Button, notification, Table } from "antd";
import { AxiosError } from "axios";
import React, { useState } from "react";
import { useMutation } from "react-query";
import { removeCartAPI } from "../apis/item";

// old..
// 장바구니 리스트
const CartList = ({ items, myUserInfo }) => {
  const [notiApi, contextHolder] = notification.useNotification(); // antd 알림창
  const [loading, setLoading] = useState(false);

  const openNotification = () => {
    notification["success"]({
      message: "장바구니에서 상품을 제거했습니다.",
      placement: "topLeft",
      duration: 1,
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
    onSuccess: () => {
      openNotification();
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const onClickCart = (id) => () => {
    const itemId = id;
    const userId = myUserInfo.id;
    mutation.mutate({ itemId, userId });
  };

  const columns = [
    {
      title: "제품명",
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
    },
    {
      title: "공급가",
      key: "supplyPrice",
      dataIndex: "supplyPrice",
    },
    {
      title: "",
      key: "action",
      render: (text, record) => (
        <Button
          icon={
            <DeleteOutlined style={{ color: "#00b4f0", fontSize: "16pt" }} />
          }
          loading={loading}
          onClick={onClickCart(record.id)}
        ></Button>
      ),
    },
  ];

  return (
    <>
      <Table size="small" rowKey="id" columns={columns} dataSource={items} />
    </>
  );
};

export default CartList;
