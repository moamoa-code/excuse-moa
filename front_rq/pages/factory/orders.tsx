import { InfoCircleTwoTone } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  DatePicker,
  message,
  Popover,
  Radio,
  Space,
  Spin,
  Tag,
} from "antd";
import axios from "axios";
import moment from "moment";
import "moment/locale/ko";
import { GetServerSidePropsContext } from "next";
import React, { useEffect, useMemo, useState } from "react";
import { dehydrate, QueryClient, useQuery } from "react-query";
import styled from "styled-components";
import { loadOrderDetails } from "../../apis/order";
import { loadMyInfoAPI, loadProvidersAPI } from "../../apis/user";
import AppLayout from "../../components/AppLayout";
import ExpandableBox from "../../components/ExpandableBox";
import MyChart from "../../components/MyChart";
import {
  ContainerBig,
  ContainerMax,
  ListBox,
  LoadingModal,
} from "../../components/Styled";

const RoundedBox = styled.div`
  margin-bottom: 20px;
  border: 1px solid #dadada;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.09);
  padding: 25px;
  @media screen and (max-width: 600px) {
    padding: 15px;
  }
`;

const FlexBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 15px;
  div {
    min-width: 220px;
    flex: 1;
    gap: 20px;
  }
`;

const LaBle = styled.div`
  padding: 0 5px 5px 5px;
  font-size: 12pt;
`;

const TaBle = styled.table`
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.09);
  th {
    font-size: 12pt;
    position: sticky;
    top: 0px;
    background-color: #3498db;
    border-left: 3px solid #ffffff;
    color: #ffffff;
  }
  th:first-child {
    border-left: none;
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
    padding: 15px;
  }
  @media screen and (max-width: 600px) {
    th,
    td {
      padding: 8px;
    }
  }
  td {
    border-left: 1px solid #dadada;
  }
  td:first-child {
    border-left: none;
  }
  .codeName {
    font-weight: bold;
  }
  tfoot {
    tr {
      border-bottom: 2px solid #398ab9;
    }
    td {
      font-size: 12pt;
    }
  }
`;

const SimpleInput = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  input {
    height: 38px;
    margin: 0;
    padding-left: 5px;
    box-sizing: border-box;
    border-radius: 4px 0 0 4px;
    border: 1px solid #999999;
  }
  button {
    height: 38px;
    border-radius: 4px;
    border: 1px solid #999999;
    background-color: white;
    color: white;
    border: 0;
    margin: 0;
    border-radius: 0 4px 4px 0;
    background-color: #1890ff;
  }
  button:active {
    position: relative;
    top: 2px;
  }
`;
const TiTle = styled.h1`
  font-size: 14pt;
  font-weight: bold;
`;

// --출하량 분석 페이지--
const OrderAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  // 통계 모드 변경
  const [modeSelector, setModeSelector] = useState("CODE");
  const [mode, setMode] = useState("CODE");
  // 검색할 기간
  const [startDate, setStartDate] = useState(moment().subtract(90, "days"));
  const [endDate, setEndDate] = useState(moment());
  // 원두 코드
  const [codeNameInput, setCodeNameInput] = useState("");
  const [codeNames, setCodeNames] = useState([]);
  // 포장상태
  const [orderDetailStatOpt, setOrderDetailStatOpt] = useState(["포장완료"]);
  // 판매사
  const [providerIdList, setProviderIdList] = useState([]);
  // 데이터
  const [datasByCode, setDatasByCode] = useState([]); // 제품코드 기준으로 카테고리화
  const [datasByProvider, setDatasByProvider] = useState([]);
  const [totalWeight, setTotalWeight] = useState(0.0); // 검색결과 총 중량
  const [totalSales, setTotalSales] = useState(0); // 검색결과 총 중량
  // 정렬 모드
  const [sortMode, setSortMode] = useState("WEIGHT");
  // 금액 표시
  const [salesShowCheckBox, setSalseShowCheckBox] = useState<boolean>(false);
  const [averageShowCheckBox, setAverageShowCheckBox] =
    useState<boolean>(false);
  const [isWithSales, setIsWithSales] = useState<boolean>(false);
  const [isWithAverage, setIsWithAverage] = useState<boolean>(false);
  // 차트용 데이터
  const [chartDatas, setChartDatas] = useState([]);
  const [chartKeys, setChartKeys] = useState([]);
  const [chartDateUnitSelector, setChartDateUnitSelector] = useState("months");
  // css useMemo
  const graphContainerWideStyle = useMemo(
    () => ({ height: "680px, maxWidth: 1920px" }),
    []
  ); // 그래프 컨테이너 큰거
  const graphContainerStyle = useMemo(
    () => ({ margin: "0 auto", height: "680px", maxWidth: "1440px" }),
    []
  ); // 그래프 컨테이너 작은거

  // 주문 상세 불러오기 API
  const {
    isLoading: loading,
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
        codeNames: codeNames,
        itemStatus: orderDetailStatOpt,
        providerIdList,
      };
      return loadOrderDetails(data);
    },
    {
      onSuccess: (data) => {
        if (modeSelector === "CODE") {
          const codes = data
            .reverse()
            .map((v) => v.itemCodeName.toUpperCase().trim());
          // const newArr = [...new Set(codes.flat(2))]
          const newArr = Array.from(new Set(codes.flat(2))); // 코드네임 중복제거
          let objArr = newArr.map((v) => ({ name: v, weight: 0, sales: 0 }));
          objArr.map((codeName, i) => {
            let weight = 0.0;
            let sales = 0;
            data.map((v) => {
              if (v.itemCodeName === codeName.name) {
                const itemWeight = getWeight(v.itemUnit, v.qty);
                weight = weight + Number(itemWeight);
                if (v.itemSupplyPrice) {
                  sales = sales + Number(v.itemSupplyPrice);
                }
              }
            });
            objArr[i].weight = weight;
            objArr[i].sales = sales;
          });
          if (sortMode === "WEIGHT") {
            objArr = objArr.sort((a, b) => b.weight - a.weight);
          } else if (sortMode === "SALES") {
            objArr = objArr.sort((a, b) => b.sales - a.sales);
          } else if (sortMode === "CODE") {
            objArr = objArr.sort((a, b) => {
              let x = String(a.name).toLowerCase();
              let y = String(b.name).toLowerCase();
              if (x < y) {
                return -1;
              }
              if (x > y) {
                return 1;
              }
              return 0;
            });
          }
          setIsWithSales(salesShowCheckBox);
          setIsWithAverage(averageShowCheckBox);
          setDatasByCode(objArr);
          setMode(modeSelector);
          getTotalWeight(data);
          getChartDatas(data, chartDateUnitSelector);
        }
        if (modeSelector === "PROVIDER") {
          let providers = [];
          data.forEach((v) => {
            if (v.Order.Provider) {
              providers.push(v.Order.Provider?.id);
            }
          });
          const proArr = Array.from(new Set(providers.flat(2)));
          let providerNewArr = proArr.map((id) => ({
            providerId: id,
            company: "",
            totalWeight: 0,
            totalSales: 0,
            datas: [],
          }));
          providerNewArr.map((pro, i) => {
            let datasOfProvider = [];
            let tWeight = 0.0;
            let tSales = 0;
            data.map((v) => {
              if (v.Order.Provider) {
                if (v.Order.Provider?.id === pro.providerId) {
                  datasOfProvider.push(v);
                } else if (
                  v.Order?.Provider === null &&
                  pro.providerId === null
                ) {
                  datasOfProvider.push(v);
                }
              }
            });
            const codes = datasOfProvider.map((v) =>
              v.itemCodeName.toUpperCase().trim()
            );
            // const newArr = [...new Set(codes.flat(2))]
            const newArr = Array.from(new Set(codes.flat(2))); // 코드네임 중복제거
            let objArr = newArr.map((v) => ({ name: v, weight: 0, sales: 0 }));
            objArr.map((codeName, j) => {
              let weight = 0.0;
              let sales = 0;
              datasOfProvider.map((v) => {
                if (v.itemCodeName === codeName.name) {
                  const itemWeight = getWeight(v.itemUnit, v.qty);
                  weight = weight + Number(itemWeight);
                  if (v.itemSupplyPrice) {
                    sales = sales + Number(v.itemSupplyPrice);
                  }
                }
              });
              objArr[j].weight = weight;
              objArr[j].sales = sales;
            });
            objArr.map((v) => {
              let weight = v.weight;
              let sales = v.sales;
              tSales = tSales + sales;
              tWeight = tWeight + weight;
            });
            if (sortMode === "WEIGHT") {
              objArr = objArr.sort((a, b) => b.weight - a.weight);
            } else if (sortMode === "SALES") {
              objArr = objArr.sort((a, b) => b.sales - a.sales);
            } else if (sortMode === "CODE") {
              objArr = objArr.sort((a, b) => {
                let x = String(a.name).toLowerCase();
                let y = String(b.name).toLowerCase();
                if (x < y) {
                  return -1;
                }
                if (x > y) {
                  return 1;
                }
                return 0;
              });
            }
            providerNewArr[i].totalSales = tSales;
            providerNewArr[i].totalWeight = tWeight;
            let obj = data.find(
              (x) => x.Order?.Provider?.id === pro.providerId
            );
            if (obj.Order.Provider !== null) {
              providerNewArr[i].company = obj.Order?.Provider.company;
            }
            providerNewArr[i].datas = objArr;
          });
          if (sortMode === "WEIGHT") {
            providerNewArr = providerNewArr.sort(
              (a, b) => b.totalWeight - a.totalWeight
            );
          } else if (sortMode === "SALES") {
            providerNewArr = providerNewArr.sort(
              (a, b) => b.totalSales - a.totalSales
            );
          }
          setIsWithSales(salesShowCheckBox);
          setIsWithAverage(averageShowCheckBox);
          getTotalWeight(data);
          setDatasByProvider(providerNewArr);
          setMode(modeSelector);
        }
      },
    }
  );

  // nivo 차트용 데이터 만들기
  const getChartDatas = (data, chartDateUnit) => {
    setIsLoading(true);
    const codes = data
      .reverse()
      .map((v) => v.itemCodeName.toUpperCase().trim());
    // const newArr = [...new Set(codes.flat(2))]
    const codeNameArray = Array.from(new Set(codes.flat(2))); // 코드네임 중복제거
    setChartKeys(codeNameArray);
    let start = startDate.clone();
    let end = endDate.clone();
    let dateIndex = [];
    let howMany =
      Number(end.diff(start, chartDateUnit === "months" ? "months" : "weeks")) +
      1;
    for (let i = 0; i < howMany; i++) {
      dateIndex = [
        ...dateIndex,
        start.format(chartDateUnit === "months" ? "YY-MM" : "gg-wo"),
      ];
      start.add(1, chartDateUnit === "months" ? "months" : "weeks");
    }
    let output = [];
    dateIndex.forEach((date, i) => {
      let obj = { date: date, datas: [] };
      data.map((v, j) => {
        let thisDate = moment(v?.createdAt).format(
          chartDateUnit === "months" ? "YY-MM" : "gg-wo"
        );
        if (thisDate === date) {
          obj.datas.push(v);
        }
      });
      output.push(obj);
    });
    setChartDatas(output);
    type MyObjType = {
      [key: string]: string | number;
      date: string;
    };
    let ouput2 = [];
    output.forEach((v) => {
      let obj: MyObjType = { date: v.date };
      codeNameArray.forEach((code) => {
        let codeWeight = 0.0;
        v.datas.forEach((o) => {
          if (code === o.itemCodeName) {
            const itemWeight = getWeight(o.itemUnit, o.qty);
            codeWeight = codeWeight + Number(itemWeight);
          }
        });
        obj[String(code)] = codeWeight;
      });
      ouput2 = [...ouput2, obj];
    });
    setChartDatas(ouput2);
    setIsLoading(false);
  };

  useEffect(() => {
    getProviders();
  }, []);
  // 판매자 목록 불러오기
  const getProviders = () => {
    loadProvidersAPI()
      .then((data) => {
        setProviders(data);
      })
      .catch((error) => {
        message.error(error.response.data);
      });
  };

  // 검색 날짜 조절
  const onChangeStartDate = (date, dateString) => {
    setStartDate(date);
  };
  const onChangeEndtDate = (date, dateString) => {
    setEndDate(date);
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
    return weight;
  };

  // 전체 중량 계산
  const getTotalWeight = (datas) => {
    let totalWeight = 0.0;
    let totalSales = 0;
    datas.map((v) => {
      let weight = Number(getWeight(v.itemUnit, v.qty));
      let sales = 0;
      if (v.itemSupplyPrice) {
        sales = Number(v.itemSupplyPrice);
      }
      totalSales = totalSales + sales;
      totalWeight = totalWeight + weight;
    });
    setTotalSales(totalSales);
    setTotalWeight(totalWeight);
  };

  // 주문 목록 필터 버튼
  const onLoadTodos = () => {
    if (!startDate || !endDate) {
      message.error("날짜를 선택해 주세요.", 0.5);
      return;
    }
    refetch();
  };

  // 검색할 판매자 목록 변경
  const onProviderSelect = (id) => () => {
    let array = providerIdList;
    if (providerIdList.indexOf(id) !== -1) {
      let newArray = array.filter((v) => v !== id);
      return setProviderIdList(newArray);
    }
    array = [...array, id];
    setProviderIdList(array);
  };

  const onChangeCodeNameInput = (e) => {
    setCodeNameInput(e.target.value.toUpperCase());
  };

  // 검색할 원두코드 목록 변경
  const onCodeNameInput = () => {
    if (codeNameInput.length < 1) {
      return;
    }
    let array = codeNames;
    array = [...array, codeNameInput.trim()];
    setCodeNames(array);
    setCodeNameInput("");
  };

  const onCodeNameInputKeyPress = (e) => {
    if (e.key === "Enter") {
      onCodeNameInput();
    }
  };

  // 모드 변경
  const handleModeChange = (e) => {
    setModeSelector(e.target.value);
  };
  // 정렬 기준 변경
  const handleSortChange = (e) => {
    setSortMode(e.target.value);
  };
  // 그래프 기간 단위 변경
  const handleDateUnitChange = (e) => {
    setChartDateUnitSelector(e.target.value);
    getChartDatas(orders, e.target.value);
  };

  return (
    <AppLayout>
      <ContainerMax>
        <ContainerBig>
          {isLoading === true || loading === true ? (
            <LoadingModal>
              <Spin /> 로딩중
            </LoadingModal>
          ) : null}
          <TiTle>
            출하량 분석&nbsp;
            <Popover
              placement="bottom"
              content={() => <span>주문요청일, 출하 완료 기준</span>}
            >
              <InfoCircleTwoTone />
            </Popover>
          </TiTle>
          <RoundedBox>
            <div>
              <LaBle>분석 모드</LaBle>
              <Radio.Group onChange={handleModeChange} defaultValue="CODE">
                <Radio.Button value="CODE">원두 코드별</Radio.Button>
                <Radio.Button value="PROVIDER">판매사별</Radio.Button>
              </Radio.Group>
            </div>
            <br />
            <div>
              <LaBle>조회 기간</LaBle>
              <Space wrap>
                <div>
                  <span>시작:&nbsp;</span>
                  <DatePicker
                    onChange={onChangeStartDate}
                    // locale={locale_kr}
                    defaultValue={startDate}
                  />
                </div>
                <div>
                  <span>종료:&nbsp;</span>
                  <DatePicker
                    onChange={onChangeEndtDate}
                    // locale={locale_kr}
                    defaultValue={endDate}
                  />
                </div>
                <div>&nbsp;총 {endDate?.diff(startDate, "days")}일</div>
              </Space>
            </div>
            <br />
            <div>
              <ExpandableBox title="판매사 선택" tags={providerIdList}>
                <ListBox>
                  <Space wrap>
                    {providers?.map((v) => {
                      if (providerIdList.includes(v.id)) {
                        return (
                          <Button
                            size="small"
                            type="primary"
                            onClick={onProviderSelect(v.id)}
                          >
                            {v.company}
                          </Button>
                        );
                      } else
                        return (
                          <Button
                            size="small"
                            type="dashed"
                            onClick={onProviderSelect(v.id)}
                          >
                            {v.company}
                          </Button>
                        );
                    })}
                  </Space>
                </ListBox>
              </ExpandableBox>
            </div>
            <br />
            <div>
              <ExpandableBox title="원두코드 선택" tags={codeNames}>
                <div>
                  <SimpleInput>
                    <input
                      onChange={onChangeCodeNameInput}
                      value={codeNameInput}
                      maxLength={13}
                      onKeyPress={onCodeNameInputKeyPress}
                    />
                    <button onClick={onCodeNameInput}>추가</button>
                  </SimpleInput>
                  <Space wrap>
                    {codeNames.map((v) => {
                      return (
                        <Tag
                          closable
                          onClose={(e) => {
                            e.preventDefault();
                            let array = codeNames;
                            let newArray = array.filter((i) => v !== i);
                            setCodeNames(newArray);
                          }}
                        >
                          {v}
                        </Tag>
                      );
                    })}
                  </Space>
                </div>
              </ExpandableBox>
            </div>
            <br />
            <FlexBox>
              <div>
                <LaBle>표시</LaBle>
                <Checkbox
                  checked={salesShowCheckBox}
                  onChange={(e) => {
                    setSalseShowCheckBox(e.target.checked);
                  }}
                >
                  {" "}
                  금액
                </Checkbox>
                <Checkbox
                  checked={averageShowCheckBox}
                  onChange={(e) => {
                    setAverageShowCheckBox(e.target.checked);
                  }}
                >
                  일 평균
                </Checkbox>
              </div>
              <div>
                <LaBle>정렬</LaBle>
                <Radio.Group onChange={handleSortChange} defaultValue="CODE">
                  <Radio.Button value="WEIGHT">중량</Radio.Button>
                  <Radio.Button value="SALES">금액</Radio.Button>
                  <Radio.Button value="CODE">코드</Radio.Button>
                </Radio.Group>
              </div>
            </FlexBox>

            <br />
            <Button type="primary" loading={isLoading} onClick={onLoadTodos}>
              적용
            </Button>
          </RoundedBox>
          {mode === "CODE" ? (
            <div>
              <TaBle>
                <thead>
                  <tr>
                    <th>원두 코드</th>
                    <th>총 중량 (kg)</th>
                    {isWithSales ? <th>총 금액 (원)</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {datasByCode.map((code, i) => {
                    return (
                      <tr key={i}>
                        <td className="codeName">{code.name}</td>
                        <td>
                          {code.weight.toFixed(1)}
                          {isWithAverage ? (
                            <>
                              &nbsp;
                              <Tag>
                                {(
                                  code?.weight / endDate.diff(startDate, "days")
                                ).toFixed(2)}
                                kg/일
                              </Tag>
                            </>
                          ) : null}
                        </td>
                        {isWithSales ? (
                          <td>
                            {code.sales
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? ""}
                            {isWithAverage ? (
                              <>
                                &nbsp;
                                <Tag>
                                  {(
                                    code?.sales /
                                    endDate.diff(startDate, "days")
                                  )
                                    .toFixed(2)
                                    .toString()
                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",") ??
                                    ""}
                                  원/일
                                </Tag>
                              </>
                            ) : null}
                          </td>
                        ) : null}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td>합계</td>
                    <td>
                      {totalWeight.toFixed(1)} kg
                      {isWithAverage ? (
                        <>
                          &nbsp;
                          <Tag>
                            {(
                              totalWeight / endDate.diff(startDate, "days")
                            ).toFixed(2)}
                            kg/일
                          </Tag>
                        </>
                      ) : null}
                    </td>
                    {isWithSales ? (
                      <td>
                        {totalSales
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? ""}{" "}
                        원
                        {isWithAverage ? (
                          <>
                            &nbsp;
                            <Tag>
                              {(totalSales / endDate.diff(startDate, "days"))
                                .toFixed(2)
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? ""}
                              원/일
                            </Tag>
                          </>
                        ) : null}
                      </td>
                    ) : null}
                  </tr>
                </tfoot>
              </TaBle>
              <br />
              <br />
              <br />
            </div>
          ) : mode === "PROVIDER" ? (
            <>
              {datasByProvider.map((pro, i) => {
                return (
                  <div>
                    <TiTle>{pro?.company}</TiTle>
                    <TaBle>
                      <thead>
                        <tr key={i}>
                          <th>원두 코드</th>
                          <th>총 중량 (kg)</th>
                          {isWithSales ? <th>총 금액 (원)</th> : null}
                        </tr>
                      </thead>
                      <tbody>
                        {pro?.datas.map((data, j) => {
                          return (
                            <tr key={j}>
                              <td>{data?.name}</td>
                              <td>
                                {data?.weight.toFixed(1)}
                                {isWithAverage ? (
                                  <>
                                    &nbsp;
                                    <Tag>
                                      {(
                                        data?.weight /
                                        endDate.diff(startDate, "days")
                                      ).toFixed(2)}
                                      kg/일
                                    </Tag>
                                  </>
                                ) : null}
                              </td>
                              {isWithSales ? (
                                <td>
                                  {data?.sales
                                    .toString()
                                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",") ??
                                    ""}
                                  {isWithAverage ? (
                                    <>
                                      &nbsp;
                                      <Tag>
                                        {(
                                          data?.sales /
                                          endDate.diff(startDate, "days")
                                        )
                                          .toFixed(2)
                                          .toString()
                                          .replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            ","
                                          ) ?? ""}
                                        원/일
                                      </Tag>
                                    </>
                                  ) : null}
                                </td>
                              ) : null}
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td>합계</td>
                          <td>
                            {pro.totalWeight.toFixed(1)} kg
                            {isWithAverage ? (
                              <>
                                &nbsp;
                                <Tag>
                                  {(
                                    pro?.totalWeight /
                                    endDate.diff(startDate, "days")
                                  ).toFixed(2)}
                                  kg/일
                                </Tag>
                              </>
                            ) : null}
                          </td>
                          {isWithSales ? (
                            <td>
                              {pro.totalSales
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",") ??
                                ""}{" "}
                              원
                              {isWithAverage ? (
                                <>
                                  &nbsp;
                                  <Tag>
                                    {(
                                      pro?.totalSales /
                                      endDate.diff(startDate, "days")
                                    )
                                      .toFixed(2)
                                      .toString()
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",") ??
                                      ""}
                                    원/일
                                  </Tag>
                                </>
                              ) : null}
                            </td>
                          ) : null}
                        </tr>
                      </tfoot>
                    </TaBle>
                    <br />
                    <br />
                  </div>
                );
              })}
              <TiTle>
                총{totalWeight.toFixed(1)} kg
                {isWithAverage ? (
                  <>
                    &nbsp;
                    <Tag>
                      {(totalWeight / endDate.diff(startDate, "days")).toFixed(
                        2
                      )}
                      kg/일
                    </Tag>
                  </>
                ) : null}
                &nbsp;
                {isWithSales ? (
                  <span>
                    {totalSales
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? ""}{" "}
                    원
                    {isWithAverage ? (
                      <>
                        &nbsp;
                        <Tag>
                          {(totalSales / endDate.diff(startDate, "days"))
                            .toFixed(2)
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",") ?? ""}
                          원/일
                        </Tag>
                      </>
                    ) : null}
                  </span>
                ) : null}
              </TiTle>
            </>
          ) : null}
        </ContainerBig>
        {mode === "CODE" ? (
          <>
            <ContainerBig>
              <TiTle>
                기간별 출하량 그래프&nbsp;
                <Popover
                  placement="bottom"
                  content={() => (
                    <span>
                      조회기간시작을 해당 월 1일, 종료를 말일로 설정하세요.
                    </span>
                  )}
                >
                  <InfoCircleTwoTone />
                </Popover>
              </TiTle>
              <RoundedBox>
                <div>
                  <LaBle>기간 단위</LaBle>
                  <Radio.Group
                    onChange={handleDateUnitChange}
                    defaultValue="months"
                  >
                    <Radio.Button value="weeks">주별</Radio.Button>
                    <Radio.Button value="months">월별</Radio.Button>
                  </Radio.Group>
                </div>
              </RoundedBox>
            </ContainerBig>
            <br />
            <div
              style={
                chartDateUnitSelector === "weeks"
                  ? graphContainerWideStyle
                  : graphContainerStyle
              }
            >
              <MyChart data={chartDatas} keys={chartKeys} indexBy={"date"} />
            </div>
          </>
        ) : null}
      </ContainerMax>
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

export default OrderAnalysis;
