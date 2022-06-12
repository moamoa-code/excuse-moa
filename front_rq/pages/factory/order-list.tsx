// 주문서 목록
import {
  CheckCircleOutlined,
  CheckCircleTwoTone,
  CheckSquareTwoTone,
  CloseCircleFilled,
  DoubleRightOutlined,
  MinusCircleOutlined, PlaySquareOutlined,
  PlusOutlined,
  PrinterTwoTone,
  SettingOutlined
} from "@ant-design/icons";
import {
  Button,
  Checkbox, DatePicker, Form, Input, message,
  notification,
  Popconfirm, Space,
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
  QueryClient, useMutation, useQuery, useQueryClient
} from "react-query";
import { useMediaQuery } from "react-responsive";
import styled from "styled-components";
import {
  cancelOrderAPI,
  confirmOrderAPI, loadOrderAPI, loadTodosAPI, packCancelAPI,
  packDoneAPI,
  taskDoneAPI
} from "../../apis/order";
import { loadMyInfoAPI } from "../../apis/user";
import AppLayout from "../../components/AppLayout";
import MyTable from "../../components/MyTable";
import OrderView from "../../components/OrderView";
import {
  ContainerWide,
  HGap
} from "../../components/Styled";
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

// 상태 아이콘 컴포넌트
const PaintStatus = (props) => {
  const redStyle = useMemo(() => ({ color: "red" }), []);
  if (props.status === "주문요청") {
    return <CheckCircleOutlined />;
  }
  if (props.status === "주문확인완료") {
    return <CheckCircleTwoTone />;
  }
  if (props.status === "주문취소요청중") {
    return <MinusCircleOutlined style={redStyle} />;
  }
  if (props.status === "주문취소완료") {
    return <CloseCircleFilled style={redStyle} />;
  }
  if (props.status === "작업중") {
    return <PlaySquareOutlined />;
  }
  if (props.status === "포장완료") {
    return <CheckSquareTwoTone />;
  }
};

const orderList = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const { data: myUserInfo } = useQuery<User>("user", loadMyInfoAPI);
  // 목록 불러오기 필터 state
  const [isFilterVisable, setIsFilterVisiable] = useState(false);
  const [startDate, setStartDate] = useState(moment().subtract(5, "days"));
  const [endDate, setEndDate] = useState(moment());
  const [orderStatOpt, setOrderStatOpt] = useState([
    "주문요청",
    "주문확인완료",
  ]);
  const [factoryStatOpt, setFactoryStatOpt] = useState(["작업중"]);
  const [orderDetailStatOpt, setOrderDetailStatOpt] = useState([
    "작업중",
    "포장완료",
    "보류",
  ]);
  const [isFloatingButtonVisibale, setIsFloatingButtonVisibale] =
    useState(true);
  const [todayTotalWeight, setTodayTotalWeight] = useState(0);

  const [itemCodes, setItemCodes] = useState([]); // 제품코드 기준으로 카테고리화
  // 주문서 보기 모달
  const [isVisible, setIsVisible] = useState(false);
  const [orderData, setOrderData] = useState({}); // 모달 주문 상세 데이터
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [msg, onChangeMsg] = useInput(""); // 주문취소 등 메시지입력
  // CSS 스타일 useMemo
  const doneStyle = useMemo(() => ({ backgroundColor: "#eef3ff" }), []); // 포장완료 스타일
  const selectedStyle = useMemo(() => ({ backgroundColor: "#f8edf8" }), []); // 선택된 주문건 스타일
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

  // 스크롤에 따라 주문추가 버튼 보이기
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

  // 주문목록 검색 옵션(필터)창 토글
  const onToggleFilter = () => {
    if (isFilterVisable === false) {
      return setIsFilterVisiable(true);
    }
    return setIsFilterVisiable(false);
  };

  // 주문 목록 불러오기 API
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
        const newArr = Array.from(new Set(codes.flat(2))); // 코드네임 중복제거
        const objArr = newArr.map((v) => ({ name: v, amount: 0 }));
        setItemCodes(objArr);
        getTodaysTotalWeight(data);
      },
    }
  );

  const openNotification = (text) => {
    // 알림창 띄우기
    notification.open({
      message: `${text}`,
      description: ``,
      icon: <CheckCircleOutlined style={{ color: "#108ee9" }} />,
      duration: 2,
    });
  };

  // 주문 목록 필터 버튼
  const onLoadTodos = () => {
    if (!startDate || !endDate) {
      message.error("날짜를 선택해 주세요.", 0.5);
      return;
    }
    refetch();
  };

  // 포장 완료 API
  const mutation = useMutation<void, AxiosError, { id }>(packDoneAPI, {
    onMutate: () => {
      setLoading(true);
    },
    onError: (error) => {
      message.error(error.response?.data);
    },
    onSuccess: (result) => {
      openNotification("포장완료 확인");
    },
    onSettled: () => {
      setLoading(false);
      queryClient.invalidateQueries("orders");
    },
  });

  // 검색 날짜 조절
  const onChangeStartDate = (date, dateString) => {
    setStartDate(date);
  };
  const onChangeEndtDate = (date, dateString) => {
    setEndDate(date);
  };

  // 포장 완료 버튼
  const onConfirmClick = (id) => () => {
    mutation.mutate({ id: id });
  };

  const onOrderRowClick = (id) => () => {
    if (id === selectedOrderId) {
      return setSelectedOrderId(null);
    }
    setSelectedOrderId(id);
  };

  // 포장 완료 취소 버튼
  const onPackCancelClick = (id) => () => {
    setLoading(true);
    packCancelAPI({ id })
      .then(() => {
        openNotification("포장 취소");
        queryClient.invalidateQueries("orders");
      })
      .catch((error) => {
        message.error(error.response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 출하 완료 버튼
  const onDoneTaskClick = () => {
    setLoading(true);
    const data = orders.map((v) => v.id);
    taskDoneAPI(data)
      .then((response) => {
        openNotification("금일 출하작업이 완료되었습니다.");
      })
      .catch((error) => {
        message.error(error.response.data);
      })
      .finally(() => {
        queryClient.refetchQueries("orders");
        setLoading(false);
      });
  };

  // 주문목록 필터 체크박스 값
  const retailStatusOptions = [
    "주문요청",
    "주문취소요청중",
    "주문확인완료",
    "주문취소완료",
  ];
  const factoryStatusOptions = ["작업중", "출하"];
  const itemStatusOptions = ["작업중", "포장완료", "보류"];

  // 필터 체크박스 상태 변경
  const onStatOptChange = (checkedValues) => {
    setOrderStatOpt(checkedValues);
  };
  const onFactoryStatOptChange = (checkedValues) => {
    setFactoryStatOpt(checkedValues);
  };
  const onOrderDetailStatOptChange = (checkedValues) => {
    setOrderDetailStatOpt(checkedValues);
  };

  // 주문서 보기 API 모달
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

  // 모달 닫기
  const handleCancel = () => {
    setIsVisible(false);
  };

  // 주문서 모달 주문확인처리
  const onConfirmOrder = (orderId) => () => {
    confirmOrderAPI({ orderId, msg })
      .then(() => {
        queryClient.refetchQueries("orders");
        message.success("주문확인이 완료되었습니다.");
        handleCancel();
      })
      .catch((error) => {
        message.error(error.response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 주문서 모달 주문취소완료 처리
  const onCancelOrder = (orderId) => () => {
    cancelOrderAPI({ orderId, message: msg })
      .then(() => {
        queryClient.refetchQueries("orders");
        message.success("주문취소가 완료되었습니다.");
        handleCancel();
      })
      .catch((error) => {
        message.error(error.response.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 단위 아이콘 그리기
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
  // 수량별 아이콘 그리기
  const PaintQty = (unit, qty) => {
    if (String(unit).toUpperCase() === "1KG") {
      if (qty >= 3 && qty <= 5) {
        return <p style={styleSize5}>{qty}개</p>;
      }
      if (qty > 5 && qty <= 8) {
        return <p style={styleSize8}>{qty}개</p>;
      }
      if (qty > 9) {
        return <p style={styleSize10}>{qty}개</p>;
      }
    }
    if (String(unit).toUpperCase() === "500G") {
      if (qty >= 5 && qty <= 10) {
        return <p style={styleSize5}>{qty}개</p>;
      }
      if (qty > 10 && qty <= 16) {
        return <p style={styleSize8}>{qty}개</p>;
      }
      if (qty > 16) {
        return <p style={styleSize10}>{qty}개</p>;
      }
    }
    return <p>{qty}개</p>;
  };

  // 주문 배열데이터 가공
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

  // 중량 계산
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

  // 전체 중량 계산

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
  }

  // 코드별 중량 계산
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

  const columns = [
    {
      title: "주문번호",
      dataIndex: "id",
      type: "id",
      key: "id",
      render: (text, record) => (
        <span onClick={onOrderRowClick(record.id)}>{text}</span>
      ),
    },
    {
      title: "품명",
      type: "title",
      key: "itemName",
      dataIndex: "itemName",
      render: (text, record) => (
        <span onClick={onOrderRowClick(record.id)}>{text}</span>
      ),
    },
    {
      title: "포장",
      key: "itemPackage",
      type: "sub",
      dataIndex: "itemPackage",
      render: (text, record) => (
        <span onClick={onOrderRowClick(record.id)}>{text}</span>
      ),
    },
    {
      title: "단위",
      key: "itemUnit",
      type: "sub",
      dataIndex: "itemUnit",
      render: (text, record) => (
        <span onClick={onOrderRowClick(record.id)}>{text}</span>
      ),
    },
    {
      title: "수량",
      key: "qty",
      type: "sub",
      dataIndex: "qty",
      render: (text, record) => (
        <span onClick={onOrderRowClick(record.id)}>{text}개</span>
      ),
    },
    {
      title: "중량",
      key: "qty",
      type: "right",
      dataIndex: "qty",
      render: (text, record) => <>{getWeight(record.itemUnit, record.qty)}</>,
    },
    {
      title: "옵션",
      dataIndex: "tag",
      key: "tag",
    },
    {
      title: "공급사",
      dataIndex: "Provider",
      key: "Provider",
      render: (text, record) => <>{text?.company}</>,
    },
    {
      title: "주문사",
      dataIndex: "Customer",
      key: "Customer",
      render: (text, record) => (
        <>
          {text?.company}/{record?.name}
        </>
      ),
    },
    {
      title: "출고상태",
      dataIndex: "factoryStatus",
      key: "factoryStatus",
    },
    {
      title: "주문일시",
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
          합포 {record.count}개 주문보기
        </Button>
      ),
    },
    {
      title: "",
      dataIndex: "dId",
      key: "dId",
      type: "input",
      render: (text, record) => {
        if (record?.factoryStatus === "출하") {
          return <Button disabled>출고</Button>;
        }
        if (record?.status === "포장완료") {
          return (
            <Button
              loading={loading}
              onClick={onPackCancelClick(record.dId)}
              danger
            >
              취소
            </Button>
          );
        } else {
          return (
            <Button
              loading={loading}
              type="primary"
              onClick={onConfirmClick(record.dId)}
            >
              완료
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
          footer={[<Button onClick={handleCancel}>닫기</Button>]}
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
                  placeholder="배송사항/취소사유 등"
                ></Input>
                <Button
                  loading={loading}
                  type="primary"
                  onClick={onConfirmOrder(selectedOrderId)}
                >
                  주문확인 완료
                </Button>
                <Popconfirm
                  title="주문을 반려하시겠습니까?"
                  onConfirm={onCancelOrder(selectedOrderId)}
                  okText="주문 취소/반려"
                  cancelText="아니오"
                >
                  <Button danger loading={loading}>
                    주문 취소/반려
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
          <span className="Title">주문 및 포장 현황</span>
        </TopBar>
        {isFilterVisable ? (
          <FilterBox>
            <div>
              <span>주문 날짜</span>
              <span>&nbsp;시작:</span>
              <DatePicker
                onChange={onChangeStartDate}
                // locale={locale_kr}
                defaultValue={startDate}
              />
              <span>까지:</span>
              <DatePicker
                onChange={onChangeEndtDate}
                // locale={locale_kr}
                defaultValue={endDate}
              />
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
              적용
            </Button>
          </FilterBox>
        ) : null}
        {!isMobile ? (
          <TaBle>
            <tr>
              <th className="th1">
                번호
                <br />
                합포
              </th>
              <th className="th2">
                주문시각
                <br />
                상태
              </th>
              <th className="th3">판매사</th>
              <th className="th4">
                품명
                <br />
                포장
              </th>
              <th className="th5">
                표기
                <br />
                옵션
              </th>
              <th className="th6">
                단위
                <br />
                수량
              </th>
              <th className="th7">
                주문사
                <br />
                수령인
              </th>
              <th className="th8">
                상태
                <br />
                중량
              </th>
              <th className="th9">완료</th>
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
                                  : i?.status === "포장완료"
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
                                {order.factoryStatus === "출하" ? (
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
                                {order.factoryStatus === "출하" ? (
                                  <Button disabled>출고</Button>
                                ) : i?.status === "포장완료" ? (
                                  <Button
                                    loading={loading}
                                    onClick={onPackCancelClick(i.id)}
                                    danger
                                  >
                                    취소
                                  </Button>
                                ) : (
                                  <Button
                                    loading={loading}
                                    type="primary"
                                    onClick={onConfirmClick(i.id)}
                                  >
                                    완료
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
                        <DoubleRightOutlined /> 총 {amount.toFixed(1)}Kg
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
                  총 중량:{" "}
                  {String(getCodeWeight(codeName.name, orders).toFixed(1))} kg
                  <HGap />
                </>
              );
            })}
          </>
        )}
        <HGap />
        <h2>조회된 주문 총 중량 : {String(todayTotalWeight.toFixed(1))}kg<br /></h2>
        <Space>
          <Link href={`/factory/add-order`}>
            <a>
              <Button type="primary">주문 추가</Button>
            </a>
          </Link>
          <Popconfirm
            title="출하 작업을 완료하셨습니까?"
            okText="작업 완료"
            cancelText="취소"
            onConfirm={onDoneTaskClick}
          >
            <Button loading={loading} danger>
              금일 출하 작업 완료
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
        destination: "/unauth",
        permanent: false,
      },
    };
  }
  if (response.role !== "ADMINISTRATOR") {
    // 로그인 안했으면 홈으로
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
