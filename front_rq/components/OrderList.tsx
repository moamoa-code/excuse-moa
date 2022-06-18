// @ts-nocheck
// antd 로케일 관련 오류
import { LoadingOutlined, PrinterTwoTone } from "@ant-design/icons";
import { Button, DatePicker, message, Space } from "antd";
import moment from "moment";
import "moment/locale/ko";
import Link from "next/link";
import React, { useState } from "react";
import { QueryClient, useQuery } from "react-query";
import { useMediaQuery } from "react-responsive";
import styled from "styled-components";
import {
  loadMyOrdersAPI,
  loadOrderAPI,
  loadReceivedOrdersWithDatesAPI,
} from "../apis/order";
import MyTable from "./MyTable";
import OrderView from "./OrderView";
import { HGap } from "./Styled";

const ListTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
  min-width: 300px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);

  .msg {
    text-align: center;
    font-size: 12pt;
    font-wight: bold;
  }

  thead tr {
    background-color: #4d96ff;
    color: #ffffff;
    text-align: left;
  }
  th,
  td {
    padding: 12px 15px;
  }
  .styled-table tbody tr {
    border-bottom: 1px solid #dddddd;
  }
  tbody tr:nth-of-type(even) {
    background-color: #f3f3f3;
  }
  tbody tr:last-of-type {
    border-bottom: 2px solid #4d96ff;
  }
  tbody tr:hover {
    color: #4d96ff;
  }
`;

const pickerLocale = {
  // antd DatePicker 로케일 설정
  lang: {
    locale: "ko_KR",
    yearFormat: "YYYY",
    dateFormat: "M/D/YYYY",
    dayFormat: "D",
    dateTimeFormat: "M/D/YYYY HH:mm:ss",
    monthFormat: "MMMM",
  },
  dateFormat: "YYYY-MM-DD",
  dateTimeFormat: "YYYY-MM-DD HH:mm:ss",
  weekFormat: "YYYY-wo",
  monthFormat: "YYYY-MM",
};

// 주문서 목록
const OrderList = ({ userInfo, mode }) => {
  const LIST = 1;
  const ORDER = 2;
  const [datesVal, setDatesVal] = useState([
    moment().subtract(1, "months").format("YYYY-MM-DD"),
    moment().format("YYYY-MM-DD"),
  ]);
  const [startDate, setStartDate] = useState(moment().subtract(1, "months"));
  const [endDate, setEndDate] = useState(moment());
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalWeight, setTotalWeight] = useState("0Kg");
  const [orderOrList, setOrderOrList] = useState(LIST);
  const [orderData, setOrderDate] = useState(null);
  const queryClient = new QueryClient();
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:768px)",
  });
  const { isLoading, data: orders } = useQuery(
    ["orders", startDate, endDate],
    () => {
      if (mode === "CUSTOMER") {
        return loadMyOrdersAPI(userInfo.id, [startDate, endDate]);
      }
      if (mode === "PROVIDER") {
        return loadReceivedOrdersWithDatesAPI(userInfo.id, [
          startDate,
          endDate,
        ]);
      }
    },
    {
      onSuccess: (data) => {
        getTotalPrice(data);
        getTotalWeight(data);
      },
    }
  );
  const getTotalWeight = (orders) => {
    // 총 무게 계산
    let totalWeight = 0;
    if (orders) {
      orders.map((v) => {
        let weight = 0;
        if (isNaN(v.totalWeight) || v.status.includes("주문취소")) {
          weight = 0;
        }
        if (String(v.totalWeight).toUpperCase().slice(-2) === "KG") {
          weight = Number(
            String(v.totalWeight).toUpperCase().replace("KG", "")
          );
        } else {
          weight = 0;
        }
        totalWeight = totalWeight + weight;
      });
    }
    totalWeight = totalWeight.toFixed(1) + "Kg";
    setTotalWeight(totalWeight);
    return String(totalWeight);
  };
  const getTotalPrice = (orders) => {
    // 총 금액 계산
    let total = 0;
    if (orders) {
      orders.map((v) => {
        let price = Number(v.totalPrice) ?? 0;
        if (isNaN(price) || v.status.includes("주문취소")) {
          price = 0;
        }
        total = total + Number(price);
      });
    }
    setTotalPrice(total);
    return String(total);
  };

  // 검색 날짜 조절
  const onChangeStartDate = (date) => {
    setStartDate(date);
  };
  const onChangeEndtDate = (date) => {
    setEndDate(date);
  };

  const onLoadOrdersWithDates = () => {
    if (!startDate || !endDate) {
      message.error("날짜를 선택해 주세요.", 0.5);
      return;
    }
    queryClient.invalidateQueries();
  };

  const columns = [
    {
      title: "주문번호",
      dataIndex: "id",
      type: "id",
      key: "id",
    },
    {
      title: "주문일시",
      dataIndex: "date",
      type: "title",
      key: "date",
      render: (text, record) => <>{moment(text).format("YY.MM.DD HH:mm")}</>,
    },
    {
      title: "총 공급가",
      key: "totalPrice",
      dataIndex: "totalPrice",
    },
    {
      title: "총 중량",
      key: "totalWeight",
      type: "right",
      dataIndex: "totalWeight",
    },
    {
      title: "공급사",
      dataIndex: "Provider",
      key: "Provider",
      render: (text, record) => <>{text.company}</>,
    },
    {
      title: "주문상태",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "",
      type: "right",
      key: "action",
      render: (text, record) => (
        <span class="link" onClick={showOrder(record?.id)}>
          보기
        </span>
      ),
    },
  ];

  const providerColumns = [
    {
      title: "주문번호",
      dataIndex: "id",
      type: "id",
      key: "id",
    },
    {
      title: "주문일시",
      dataIndex: "date",
      type: "title",
      key: "date",
      render: (text, record) => <>{moment(text).format("YY.MM.DD HH:mm")}</>,
    },
    {
      title: "총 공급가",
      key: "totalPrice",
      dataIndex: "totalPrice",
    },
    {
      title: "총 중량",
      key: "totalWeight",
      type: "right",
      dataIndex: "totalWeight",
    },
    {
      title: "고객사",
      dataIndex: "Customer",
      key: "Customer",
      render: (text, record) => <>{text?.company}</>,
    },
    {
      title: "주문상태",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "",
      type: "right",
      key: "action",
      render: (text, record) => (
        <span class="link" onClick={showOrder(record?.id)}>
          보기
        </span>
      ),
    },
  ];

  // 주문서보기
  const showOrder = (id) => () => {
    loadOrderAPI(Number(id))
      .then((response) => {
        setOrderDate(response);
        setOrderOrList(ORDER);
      })
      .catch((error) => {
        message.error(error.response.data);
      })
      .finally(() => {});
  };
  // 리스트보기
  const showList = () => {
    setOrderOrList(LIST);
  };

  if (orderOrList === ORDER) {
    return (
      <>
        <Button onClick={showList}>목록으로 돌아가기</Button>
        <OrderView orderData={orderData} mode={{ ship: true, price: true }} />
        <br />
        <Link href={`/item/order/view/${orderData?.order?.id}`}>
          <a target="_blank">
            <Button icon={<PrinterTwoTone />}></Button>
          </a>
        </Link>
      </>
    );
  }

  if (orderOrList === LIST) {
    if (mode === "CUSTOMER") {
      return (
        <>
          {isMobile ? (
            <>
              <MyTable rowKey="id" columns={columns} dataSource={orders} />
              <HGap />
              <div>
                총 주문 중량: {totalWeight}
                <br />총 주문가격: {String(totalPrice).toString()} 원
              </div>
              <HGap />
            </>
          ) : (
            <>
              <Space wrap>
                <Space>
                  <span>시작:</span>
                  <DatePicker
                    onChange={onChangeStartDate}
                    locale={pickerLocale}
                    defaultValue={startDate}
                    autocomplete="off"
                  />
                </Space>
                <Space>
                  <span>까지:</span>
                  <DatePicker
                    onChange={onChangeEndtDate}
                    locale={pickerLocale}
                    defaultValue={endDate}
                    autocomplete="off"
                  />
                </Space>
                <br />
                <Button onClick={onLoadOrdersWithDates}>적용</Button>
              </Space>
              <br />
              <br />
              <ListTable>
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>주문일시</th>
                    <th>공급사</th>
                    <th>공급가</th>
                    <th>주문상태</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.map((v) => {
                    return (
                      <tr onClick={showOrder(v?.id)}>
                        <td>{v?.id}</td>
                        <td>{moment(v?.date).format("YY.MM.DD HH:mm")}</td>
                        <td>{v?.Provider?.company}</td>
                        <td>{v?.totalPrice}</td>
                        <td>{v?.status}</td>
                      </tr>
                    );
                  })}
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="msg">
                        <LoadingOutlined style={{ fontSize: 24 }} spin />
                      </td>
                    </tr>
                  ) : null}
                  {orders?.length <= 0 ? (
                    <tr>
                      <td colSpan={5} className="msg">
                        데이터가 없습니다.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </ListTable>

              <div>
                총 주문 중량: {totalWeight}
                <br />총 주문가격: {String(totalPrice).toString()} 원
              </div>
            </>
          )}
        </>
      );
    }
    if (mode === "PROVIDER") {
      return (
        <>
          {isMobile ? (
            <>
              <MyTable
                rowKey="id"
                columns={providerColumns}
                dataSource={orders}
              />
              <HGap />
              {/* .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") ?? '' */}
              <div>
                총 주문 중량: {totalWeight}
                <br />총 주문가격:{" "}
                {String(totalPrice)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                원
              </div>
              <HGap />
            </>
          ) : (
            <>
              <Space wrap>
                <Space>
                  <span>시작:</span>
                  <DatePicker
                    onChange={onChangeStartDate}
                    locale={pickerLocale}
                    defaultValue={startDate}
                    autocomplete="off"
                  />
                </Space>
                <Space>
                  <span>까지:</span>
                  <DatePicker
                    onChange={onChangeEndtDate}
                    locale={pickerLocale}
                    defaultValue={endDate}
                    autocomplete="off"
                  />
                </Space>
                <br />
                <Button onClick={onLoadOrdersWithDates}>적용</Button>
              </Space>
              <br />
              <br />
              <ListTable>
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>주문일시</th>
                    <th>고객사</th>
                    <th>공급가</th>
                    <th>주문상태</th>
                  </tr>
                </thead>
                <tbody>
                  {orders?.map((v) => {
                    return (
                      <tr onClick={showOrder(v?.id)}>
                        <td>{v?.id}</td>
                        <td>{moment(v?.date).format("YY.MM.DD HH:mm")}</td>
                        <td>{v?.Customer?.company}</td>
                        <td>{v?.totalPrice}</td>
                        <td>{v?.status}</td>
                      </tr>
                    );
                  })}
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="msg">
                        <LoadingOutlined style={{ fontSize: 24 }} spin />
                      </td>
                    </tr>
                  ) : null}
                  {orders?.length <= 0 ? (
                    <tr>
                      <td colSpan={5} className="msg">
                        데이터가 없습니다.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </ListTable>
              {/* .replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") ?? '' */}
              <div>
                총 주문 중량: {totalWeight}
                <br />총 주문가격:{" "}
                {String(totalPrice)
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                원
              </div>
            </>
          )}
        </>
      );
    }
  }
  return (
    <>
      {mode} {JSON.stringify(isMobile)}
      데이터가 없습니다.{" "}
      {isMobile && mode === "CUSTOMER" ? <>메롱</> : <>아닌뒈</>}
    </>
  );
};

export default OrderList;
