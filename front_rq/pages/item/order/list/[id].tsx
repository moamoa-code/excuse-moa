//@ts-nocheck
// antd 로케일 문제
import {
  Button,
  DatePicker,
  Divider,
  message,
  Space,
  Table,
  Typography,
} from "antd";
import axios from "axios";
import moment from "moment";
import "moment/locale/ko";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { dehydrate, QueryClient, useQuery } from "react-query";
import { useMediaQuery } from "react-responsive";
import styled from "styled-components";
import { loadMyOrdersAPI } from "../../../../apis/order";
import { loadMyInfoAPI } from "../../../../apis/user";
import AppLayout from "../../../../components/AppLayout";
import MyTable from "../../../../components/MyTable";
import { ContainerBig, HGap, RightText } from "../../../../components/Styled";
import Order from "../../../../interfaces/order";
import User from "../../../../interfaces/user";

const PageSizer = styled.div`
  font-size: 11pt;
  span {
    margin-right: 5px;
  }
  input {
    text-align: center;
    box-sizing: border-box;
    width: 50px;
    border: 1px solid #999999;
    border-radius: 4px;
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

// --특정 회원의 주문서 목록 페이지--
const OrderList = () => {
  const router = useRouter();
  const queryClient = new QueryClient();
  const { Title } = Typography;
  const { id: userId } = router.query; // 유저 id
  const { data: myUserInfo } = useQuery<User>("user", loadMyInfoAPI);
  const [datesVal, setDatesVal] = useState([
    moment().subtract(2, "months").format("YYYY-MM-DD"),
    moment().format("YYYY-MM-DD"),
  ]);
  // const [ dates, setDates ] = useState(datesVal);
  const [startDate, setStartDate] = useState(moment().subtract(2, "months"));
  const [endDate, setEndDate] = useState(moment());
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalWeight, setTotalWeight] = useState("0Kg");
  const [pageSize, setPageSize] = useState(10);
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:768px)",
  });
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
  const { isLoading, data: orders } = useQuery<Order[]>(
    ["orders", datesVal],
    () => {
      return loadMyOrdersAPI(userId, datesVal);
    },
    {
      onSuccess: (data) => {
        getTotalPrice(data);
        getTotalWeight(data);
      },
    }
  ); // 데이터 불러오기, 총 금액 계산
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

  // 권한 없을경우 오류페이지로
  useEffect(() => {
    if (myUserInfo?.role !== "ADMISTRATOR") {
      if (String(myUserInfo?.id) !== userId) {
        router.replace(`/unauth`);
      }
    }
  }, [myUserInfo]);
  
  const onChangePageSize = (e) => {
    if (e.target.value >= 100) {
      return setPageSize(100);
    }
    return setPageSize(e.target.value);
  };

  const onLoadOrdersWithDates = () => {
    if (!startDate || !endDate) {
      message.error("날짜를 선택해 주세요.", 0.5);
      return;
    }
    const newDates = [
      moment(startDate).format("YYYY-MM-DD"),
      moment(endDate).format("YYYY-MM-DD"),
    ];
    setDatesVal(newDates);
    queryClient.invalidateQueries("orders");
  };

  // 주문 목록 테이블 컬럼
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
      title: "배송상태",
      dataIndex: "factoryStatus",
      type: "sub",
      key: "factoryStatus",
      render: (text, record) => {
        if (text === "출하") {
          return <>출하완료</>;
        } else {
          return <>{text}</>;
        }
      },
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
        <Link href={`/item/order/${record.id}`}>
          <a>조회</a>
        </Link>
      ),
    },
  ];

  const onChangeStartDate = (date, dateString) => {
    setStartDate(date);
  };
  const onChangeEndtDate = (date, dateString) => {
    setEndDate(date);
  };

  return (
    <AppLayout>
      {/* {JSON.stringify(orders)} */}
      <ContainerBig>
        <Title level={4}>주문 목록</Title>
        <Space wrap>
          <Space>
            <span>시작:</span>
            <DatePicker
              onChange={onChangeStartDate}
              locale={pickerLocale}
              defaultValue={startDate}
            />
          </Space>
          <Space>
            <span>까지:</span>
            <DatePicker
              onChange={onChangeEndtDate}
              locale={pickerLocale}
              defaultValue={endDate}
            />
          </Space>
          <br />
          <span>기간 검색</span>
          <Button onClick={onLoadOrdersWithDates}>적용</Button>
        </Space>
        <HGap />
        {isMobile ? (
          <MyTable
            rowKey="id"
            columns={columns}
            dataSource={orders}
            loading={isLoading}
          />
        ) : (
          <>
            <Table
              rowKey="id"
              columns={columns}
              dataSource={orders}
              loading={isLoading}
              pagination={{ pageSize: pageSize }}
            />
            <HGap />
            <PageSizer>
              <span>페이지크기</span>
              <input
                type="number"
                max={100}
                maxLength={3}
                value={pageSize}
                onChange={onChangePageSize}
              />
            </PageSizer>
          </>
        )}
        <HGap />
        {totalPrice ? (
          <>
            <Divider orientation="right">
              총 중량 {totalWeight} , 총 금액:{" "}
              {String(totalPrice)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? ""}{" "}
              원
            </Divider>
            <RightText>
              *주문취소 제외 기간내 검색결과 모든페이지 합산.{" "}
            </RightText>
          </>
        ) : null}
      </ContainerBig>
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
  const datesVal = [
    moment().subtract(2, "months").format("YYYY-MM-DD"),
    moment().format("YYYY-MM-DD"),
  ];
  const queryClient = new QueryClient();
  const response = await loadMyInfoAPI();
  const orderDatas = await loadMyOrdersAPI(id, datesVal).catch((error) => {
    return {
      redirect: {
        destination: "/unauth",
        permanent: false,
      },
    };
  });
  if (!response) {
    // 로그인 안했으면 홈으로
    return {
      redirect: {
        destination: "/unauth",
        permanent: false,
      },
    };
  }
  let error = false;
  if (orderDatas?.length >= 1) {
    if (
      orderDatas[0].ProviderId !== response.id &&
      orderDatas[0].CustomerId !== response.id &&
      response.role !== "ADMINISTRATOR"
    ) {
      error = true;
    }
  }
  if (error) {
    return {
      redirect: {
        destination: "/unauth",
        permanent: false,
      },
    };
  }

  await queryClient.prefetchQuery(["user"], () => loadMyInfoAPI());
  await queryClient.prefetchQuery(["orders", datesVal], () =>
    loadMyOrdersAPI(id, datesVal)
  );
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default OrderList;
