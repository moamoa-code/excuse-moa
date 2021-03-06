import {
  CheckCircleOutlined,
  CheckCircleTwoTone,
  CheckSquareTwoTone,
  CloseCircleFilled,
  DoubleRightOutlined,
  MinusCircleOutlined,
  PlaySquareOutlined,
  PlusOutlined,
  PrinterTwoTone,
  SettingOutlined
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  message,
  notification,
  Popconfirm,
  Space
} from "antd";
import Modal from "antd/lib/modal/Modal";
import axios, { AxiosError } from "axios";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import moment from "moment";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient
} from "react-query";
import { useMediaQuery } from "react-responsive";
import styled from "styled-components";
import {
  cancelOrderAPI,
  confirmOrderAPI,
  loadOrderAPI,
  loadTodosAPI,
  packCancelAPI,
  packDoneAPI,
  taskDoneAPI
} from "../../apis/order";
import { loadMyInfoAPI } from "../../apis/user";
import AppLayout from "../../components/AppLayout";
import MyTable from "../../components/MyTable";
import OrderView from "../../components/OrderView";
import { ContainerWide, HGap } from "../../components/Styled";
import useInput from "../../hooks/useInput";
import User from "../../interfaces/user";

const TopBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  .Title {
    margin-left: 10px;
    font-size: 14pt;
    font-weight: bold;
  }
`;

const TaBle = styled.table`
  width: 100%;
  min-width: 700px;
  border-collapse: collapse;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  p {
    background-color: #fafafa;
    color: black;
    border: 1px solid #999999;
    text-align: center;
    border-radius: 4px;
    padding: 1px 5px 1px 5px;
    margin: 5px;
    font-size: 9pt;
  }
  .number {
    background-color: #fafafa;
    color: black;
    border: 1px solid #999999;
  }
  .count {
    background-color: #fafafa;
    color: black;
    border: 1px solid #999999;
  }
  .count-two {
    background-color: #e45826;
    color: white;
    border: none;
  }
  .date {
    background-color: #fafafa;
    color: black;
    border: 1px solid #999999;
  }
  .done {
    background-color: #13a0f4;
    color: white;
    border: none;
  }
  th {
    position: sticky;
    z-index: 2;
    top: 0px;
    background-color: #398ab9;
    border-left: 3px solid #ffffff;
    color: #ffffff;
  }
  th:first-child {
    border-left: none;
  }
  .code {
    background-color: #f4f4f4;
  }
  .code td {
    padding: 10px;
  }
  tr {
    border-bottom: 3px solid #dadada;
  }
  tbody tr:nth-of-type(even) {
    background-color: #f8f8f8;
  }
  tbody tr:last-of-type {
    border-bottom: 2px solid #398ab9;
  }
  tr:hover {
    background-color: #f1f1f1;
  }
  th,
  td {
    padding: 5px;
  }
  td {
    border-left: 1px solid #dadada;
  }
  td:first-child {
    border-left: none;
  }
  .th1 {
    text-align: center;
  }
  .th2 {
    max-width: 95px;
    text-align: center;
  }
  .th3 {
    text-align: center;
  }
  .th6 {
    text-align: center;
  }
  .thWeight {
    text-align: center;
  }
  .th7 {
    text-align: center;
  }
  .th8 {
    width: 50px;
    text-align: center;
  }
  .th9 {
    width: 50px;
  }
`;
const FilterBox = styled.div`
  @keyframes fadeInDown {
    0% {
      opacity: 0;
      transform: translate3d(0, -20%, 0);
    }
    to {
      opacity: 1;
      transform: translateZ(0);
    }
  }
  position: relative;
  animation: fadeInDown 0.2s;
  margin-bottom: 20px;
  border: 2px solid #dadada;
  border-radius: 20px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  max-width: 1280px;
  padding: 15px;
  div {
    margin: 5px;
  }
`;
const CodeName = styled.div`
  font-size: 14pt;
  font-weight: bold;
  span {
    background-color: #2db7f5;
  }
`;
const FloatingButton = styled.div`
  width: 44px;
  position: fixed;
  left: 50%;
  transform: translate(-50%, 0);
  bottom: 20px;
  z-index: 3;
`;

// ?????? ????????? ????????????
const PaintStatus = (props) => {
  const redStyle = useMemo(() => ({ color: "red" }), []);
  if (props.status === "????????????") {
    return <CheckCircleOutlined />;
  }
  if (props.status === "??????????????????") {
    return <CheckCircleTwoTone />;
  }
  if (props.status === "?????????????????????") {
    return <MinusCircleOutlined style={redStyle} />;
  }
  if (props.status === "??????????????????") {
    return <CloseCircleFilled style={redStyle} />;
  }
  if (props.status === "?????????") {
    return <PlaySquareOutlined />;
  }
  if (props.status === "????????????") {
    return <CheckSquareTwoTone />;
  }
};

// --???????????? ?????????--
const orderList = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const { data: myUserInfo } = useQuery<User>("user", loadMyInfoAPI);
  // ?????? ???????????? ?????? state
  const [isFilterVisable, setIsFilterVisiable] = useState(false);
  const [startDate, setStartDate] = useState(moment().subtract(5, "days"));
  const [endDate, setEndDate] = useState(moment());
  const [orderStatOpt, setOrderStatOpt] = useState([
    "????????????",
    "??????????????????",
  ]);
  const [factoryStatOpt, setFactoryStatOpt] = useState(["?????????"]);
  const [orderDetailStatOpt, setOrderDetailStatOpt] = useState([
    "?????????",
    "????????????",
    "??????",
  ]);
  const [isFloatingButtonVisibale, setIsFloatingButtonVisibale] =
    useState(true);
  const [todayTotalWeight, setTodayTotalWeight] = useState(0);
  const [itemCodes, setItemCodes] = useState([]); // ???????????? ???????????? ???????????????
  // ????????? ?????? ??????
  const [isVisible, setIsVisible] = useState(false);
  const [orderData, setOrderData] = useState({}); // ?????? ?????? ?????? ?????????
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [msg, onChangeMsg] = useInput(""); // ???????????? ??? ???????????????
  // CSS ????????? useMemo
  const doneStyle = useMemo(() => ({ backgroundColor: "#eef3ff" }), []); // ???????????? ?????????
  const selectedStyle = useMemo(() => ({ backgroundColor: "#f8edf8" }), []); // ????????? ????????? ?????????
  const style1kg = useMemo(
    () => ({ backgroundColor: "#5902EC", color: "white", border: "none" }),
    []
  );
  const style500g = useMemo(
    () => ({ backgroundColor: "#E04DB0", color: "white", border: "none" }),
    []
  );
  const style200g = useMemo(
    () => ({ backgroundColor: "#F2C9E1", color: "white", border: "none" }),
    []
  );
  const styleSize5 = useMemo(
    () => ({ backgroundColor: "#325288", color: "white", border: "none" }),
    []
  );
  const styleSize8 = useMemo(
    () => ({ backgroundColor: "#24A19C", color: "white", border: "none" }),
    []
  );
  const styleSize10 = useMemo(
    () => ({ backgroundColor: "#D96098", color: "white", border: "none" }),
    []
  );
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:740px)",
  });

  // ???????????? ?????? ???????????? ?????? ?????????
  useEffect(() => {
    function onScroll() {
      if (
        document.documentElement.clientHeight >=
        document.documentElement.scrollHeight
      ) {
        setIsFloatingButtonVisibale(false);
      } else if (
        window.scrollY + document.documentElement.clientHeight + 100 >
        document.documentElement.scrollHeight
      ) {
        setIsFloatingButtonVisibale(false);
      } else {
        setIsFloatingButtonVisibale(true);
      }
    }
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // ???????????? ?????? ??????(??????)??? ??????
  const onToggleFilter = () => {
    if (isFilterVisable === false) {
      return setIsFilterVisiable(true);
    }
    return setIsFilterVisiable(false);
  };

  // ?????? ?????? ???????????? API
  const {
    status,
    isLoading,
    data: orders,
    refetch,
  } = useQuery(
    "orders",
    () => {
      const fromz = startDate.toDate();
      const tilz = endDate.toDate();
      const data = {
        from: fromz,
        til: tilz,
        stat1: orderStatOpt,
        stat2: factoryStatOpt,
        stat3: orderDetailStatOpt,
      };
      // message.error(JSON.stringify(data), 4);
      return loadTodosAPI(data);
    },
    {
      // refetchInterval: 2000,
      onSuccess: (data) => {
        const codes = data
          .reverse()
          .map((item) => item.OrderDetails.map((v) => v.itemCodeName));
        // const newArr = [...new Set(codes.flat(2))]
        const newArr = Array.from(new Set(codes.flat(2))); // ???????????? ????????????
        const objArr = newArr.map((v) => ({ name: v, amount: 0 }));
        setItemCodes(objArr);
        getTodaysTotalWeight(data);
      },
    }
  );

  const openNotification = (text) => {
    // ????????? ?????????
    notification.open({
      message: `${text}`,
      description: ``,
      icon: <CheckCircleOutlined style={{ color: "#108ee9" }} />,
      duration: 2,
    });
  };

  // ?????? ?????? ?????? ??????
  const onLoadTodos = () => {
    if (!startDate || !endDate) {
      message.error("????????? ????????? ?????????.", 0.5);
      return;
    }
    refetch();
  };

  // ?????? ?????? API
  const mutation = useMutation<void, AxiosError, { id }>(packDoneAPI, {
    onMutate: () => {
      setLoading(true);
    },
    onError: (error) => {
      message.error(error.response?.data);
    },
    onSuccess: (result) => {
      openNotification("???????????? ??????");
    },
    onSettled: () => {
      setLoading(false);
      queryClient.invalidateQueries("orders");
    },
  });

  // ?????? ?????? ??????
  const onChangeStartDate = (date, dateString) => {
    setStartDate(date);
  };
  const onChangeEndtDate = (date, dateString) => {
    setEndDate(date);
  };

  // ?????? ?????? ??????
  const onConfirmClick = (id) => () => {
    mutation.mutate({ id: id });
  };

  const onOrderRowClick = (id) => () => {
    if (id === selectedOrderId) {
      return setSelectedOrderId(null);
    }
    setSelectedOrderId(id);
  };

  // ?????? ?????? ?????? ??????
  const onPackCancelClick = (id) => () => {
    setLoading(true);
    packCancelAPI({ id })
      .then(() => {
        openNotification("?????? ??????");
        queryClient.invalidateQueries("orders");
      })
      .catch((error) => {
        message.error(error.response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // ?????? ?????? ??????
  const onDoneTaskClick = () => {
    setLoading(true);
    const data = orders.map((v) => v.id);
    taskDoneAPI(data)
      .then((response) => {
        openNotification("?????? ??????????????? ?????????????????????.");
      })
      .catch((error) => {
        message.error(error.response.data);
      })
      .finally(() => {
        queryClient.refetchQueries("orders");
        setLoading(false);
      });
  };

  // ???????????? ?????? ???????????? ???
  const retailStatusOptions = [
    "????????????",
    "?????????????????????",
    "??????????????????",
    "??????????????????",
  ];
  const factoryStatusOptions = ["?????????", "??????"];
  const itemStatusOptions = ["?????????", "????????????", "??????"];

  // ?????? ???????????? ?????? ??????
  const onStatOptChange = (checkedValues) => {
    setOrderStatOpt(checkedValues);
  };
  const onFactoryStatOptChange = (checkedValues) => {
    setFactoryStatOpt(checkedValues);
  };
  const onOrderDetailStatOptChange = (checkedValues) => {
    setOrderDetailStatOpt(checkedValues);
  };

  // ????????? ?????? API ??????
  const showOrderModal = (id) => () => {
    loadOrderAPI(Number(id))
      .then((response) => {
        setOrderData(response);
        setSelectedOrderId(response.order.id);
      })
      .catch((error) => {
        message.error(error.response.data);
      })
      .finally(() => {
        setIsVisible(true);
      });
  };

  // ?????? ??????
  const handleCancel = () => {
    setIsVisible(false);
  };

  // ????????? ?????? ??????????????????
  const onConfirmOrder = (orderId) => () => {
    confirmOrderAPI({ orderId, msg })
      .then(() => {
        queryClient.refetchQueries("orders");
        message.success("??????????????? ?????????????????????.");
        handleCancel();
      })
      .catch((error) => {
        message.error(error.response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // ????????? ?????? ?????????????????? ??????
  const onCancelOrder = (orderId) => () => {
    cancelOrderAPI({ orderId, message: msg })
      .then(() => {
        queryClient.refetchQueries("orders");
        message.success("??????????????? ?????????????????????.");
        handleCancel();
      })
      .catch((error) => {
        message.error(error.response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // ?????? ????????? ?????????
  const PaintUnit = (unit) => {
    if (String(unit).toUpperCase() === "1KG") {
      return <p style={style1kg}>{unit}</p>;
    }
    if (String(unit).toUpperCase() === "500G") {
      return <p style={style500g}>{unit}</p>;
    }
    if (String(unit).toUpperCase() === "200G") {
      return <p style={style200g}>{unit}</p>;
    } else {
      return <p>{unit}</p>;
    }
  };
  // ????????? ????????? ?????????
  const PaintQty = (unit, qty) => {
    if (String(unit).toUpperCase() === "1KG") {
      if (qty >= 3 && qty <= 5) {
        return <p style={styleSize5}>{qty}???</p>;
      }
      if (qty > 5 && qty <= 8) {
        return <p style={styleSize8}>{qty}???</p>;
      }
      if (qty > 9) {
        return <p style={styleSize10}>{qty}???</p>;
      }
    }
    if (String(unit).toUpperCase() === "500G") {
      if (qty >= 5 && qty <= 10) {
        return <p style={styleSize5}>{qty}???</p>;
      }
      if (qty > 10 && qty <= 16) {
        return <p style={styleSize8}>{qty}???</p>;
      }
      if (qty > 16) {
        return <p style={styleSize10}>{qty}???</p>;
      }
    }
    return <p>{qty}???</p>;
  };

  // ?????? ??????????????? ??????
  const refineDatas = (data, codeName) => {
    const array1 = data.map((order, index) => {
      const details = order.OrderDetails.filter(function (item, index) {
        if (item.itemCodeName === codeName) {
          return true;
        }
      });
      return {
        name: order.name,
        id: order.id,
        date: order.date,
        Provider: order.Provider,
        Customer: order.Customer,
        factoryStatus: order.factoryStatus,
        count: order?.OrderDetails.length,
        details,
      };
    });
    const array2 = array1.filter(function (item, index) {
      if (item.details?.length >= 1) {
        return true;
      }
    });
    const newArr = [];
    array2.map((order, i) => {
      order.details.map((detail) => {
        newArr.push({
          name: order.name,
          id: order.id,
          date: order.date,
          count: order.count,
          Provider: order.Provider,
          Customer: order.Customer,
          factoryStatus: order.factoryStatus,
          dId: detail.id,
          qty: detail.qty,
          tag: detail.tag,
          status: detail.status,
          itemCodeName: detail.itemCodeName,
          itemPackage: detail.itemPackage,
          itemName: detail.itemName,
          itemUnit: detail.itemUnit,
        });
      });
    });
    return newArr;
  };

  // ?????? ??????
  const getWeight = (unit, qty) => {
    let weight = 0;
    if (String(unit).toUpperCase().replace(" ", "") === "1KG") {
      weight = 1 * Number(qty);
    } else if (String(unit).toUpperCase().replace(" ", "") === "500G") {
      weight = Number(qty) * 0.5;
    } else if (String(unit).toUpperCase().replace(" ", "") === "400G") {
      weight = Number(qty) * 0.4;
    } else if (String(unit).toUpperCase().replace(" ", "") === "200G") {
      weight = Number(qty) * 0.2;
    } else if (String(unit).toUpperCase().replace(" ", "") === "100G") {
      weight = Number(qty) * 0.1;
    } else {
      weight = 0;
    }
    return weight.toFixed(1) + "Kg";
  };

  // ?????? ?????? ??????
  const getTodaysTotalWeight = (datas) => {
    let totalWeight = 0;
    const array1 = datas.map((order, index) => {
      const details = order.OrderDetails;
      return {
        details,
      };
    });
    const array2 = array1.filter(function (item, index) {
      if (item.details?.length >= 1) {
        return true;
      }
    });
    array2.map((order, i) => {
      order.details.map((detail) => {
        const weight = getWeight(detail.itemUnit, detail.qty);
        totalWeight =
          totalWeight +
          Number(weight.toUpperCase().replace(" ", "").replace("KG", ""));
      });
    });
    setTodayTotalWeight(totalWeight);
  };

  // ????????? ?????? ??????
  const getCodeWeight = (codeName, datas) => {
    let codeWeiht = 0;
    const array1 = datas.map((order, index) => {
      const details = order.OrderDetails.filter(function (item, index) {
        if (item.itemCodeName === codeName) {
          return true;
        }
      });
      return {
        details,
      };
    });
    const array2 = array1.filter(function (item, index) {
      if (item.details?.length >= 1) {
        return true;
      }
    });
    array2.map((order, i) => {
      order.details.map((detail) => {
        const weight = getWeight(detail.itemUnit, detail.qty);
        codeWeiht =
          codeWeiht +
          Number(weight.toUpperCase().replace(" ", "").replace("KG", ""));
      });
    });
    return codeWeiht;
  };

  // ???????????? ????????? ??????
  const columns = [
    {
      title: "????????????",
      dataIndex: "id",
      type: "id",
      key: "id",
      render: (text, record) => (
        <span onClick={onOrderRowClick(record.id)}>{text}</span>
      ),
    },
    {
      title: "??????",
      type: "title",
      key: "itemName",
      dataIndex: "itemName",
      render: (text, record) => (
        <span onClick={onOrderRowClick(record.id)}>{text}</span>
      ),
    },
    {
      title: "??????",
      key: "itemPackage",
      type: "sub",
      dataIndex: "itemPackage",
      render: (text, record) => (
        <span onClick={onOrderRowClick(record.id)}>{text}</span>
      ),
    },
    {
      title: "??????",
      key: "itemUnit",
      type: "sub",
      dataIndex: "itemUnit",
      render: (text, record) => (
        <span onClick={onOrderRowClick(record.id)}>{text}</span>
      ),
    },
    {
      title: "??????",
      key: "qty",
      type: "sub",
      dataIndex: "qty",
      render: (text, record) => (
        <span onClick={onOrderRowClick(record.id)}>{text}???</span>
      ),
    },
    {
      title: "??????",
      key: "qty",
      type: "right",
      dataIndex: "qty",
      render: (text, record) => <>{getWeight(record.itemUnit, record.qty)}</>,
    },
    {
      title: "??????",
      dataIndex: "tag",
      key: "tag",
    },
    {
      title: "?????????",
      dataIndex: "Provider",
      key: "Provider",
      render: (text, record) => <>{text?.company}</>,
    },
    {
      title: "?????????",
      dataIndex: "Customer",
      key: "Customer",
      render: (text, record) => (
        <>
          {text?.company}/{record?.name}
        </>
      ),
    },
    {
      title: "????????????",
      dataIndex: "factoryStatus",
      key: "factoryStatus",
    },
    {
      title: "????????????",
      dataIndex: "date",
      key: "date",
      render: (text, record) => <>{moment(text).format("MM.DD HH:mm")}</>,
    },
    {
      title: "",
      dataIndex: "dId",
      key: "dId",
      type: "input",
      render: (text, record) => (
        <Button loading={loading} onClick={showOrderModal(record.id)}>
          ?????? {record.count}??? ????????????
        </Button>
      ),
    },
    {
      title: "",
      dataIndex: "dId",
      key: "dId",
      type: "input",
      render: (text, record) => {
        if (record?.factoryStatus === "??????") {
          return <Button disabled>??????</Button>;
        }
        if (record?.status === "????????????") {
          return (
            <Button
              loading={loading}
              onClick={onPackCancelClick(record.dId)}
              danger
            >
              ??????
            </Button>
          );
        } else {
          return (
            <Button
              loading={loading}
              type="primary"
              onClick={onConfirmClick(record.dId)}
            >
              ??????
            </Button>
          );
        }
      },
    },
  ];

  return (
    <AppLayout>
      <ContainerWide>
        {isFloatingButtonVisibale ? (
          <FloatingButton>
            <Link href={`/factory/add-order`}>
              <a>
                <Button
                  size="large"
                  shape="circle"
                  type="primary"
                  icon={<PlusOutlined />}
                ></Button>
              </a>
            </Link>
          </FloatingButton>
        ) : null}
        <Modal
          visible={isVisible}
          onCancel={handleCancel}
          width={680}
          footer={[<Button onClick={handleCancel}>??????</Button>]}
        >
          <>
            <OrderView
              orderData={orderData}
              mode={{ ship: true, price: false }}
            />
            <br />
            <Form>
              <Space size={8} wrap>
                <Input
                  value={msg}
                  onChange={onChangeMsg}
                  placeholder="????????????/???????????? ???"
                ></Input>
                <Button
                  loading={loading}
                  type="primary"
                  onClick={onConfirmOrder(selectedOrderId)}
                >
                  ???????????? ??????
                </Button>
                <Popconfirm
                  title="????????? ?????????????????????????"
                  onConfirm={onCancelOrder(selectedOrderId)}
                  okText="?????? ??????/??????"
                  cancelText="?????????"
                >
                  <Button danger loading={loading}>
                    ?????? ??????/??????
                  </Button>
                </Popconfirm>
                <Link href={`/item/order/view/${selectedOrderId}`}>
                  <a target="_blank">
                    <Button icon={<PrinterTwoTone />}></Button>
                  </a>
                </Link>
              </Space>
            </Form>
          </>
        </Modal>
        <TopBar>
          <Button icon={<SettingOutlined />} onClick={onToggleFilter}></Button>
          <span className="Title">?????? ??? ?????? ??????</span>
        </TopBar>
        {isFilterVisable ? (
          <FilterBox>
            <div>
              <span>?????? ??????</span>
              <Space wrap>
                <span>
                  <span>??????:</span>
                  <DatePicker
                    onChange={onChangeStartDate}
                    // locale={locale_kr}
                    defaultValue={startDate}
                  />
                </span>
                <span>
                  <span>??????:</span>
                  <DatePicker
                    onChange={onChangeEndtDate}
                    // locale={locale_kr}
                    defaultValue={endDate}
                  />
                </span>
              </Space>
              <div>
                <Checkbox.Group
                  options={retailStatusOptions}
                  defaultValue={orderStatOpt}
                  onChange={onStatOptChange}
                />
              </div>
              <div>
                <Checkbox.Group
                  options={factoryStatusOptions}
                  defaultValue={factoryStatOpt}
                  onChange={onFactoryStatOptChange}
                />
              </div>
              <div>
                <Checkbox.Group
                  options={itemStatusOptions}
                  defaultValue={orderDetailStatOpt}
                  onChange={onOrderDetailStatOptChange}
                />
              </div>
            </div>
            <Button loading={loading} onClick={onLoadTodos}>
              ??????
            </Button>
          </FilterBox>
        ) : null}
        {!isMobile ? (
          <TaBle>
            <tr>
              <th className="th1">
                ??????
                <br />
                ??????
              </th>
              <th className="th2">
                ????????????
                <br />
                ??????
              </th>
              <th className="th3">?????????</th>
              <th className="th4">
                ??????
                <br />
                ??????
              </th>
              <th className="th5">
                ??????
                <br />
                ??????
              </th>
              <th className="th6">
                ??????
                <br />
                ??????
              </th>
              <th className="th7">
                ?????????
                <br />
                ?????????
              </th>
              <th className="th8">
                ??????
                <br />
                ??????
              </th>
              <th className="th9">??????</th>
            </tr>
            {itemCodes?.map((codeName) => {
              let amount = 0.0;
              return (
                <>
                  <tr key={codeName.name} className="code">
                    <td colSpan={9}>
                      <CodeName>
                        <span>&nbsp;</span>&nbsp;{codeName.name}
                      </CodeName>
                    </td>
                  </tr>
                  <tbody>
                    {orders?.map((order) => {
                      const item = order.OrderDetails.filter(
                        (v) => v.itemCodeName === codeName.name
                      );
                      if (item[0]) {
                        return item.map((i) => {
                          const itemAmount = getWeight(i.itemUnit, i?.qty);
                          amount =
                            amount +
                            Number(
                              itemAmount
                                .toUpperCase()
                                .replace(" ", "")
                                .replace("KG", "")
                            );
                          return (
                            <tr
                              key={i.id}
                              style={
                                Number(order.id) === selectedOrderId
                                  ? selectedStyle
                                  : i?.status === "????????????"
                                  ? doneStyle
                                  : null
                              }
                            >
                              <td
                                className="th1"
                                onClick={showOrderModal(order.id)}
                              >
                                <p className="number">
                                  {String(i?.OrderId).slice(-3)}
                                </p>
                                {order?.OrderDetails.length >= 2 ? (
                                  <p className="count-two">
                                    {order.OrderDetails.length}
                                  </p>
                                ) : (
                                  <p className="count">
                                    {order.OrderDetails.length}
                                  </p>
                                )}
                              </td>
                              <td className="th2">
                                <p className="date">
                                  {dayjs(order.date).format("MM/DD HH:MM")}
                                </p>
                                {order.factoryStatus === "??????" ? (
                                  <p className="done">{order.factoryStatus}</p>
                                ) : (
                                  <p>{order.factoryStatus}</p>
                                )}
                              </td>
                              <td className="th3">{order.Provider?.company}</td>
                              <td
                                className="th4"
                                onClick={onOrderRowClick(order.id)}
                              >
                                {i?.itemName}
                                <br />
                                {i?.itemPackage}
                              </td>
                              <td className="th5">{i?.tag}</td>
                              <td className="th6">
                                {PaintUnit(i.itemUnit)}
                                {PaintQty(i.itemUnit, i?.qty)}
                              </td>
                              <td className="th7">
                                {order.Customer?.company}
                                <br />
                                {order?.name}
                              </td>
                              <td className="th8">
                                <Space>
                                  <PaintStatus status={order.status} />
                                  <PaintStatus status={i?.status} />
                                </Space>
                                <br />
                                {getWeight(i.itemUnit, i?.qty)}
                              </td>
                              <td className="th9">
                                {order.factoryStatus === "??????" ? (
                                  <Button disabled>??????</Button>
                                ) : i?.status === "????????????" ? (
                                  <Button
                                    loading={loading}
                                    onClick={onPackCancelClick(i.id)}
                                    danger
                                  >
                                    ??????
                                  </Button>
                                ) : (
                                  <Button
                                    loading={loading}
                                    type="primary"
                                    onClick={onConfirmClick(i.id)}
                                  >
                                    ??????
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      }
                    })}
                    <tr>
                      <td colSpan={9}>
                        <DoubleRightOutlined /> ??? {amount.toFixed(1)}Kg
                      </td>
                    </tr>
                  </tbody>
                </>
              );
            })}
          </TaBle>
        ) : (
          <>
            {itemCodes?.map((codeName) => {
              return (
                <>
                  <h1 key={codeName.name} className="code">
                    <CodeName>
                      <span>&nbsp;</span>&nbsp;{codeName.name}
                    </CodeName>
                  </h1>
                  <hr />
                  <MyTable
                    columns={columns}
                    dataSource={refineDatas(orders, codeName.name)}
                    rowKey="dId"
                    selectKey="id"
                    selectedId={selectedOrderId}
                  />
                  ??? ??????:{" "}
                  {String(getCodeWeight(codeName.name, orders).toFixed(1))} kg
                  <HGap />
                </>
              );
            })}
          </>
        )}
        <HGap />
        <h2>
          ????????? ?????? ??? ?????? : {String(todayTotalWeight.toFixed(1))}kg
          <br />
        </h2>
        <Space>
          <Link href={`/factory/add-order`}>
            <a>
              <Button type="primary">?????? ??????</Button>
            </a>
          </Link>
          <Popconfirm
            title="?????? ????????? ??????????????????????"
            okText="?????? ??????"
            cancelText="??????"
            onConfirm={onDoneTaskClick}
          >
            <Button loading={loading} danger>
              ?????? ?????? ?????? ??????
            </Button>
          </Popconfirm>
        </Space>
      </ContainerWide>
    </AppLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const cookie = context.req ? context.req.headers.cookie : ""; // ?????? ????????????
  axios.defaults.headers.Cookie = "";
  const id = context.params?.id as string;
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  const queryClient = new QueryClient();
  const response = await loadMyInfoAPI();
  if (!response) {
    // ????????? ???????????? ?????????
    return {
      redirect: {
        destination: "/unauth",
        permanent: false,
      },
    };
  }
  if (response?.role !== "ADMINISTRATOR") {
    // ????????? ???????????? ?????????
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

export default orderList;
