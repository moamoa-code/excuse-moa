import { CalculatorOutlined, MoreOutlined } from "@ant-design/icons";
import {
  Button,
  Divider,
  message,
  Popconfirm,
  Space,
  Table,
  Typography,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { dehydrate, QueryClient, useQuery, useQueryClient } from "react-query";
import { useMediaQuery } from "react-responsive";
import {
  confirmInventoryReportAPI,
  deleteInventoryAPI,
  getInventoriesAPI,
  getInventoryDataAPI,
  getInventoryGroupAPI,
} from "../../../apis/inventory";
import { loadMyInfoAPI } from "../../../apis/user";
import AppLayout from "../../../components/AppLayout";
import {
  Block,
  ContainerBig,
  FormBox,
  HGap,
  InventoryTable,
  LeftAndRightDiv,
} from "../../../components/Styled";
import useInput from "../../../hooks/useInput";
import ResDataWithCount from "../../../interfaces/resData";
import User from "../../../interfaces/user";

// --재고보고서 열람 페이지--
const InventoryReports = () => {
  dayjs.locale("ko");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = router.query; // 인벤토리 그룹 id
  const [loading, setLoading] = useState(false);
  const { data: myUserInfo } = useQuery<User>("me", loadMyInfoAPI);
  const { data: inventoryGroup } = useQuery(["inventoryGroup", id], () =>
    getInventoryGroupAPI(Number(id))
  );
  const [page, setPage] = useState(1);
  const { data: inventories } = useQuery<ResDataWithCount>(
    ["inventories", id, page],
    () => getInventoriesAPI(Number(id), page)
  );
  const [count, setCount] = useState(0); // inventories.count
  const [inventoriesData, setInventoriesData] = useState(null); // inventories.rows
  const [inventoryData, setInventoryData] = useState(null);
  const [stockInputs, setStockInputs] = useState([]);
  const statusArray = [
    "OK",
    "부족",
    "주문완료",
    "주문필요",
    "불요",
    "보류",
    "과다",
  ];
  const [types, setTypes] = useState([]); // 재고품목 카테고리
  const { Title } = Typography;
  const [memo, onChangeMemo, setMemo] = useInput("");
  const [isEmpty, setIsEmpty] = useState(false);
  const [extendedRow, setExtendedRow] = useState(null);
  const [showTotalQty, setShowTotalQty] = useState(false);
  const shortageStyle = useMemo(() => ({ backgroundColor: "#FFBCD1" }), []);
  const calcBtnStyle = useMemo(
    () => ({ fontSize: "16pt", color: "#5e5e5e" }),
    []
  );
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:740px)",
  });

  // 재고보고서 삭제
  const onDeleteInventoryReport = (id) => () => {
    const data = { id: id };
    deleteInventoryAPI(data)
      .then((data) => {
        message.info("해당 보고서를 삭제했습니다.");
      })
      .catch((e) => {
        message.error(JSON.stringify(e));
      })
      .finally(() => {
        queryClient.invalidateQueries();
        setLoading(false);
      });
  };

  // 테이블에 맞게 재고보고서 데이터 가공
  const refineInventoryData = (data) => {
    const typeRaw = data.datas?.map((v) => {
      return v.Stock.type;
    });
    const pureType = typeRaw.filter((v, i) => {
      // 중복제거
      return typeRaw.indexOf(v) === i;
    });
    const stocks = data.datas?.map((v, i) => {
      const stock = {
        id: v.id,
        stockId: v.Stock.id,
        stockName: v.Stock.name,
        stockType: v.Stock.type,
        reqQty: v.reqQty,
        unit: v.unit,
        qty: v.qty,
        location: v?.location,
        status: v?.status,
        memo: v.memo,
        desc: v.Stock.desc,
      };
      return stock;
    });
    setTypes(pureType);
    setStockInputs(stocks);
  };

  // 재고보고서 불러오기
  const getInventoryData = (id) => {
    setLoading(true);
    getInventoryDataAPI(id)
      .then((data) => {
        setInventoryData(data);
        refineInventoryData(data);
      })
      .catch((error) => {
        message.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (inventories?.rows.length >= 1) {
      setInventoriesData(inventories.rows);
      setCount(inventories?.count);
      getInventoryData(Number(inventories.rows[0].id));
      setIsEmpty(false);
    } else {
      setIsEmpty(true);
    }
  }, [inventories, inventoryGroup]);

  // 재고보고서 목록에서 재고보고서 보기 클릭
  const onClickVeiw = (id) => (e) => {
    e.stopPropagation();
    getInventoryData(id);
  };

  // 재고보고서 확인완료 처리
  const onConfirmReport = (value) => () => {
    if (!inventoryData) {
      return message.error("보고서 데이터가 없습니다.");
    }
    if (!stockInputs) {
      return message.error("보고서 데이터가 없습니다.");
    }
    const data = {
      id: inventoryData?.inventory.id,
      memo,
      value,
      datas: stockInputs,
    };
    setLoading(true);
    confirmInventoryReportAPI(data)
      .then((data) => {
        message.success("보고서확인처리를 했습니다.");
      })
      .catch((error) => {
        message.error(error);
      })
      .finally(() => {
        queryClient.invalidateQueries();
        getInventoryData(inventoryData?.inventory.id);
        setMemo("");
        setLoading(false);
      });
  };

  // 페이징 처리
  const changePage = (page, pageSize) => (clickedPage) => {
    // message.success(clickedPage)
    setPage(clickedPage);
    queryClient.invalidateQueries(["inventories", id, page]);
  };
  // 페이징 처리
  const pagination = {
    total: count,
    onChange: changePage(page, 10),
  };

  // 재고보고서 목록 테이블 컬럼
  const columns = [
    {
      title: "id",
      dataIndex: "id",
      type: "id",
      key: "id",
    },
    {
      title: "마지막 업데이트",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (text, record) => (
        <>{dayjs(text).format("YY.MM.DD (dd) HH:mm")}</>
      ),
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "",
      key: "action",
      type: "right",
      width: "100px",
      render: (text, record) => (
        <Space>
          <Button
            type="primary"
            loading={loading}
            onClick={onClickVeiw(record.id)}
          >
            보기
          </Button>
          <Popconfirm
            placement="leftBottom"
            title="삭제하시겠습니까?"
            onConfirm={onDeleteInventoryReport(record.id)}
            okText="삭제"
            cancelText="취소"
          >
            <Button danger loading={loading}>
              삭제
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 재고보고서 상태 변경
  const handleInputChange = (e, index) => {
    const name = e.target.name;
    const value = e.target.value;
    const list = [...stockInputs];
    list[index][name] = value;
    setStockInputs(list);
  };
  // 드롭다운 <-> 텍스트입력 변경
  const onModifyInput = (name, index, value) => {
    const list = [...stockInputs];
    list[index][name] = value;
    setStockInputs(list);
  };

  return (
    <AppLayout>
      <ContainerBig>
        <Divider>
          <Title level={4}>{inventoryGroup?.name} 재고 보고서</Title>
        </Divider>
        <LeftAndRightDiv>
          <div className="left">
            {dayjs(inventoryData?.inventory.updatedAt).format(
              "YYYY.MM.DD (dd) HH:MM"
            )}
          </div>
          <div className="right">
            <Space wrap>
              <Button
                icon={<CalculatorOutlined style={calcBtnStyle} />}
                onClick={() => {
                  setShowTotalQty(!showTotalQty);
                }}
              ></Button>
              <Link href={`/inventory/update/${inventoryData?.inventory.id}`}>
                <a>
                  <Button type="primary" disabled={!inventoryData}>
                    + 재고조사 보고서 갱신
                  </Button>
                </a>
              </Link>
            </Space>
          </div>
        </LeftAndRightDiv>
        <HGap />
        <InventoryTable>
          <thead>
            <tr>
              <th>품명</th>
              {isMobile ? null : <th>위치</th>}
              {isMobile ? null : <th className="unit">단위</th>}
              {isMobile ? null : <th>요구수량</th>}
              <th>현재수량</th>
              <th className="status">상태</th>
            </tr>
          </thead>
          {types?.map((type, i) => {
            let totalQty = 0;
            return (
              <tbody key={i}>
                <tr className="code">
                  <td colSpan={isMobile ? 3 : 6}>{type}</td>
                </tr>
                {stockInputs?.map((v, j) => {
                  if (v.stockType === type) {
                    totalQty = totalQty + v?.qty;
                    return (
                      <>
                        <tr
                          key={j}
                          style={v.status === "주문필요" ? shortageStyle : null}
                        >
                          <td
                            onClick={() => {
                              if (extendedRow === j) {
                                return setExtendedRow(null);
                              }
                              setExtendedRow(j);
                            }}
                          >
                            <span className="name">{v.stockName}</span>
                          </td>
                          {isMobile ? null : <td>{v?.location}</td>}
                          {isMobile ? null : <td>{v?.unit}</td>}
                          {isMobile ? null : (
                            <td className="qty">{v?.reqQty.toFixed(1)}</td>
                          )}
                          {isMobile ? (
                            <td className="qty">
                              <div>
                                <span>{v?.qty.toFixed(1)}</span>
                                <span className="unitTag">{v?.unit}</span>
                              </div>
                            </td>
                          ) : (
                            <td className="qty">{v?.qty.toFixed(1)}</td>
                          )}
                          <td className="status">
                            {statusArray.indexOf(v.status) === -1 ? (
                              <div className="selectWrap">
                                <input
                                  name="status"
                                  value={v.status}
                                  onChange={(e) => handleInputChange(e, j)}
                                  maxLength={10}
                                  autoComplete="off"
                                  required
                                />
                                <button
                                  onClick={(e) =>
                                    onModifyInput("status", j, "OK")
                                  }
                                >
                                  <MoreOutlined />
                                </button>
                              </div>
                            ) : (
                              <div className="selectWrap">
                                <select
                                  name="status"
                                  value={v.status}
                                  onChange={(e) => handleInputChange(e, j)}
                                >
                                  {statusArray.map((value) => {
                                    return (
                                      <option value={value}>{value}</option>
                                    );
                                  })}
                                </select>
                                <button
                                  onClick={(e) =>
                                    onModifyInput("status", j, "")
                                  }
                                >
                                  <MoreOutlined />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                        {extendedRow === j ? (
                          <tr className="extended">
                            <td colSpan={isMobile ? 3 : 6}>
                              <div className="container">
                                <div>
                                  <span className="tag">설명</span>
                                  <span>{v?.desc}</span>
                                </div>
                                <div>
                                  <span className="tag">메모</span>
                                  <span>{v?.memo}</span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </>
                    );
                  }
                })}
                {showTotalQty ? (
                  <tr className="totalQty">
                    <td colSpan={isMobile ? 3 : 6}>
                      총 현재수량: {totalQty.toFixed(1)}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            );
          })}
        </InventoryTable>
        <HGap />
        <FormBox>
          <span>메모</span>
          <p>{inventoryData?.inventory.memo}</p>
          <Block>
            <Space wrap>
              <input
                onChange={onChangeMemo}
                value={memo}
                maxLength={99}
              ></input>
              <Button type="primary" onClick={onConfirmReport("확인완료")}>
                보고서 확인 완료
              </Button>
              <Button
                type="dashed"
                onClick={onConfirmReport("출고완료")}
                danger
              >
                재고 출고완료
              </Button>
            </Space>
          </Block>
        </FormBox>

        <HGap />
        <HGap />
        <HGap />
        <HGap />
        <Title level={5}>지난 보고서 목록</Title>
        <Table
          size="small"
          columns={columns}
          dataSource={inventoriesData}
          pagination={pagination}
        />
        <HGap />
        <Space wrap>
          <Link href={`/inventory/create-inventory/${id}`}>
            <a>
              <Button type="primary" loading={loading} disabled={!isEmpty}>
                + 빈 보고서 생성
              </Button>
            </a>
          </Link>
          <Link href={`/inventory`}>
            <Button>목록으로 돌아가기</Button>
          </Link>
        </Space>
        <br />
        {/* {JSON.stringify(inventoryData)} */}
      </ContainerBig>
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
  if (!response) { // 로그인 안했으면 홈으로
    return {
      redirect: {
        destination: '/unauth',
        permanent: false,
      },
    };
  }
  const id = context.params?.id as string;
  await queryClient.prefetchQuery(["user"], () => loadMyInfoAPI());
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default InventoryReports;
