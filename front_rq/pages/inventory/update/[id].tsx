import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Form, Input, Button, Tag, Checkbox, Divider, Space, notification, Card, Image, Typography, Popconfirm, Select, message, Spin, Table, Modal } from 'antd';
import { useRouter } from 'next/router';
import Router from 'next/router';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { loadMyInfoAPI } from '../../../apis/user';
import AppLayout from '../../../components/AppLayout';
import User from '../../../interfaces/user';
import { createInventoryAPI, getInventoriesAPI, getInventoryDataAPI, getInventoryGroupAPI } from '../../../apis/inventory';
import dayjs from 'dayjs';
import { Block, ContainerBig, ContainerWide, FormBox, HGap, InventoryTable, StockViewModal } from '../../../components/Styled';
import styled from 'styled-components';
import useInput from '../../../hooks/useInput';
import UserInfoBox from '../../../components/UserInfoBox';
import StockList from '../../../components/StockList';
import { MinusOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { useMediaQuery } from 'react-responsive';

const UpdateInventory = () => {
  // CSS SSR 안되는 문제 땜빵
  const StockBox = styled.div` 
  display: flex;
  flex-direction: column;
  gap: 11px;
  h1 {
    margin-top: 12px;
    font-size: 14pt;
    padding: 5px;
    font-weight: bold;
    span {
      background-color: #2db7f5;
    }
    border-bottom: 1px solid #e4e4e4;
  }
  .container{
    padding: 14px;
    border: 1px solid #e4e4e4;
    border-radius: 12px;
    box-shadow: 0px 9px 10px -4px rgba(0,0,0,0.07);
  }
  .top {
    display: flex;
    padding-bottom: 5px;
    border-bottom: 1px solid #e4e4e4;
    .title {
      font-size: 12pt;
      color:#1890ff;
    }
    .action {
      margin-left:auto;
      .qtyInputBox {
        align-items: center;
        vertical-align: center;
        display: inline-block;
        justify-content: space-between;
        margin: 0px;
        button {
          border: none;
          background: none;
        }
        input {
          margin:0px;
          text-align:center;
          font-size: 14pt;
          width:45px;
          border:none;
        }
        button:active {
          position: relative; 
          top:2px;
        }
      }
    }
  }
  .bottom {
    margin-top: 10px;
    display: flex;
    gap: 10px;
    font-size: 11pt;
    flex-wrap: wrap;
    .memo {
      flex-basis: 100%;
      input {
        max-width: 100%;
      }
    }
    .lable {
      margin-right: 5px;
    }
    input, select {
      flex: 1;
      max-width: 90px;
      padding: 4px 0px 4px 0px;
      border-radius: 4px;
      border: 1px solid #398AB9;
    }
    .selectWrap {
      .number {
        text-align: center;
        width: 50px;
        font-weight: bold;
      }
      align-items: center;
      display: flex;
      button {
        align-self: stretch;
        background: white;
        padding: 0 3px 0 3px;
        border-radius: 4px;
        border: 1px solid #398AB9;
      }
    }
  }
  `
  const router = useRouter();
  const { id } = router.query; // 보고서 id
  const [ isInitialized, setIsInitialized ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const { data: myUserInfo } = useQuery<User>('me', loadMyInfoAPI);
  const { data: inventoryData } = useQuery(['inventoryData', id], () => getInventoryDataAPI(Number(id)));
  const [ inventoryGroup, setInventoryGroup ] = useState(null)
  const [ types, setTypes ] = useState([]); // 재고품목 카테고리ㄴㅁ
  const { Title } = Typography;
  const [ memo, onChangeMemo, setMemo ] = useInput('');
  const emptyStock = {
    stockId: null, stockName: '', stockType: '', reqQty: 0.0, unit: '개', qty: 0.0, location: 'A', status: 'OK', memo: ''
  }
  const [ stockInputs, setStockInputs ] = useState([]);
  const [ isStockModalVisible, setIsStockModalVisible ] = useState(false);
  const [ isViewModalVisible, setIsViewModalVisible ] = useState(false);
  const [ selectedStockIndex, setSelectedStockIndex ] = useState(null);
  const minusButtonStyle = useMemo(() => ({fontSize:'14pt', color:'#ff4d4f'}), []);
  const plusButtonStyle = useMemo(() => ({fontSize:'14pt', color:'#1890ff'}), []);
  const unitArray = ['개', '묶음', '박스', 'kg', 'l'];
  const statusArray = ['OK', '부족', '주문완료', '주문필요', '불요', '보류'];
  const locArray = ['A', 'B', 'C', 'D'];
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:740px)",
  });
  
  const onSubmit = (e) => {
    if (!myUserInfo || !id ) {
      return message.error('로그인 정보가 없습니다.');
    }
    if (stockInputs.length < 1) {
      return message.error('데이터를 입력해주세요.');
    }
    if (!inventoryGroup) {
      return message.error('재고 보고서 그룹 정보가 없습니다.');
    }
    let error = false;

    for (let i = 0; i < stockInputs?.length; i++) {
      if (stockInputs[i].stockId === null) {
        error = true;
        return message.error('재고품 입력이 잘못됐습니다. 새로고침 해주세요.');
      } 
      if (stockInputs[i].unit === '') {
        error = true;
        return message.error(`'${stockInputs[i].stockName}'의 단위를 입력해 주세요.`);
      }
    }
    if (!error) {
      setLoading(true);
      const datas = {
        UserId: myUserInfo.id,
        GroupId: inventoryGroup.id,
        datas: stockInputs,
        memo,
      }
      createInventoryAPI(datas)
      .then((result) => {
        message.success('재고 보고서를 새로운 날짜로 저장했습니다.');
        router.replace(`/inventory/report/${inventoryGroup?.id}`);
      })
      .catch((error) => {
        message.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
    }
  }

  const refreshTypes = (data) => {
    const typeRaw = data.map((v) => {
      return v.stockType;
    })
    const pureType = typeRaw.filter((v, i) => { // 중복제거
      return typeRaw.indexOf(v) === i;
    })
    setTypes(pureType);
  }

  const selectStock = (stockData) => {
    setLoading(true);
    let stock = emptyStock;
    stock.stockId = stockData.id;
    stock.stockName = stockData.name;
    stock.stockType = stockData.type;
    setIsStockModalVisible(false);
    if(stockInputs?.length < 1) {
      setStockInputs([stock]);
    }
    else {
      setStockInputs([...stockInputs, stock]);
      refreshTypes([...stockInputs, stock]);
    }
    setLoading(false);
    return stockData;
  }

  const handleModalClose = () => {
    setIsStockModalVisible(false);
  }

  const onAddField = () => {
    setIsStockModalVisible(true);
  }

  const onRemoveField = (index) => () => {
    const list = [...stockInputs];
    list.splice(index, 1);
    setStockInputs(list);
    refreshTypes(list);
    setIsViewModalVisible(false);
  }

  const onModifyInput = (name, index, value) => {
    const list = [...stockInputs];
    list[index][name] = value;
    setStockInputs(list);
  }

  const handleInputChange = (e, index) => {
    // const { name, value } = e.target;
    const name = e.target.name;
    const value = e.target.value;
    const list = [...stockInputs];
    list[index][name] = value;
    setStockInputs(list);
  }

  const minusQty = (index) => {
    let value = Number(stockInputs[index]?.qty) - 1.0;
    if (value < 0) {
      return;
    }
    const list = [...stockInputs];
    list[index].qty = value;
    setStockInputs(list);
  }

  const plusQty = (index) => {
    let value = Number(stockInputs[index]?.qty) + 1.0;
    if (value > 9999) {
      return;
    }
    const list = [...stockInputs];
    list[index].qty = value;
    setStockInputs(list);
  }

  const refineInventoryData = (data) => {
      const typeRaw = data.datas?.map((v) => {
        return v.Stock.type
      })
      const pureType = typeRaw.filter((v, i) => { // 중복제거
        return typeRaw.indexOf(v) === i;
      })
      const stocks = data.datas?.map((v, i) => {
        const stock = {
          stockId: v.Stock.id, 
          stockName: v.Stock.name, 
          stockType: v.Stock.type, 
          reqQty: v.reqQty, 
          unit: v.unit, 
          qty: v.qty, 
          location: v?.location, 
          status: v?.status, 
          memo: v.memo,
        }
        return stock;
      })
      setTypes(pureType);
      setStockInputs(stocks);
  }

  const getInventoryGroupData = (id) => {
    setLoading(true);
    getInventoryGroupAPI(id)
    .then((res) => {
      setInventoryGroup(res)
    })
    .catch((error) => {
      message.error(JSON.stringify(error));
    })
    .finally(()=>{
      setLoading(false);
    })
  }

  const columns2 = [
    {
      title: '품목',
      dataIndex: 'stockName',
      type: 'title',
      key: 'stockName',
    }, {
      title: '위치',
      dataIndex: 'location',
      type: 'inputs',
      key: 'location',
      render: (text, record) => (
      <>
        {JSON.stringify(record)}
        {locArray.indexOf(text) === -1?
          <div className='selectWrap'>
            <span>위치: </span>
            <input 
              name="location"
              value={text}
              onChange={(e) => (handleInputChange(e, selectedStockIndex))}
              maxLength={10}
              autoComplete="off"
              required
            />
            <button onClick={(e) => (onModifyInput('location', selectedStockIndex, 'A'))}><MoreOutlined /></button>
          </div>
          :
          <div className='selectWrap'>
            <span>위치: </span>
            <select name='location' value={stockInputs[selectedStockIndex].location} onChange={(e) => (handleInputChange(e, selectedStockIndex))}>
              {locArray.map((value) => {
                return <option value={value}>{value}</option>
              })}
            </select>
            <button onClick={(e) => (onModifyInput('location', selectedStockIndex, ''))}><MoreOutlined /></button>
          </div>
        }
      </>
      )
    },{
      title: '위치',
      dataIndex: 'location',
      type: 'inputs',
      key: 'location',
      render: (text, record) => (
        <input 
        name="location"
        required
      />
      )
    },{
      title: '위치',
      dataIndex: 'location',
      type: 'inputs',
      key: 'location',
      render: (text, record) => (
        <input 
        name="location"
        required
      />
      )
    },{
      title: '위치',
      dataIndex: 'location',
      type: 'inputs',
      key: 'location',
      render: (text, record) => (
        <input 
        name="location"
        required
      />
      )
    },{
      title: '위치',
      dataIndex: 'location',
      type: 'inputs',
      key: 'location',
      render: (text, record) => (
        <input 
        name="location"
        required
      />
      )
    },{
      title: '위치',
      dataIndex: 'location',
      type: 'inputs',
      key: 'location',
      render: (text, record) => (
        <input 
        name="location"
        required
      />
      )
    },
  ];

  useEffect(
    () => { 
      if (inventoryData && !isInitialized){
        getInventoryGroupData(inventoryData?.inventory.InventoryGroupId);
        refineInventoryData(inventoryData);
        setIsInitialized(true);
      } else {

      }
  }, [inventoryData])

  return (
    <AppLayout>
      <ContainerWide>
        <Modal
          visible={isStockModalVisible}
          onCancel={handleModalClose}
          width={680}
          footer={[
            <Button onClick={handleModalClose}>
              닫기
            </Button>,
          ]}
        >
          <StockList user={myUserInfo} selectStock={selectStock} /><br />
        </Modal>
        <Modal
          visible={isViewModalVisible}
          onCancel={() => {setIsViewModalVisible(false)}}
          width={680}
          footer={[
            <Button onClick={() => setIsViewModalVisible(false)}>
              닫기
            </Button>,
          ]}
        >
          <div>
            {stockInputs[selectedStockIndex] !== undefined && stockInputs[selectedStockIndex] !== null?
              <StockViewModal>
                <h1>{stockInputs[selectedStockIndex].stockName}</h1>
                <div>
                  {locArray.indexOf(stockInputs[selectedStockIndex].location) === -1?
                  <div className='selectWrap'>
                    <span>위치: </span>
                    <input 
                      name="location"
                      value={stockInputs[selectedStockIndex].location}
                      onChange={(e) => (handleInputChange(e, selectedStockIndex))}
                      maxLength={10}
                      autoComplete="off"
                      required
                    />
                    <button onClick={(e) => (onModifyInput('location', selectedStockIndex, 'A'))}><MoreOutlined /></button>
                  </div>
                  :
                  <div className='selectWrap'>
                    <span>위치: </span>
                    <select name='location' value={stockInputs[selectedStockIndex].location} onChange={(e) => (handleInputChange(e, selectedStockIndex))}>
                      {locArray.map((value, key) => {
                        return <option key={key} value={value}>{value}</option>
                      })}
                    </select>
                    <button onClick={(e) => (onModifyInput('location', selectedStockIndex, ''))}><MoreOutlined /></button>
                  </div>
                  }
                </div>
                <div>
                  {unitArray.indexOf(stockInputs[selectedStockIndex].unit) === -1?
                  <div className='selectWrap'>
                    <span>단위: </span>
                    <input 
                      name="unit"
                      value={stockInputs[selectedStockIndex].unit}
                      onChange={(e) => (handleInputChange(e, selectedStockIndex))}
                      maxLength={10}
                      autoComplete="off"
                      required
                    />
                    <button onClick={(e) => (onModifyInput('unit', selectedStockIndex, '개'))}><MoreOutlined /></button>
                  </div>
                  :
                  <div className='selectWrap'>
                    <span>단위: </span>
                    <select name='unit' value={stockInputs[selectedStockIndex].unit} onChange={(e) => (handleInputChange(e, selectedStockIndex))}>
                      {unitArray.map((value, key) => {
                        return <option key={key} value={value}>{value}</option>
                      })}
                    </select>
                    <button onClick={(e) => (onModifyInput('unit', selectedStockIndex, ''))}><MoreOutlined /></button>
                  </div>
                  }
                </div>
                <div className='numberInput'>
                  <span>요구수량: </span>
                  <input 
                    name="reqQty"
                    value={stockInputs[selectedStockIndex].reqQty}
                    type="number"
                    onChange={(e) => (handleInputChange(e, selectedStockIndex))}
                    maxLength={15}
                    autoComplete="off"
                    required
                  />
                </div>
                <div className='numberInput'>
                  <span>현재수량: </span>
                  <input 
                    name="qty"
                    type='number'
                    min={1}
                    max={9999}
                    value={stockInputs[selectedStockIndex]?.qty} 
                    onChange={(e) => (handleInputChange(e, selectedStockIndex))}
                    autoComplete="off"
                    required
                    />
                </div>
                <div>
                  {statusArray.indexOf(stockInputs[selectedStockIndex].status) === -1?
                  <div className='selectWrap'>
                    <span>상태: </span>
                    <input 
                      name="status"
                      value={stockInputs[selectedStockIndex].status}
                      onChange={(e) => (handleInputChange(e, selectedStockIndex))}
                      maxLength={10}
                      autoComplete="off"
                      required
                    />
                    <button onClick={(e) => (onModifyInput('status', selectedStockIndex, 'OK'))}><MoreOutlined /></button>
                  </div>
                  :
                  <div className='selectWrap'>
                    <span>상태: </span>
                    <select name='status' value={stockInputs[selectedStockIndex].status} onChange={(e) => (handleInputChange(e, selectedStockIndex))}>
                      {statusArray.map((value) => {
                        return <option value={value}>{value}</option>
                      })}
                    </select>
                    <button onClick={(e) => (onModifyInput('status', selectedStockIndex, ''))}><MoreOutlined /></button>
                  </div>
                  }
                </div>
                <div>
                  <span>메모: </span>
                  <input 
                    name="memo"
                    value={stockInputs[selectedStockIndex].memo}
                    onChange={(e) => (handleInputChange(e, selectedStockIndex))}
                    maxLength={50}
                    autoComplete="off"
                  />
                <div className='qtyInputBox'>
                  <button
                      onClick={(e) => minusQty(selectedStockIndex)}
                    >
                      <MinusOutlined style={minusButtonStyle} />
                  </button>
                  <button 
                      name="qty"
                      onClick={(e) => plusQty(selectedStockIndex)}
                    >
                      <PlusOutlined style={plusButtonStyle}/>
                  </button>
                </div>
                </div>
                <Popconfirm
                title="삭제하시겠습니까?"
                onConfirm={onRemoveField(selectedStockIndex)}
                okText="삭제"
                cancelText="취소"
              >
                <Button danger loading={loading}>제거</Button>
              </Popconfirm>
              </StockViewModal>
            :<>데이터가 정상적으로 로드되지 않았습니다.</>}
          </div>
        </Modal>

        <Divider><Title level={4}>{inventoryGroup?.name} 재고 보고서 갱신</Title></Divider>
        <HGap />
        <UserInfoBox userInfo={myUserInfo} /><HGap /><HGap />
        <FormBox>
          <Block>
            <label>이름</label>
            <input
              value={inventoryGroup?.name}
              disabled
            />
          </Block>
          <Block>
            <label>설명</label>
            <input
              value={inventoryGroup?.desc}
              disabled
            />
          </Block>
        </FormBox><HGap /><HGap />
        {dayjs(inventoryData?.inventory.updatedAt).format('YYYY.MM.DD HH:MM')}
        {isMobile?
        <StockBox>
          {types?.map((type, j) => {
            return (
              <>
              <h1><span>&nbsp;</span>&nbsp;{type}</h1>
                {stockInputs?.map((v, i)=>{
                  if (v.stockType=== type) {
                    return (
                      <div className='container' key={i}>
                        <div className='top'>
                          <span className='title'
                            onClick={() => {
                              setSelectedStockIndex(j);
                              setIsViewModalVisible(true);
                            }}
                          >
                            {v.stockName}
                          </span>
                          <div className='action'>
                            <div className='qtyInputBox'>
                              <button
                                  onClick={(e) => minusQty(i)}
                                >
                                  <MinusOutlined style={minusButtonStyle} />
                              </button>
                              <button 
                                  name="qty"
                                  onClick={(e) => plusQty(i)}
                                >
                                  <PlusOutlined style={plusButtonStyle}/>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className='bottom'>
                          {locArray.indexOf(v.location) === -1?
                          <div className='selectWrap'>
                            <span className='lable'>위치</span>
                            <input 
                              name="location"
                              value={v.location}
                              onChange={(e) => (handleInputChange(e, i))}
                              maxLength={10}
                              autoComplete="off"
                              required
                            />
                            <button onClick={(e) => (onModifyInput('location', i, 'A'))}><MoreOutlined /></button>
                          </div>
                          :
                          <div className='selectWrap'>
                            <span className='lable'>위치</span>
                            <select name='location' value={v.location} onChange={(e) => (handleInputChange(e, i))}>
                              {locArray.map((value, key) => {
                                return <option key={key} value={value}>{value}</option>
                              })}
                            </select>
                            <button onClick={(e) => (onModifyInput('location', i, ''))}><MoreOutlined /></button>
                          </div>
                          }
                          {unitArray.indexOf(v.unit) === -1?
                          <div className='selectWrap'>
                            <span className='lable'>단위</span>
                            <input 
                              name="unit"
                              value={v.unit}
                              onChange={(e) => (handleInputChange(e, i))}
                              maxLength={10}
                              autoComplete="off"
                              required
                            />
                            <button onClick={(e) => (onModifyInput('unit', i, '개'))}><MoreOutlined /></button>
                          </div>
                          :
                          <div className='selectWrap'>
                            <span className='lable'>단위</span>
                            <select name='unit' value={v.unit} onChange={(e) => (handleInputChange(e, i))}>
                              {unitArray.map((value, key) => {
                                return <option key={key} value={value}>{value}</option>
                              })}
                            </select>
                            <button onClick={(e) => (onModifyInput('unit', i, ''))}><MoreOutlined /></button>
                          </div>
                          }
                          <div className='selectWrap'>
                            <span className='lable'>요구수량</span>
                            <input 
                              className='number'
                              name="reqQty"
                              value={v.reqQty}
                              type="number"
                              onChange={(e) => (handleInputChange(e, i))}
                              maxLength={15}
                              autoComplete="off"
                              required
                            />
                          </div>
                          <div className='selectWrap'>
                            <span className='lable'>현재수량</span>
                            <input 
                              className='number'
                              name="qty"
                              value={v.qty}
                              type="number"
                              onChange={(e) => (handleInputChange(e, i))}
                              maxLength={15}
                              autoComplete="off"
                              required
                            />
                          </div>
                          {statusArray.indexOf(v.status) === -1?
                          <div className='selectWrap'>
                            <span className='lable'>상태</span>
                            <input 
                              name="status"
                              value={v.status}
                              onChange={(e) => (handleInputChange(e, i))}
                              maxLength={10}
                              autoComplete="off"
                              required
                            />
                            <button onClick={(e) => (onModifyInput('status', i, 'OK'))}><MoreOutlined /></button>
                          </div>
                          :
                          <div className='selectWrap'>
                            <span className='lable'>상태</span>
                            <select name='status' value={v.status} onChange={(e) => (handleInputChange(e, i))}>
                              {statusArray.map((value, key) => {
                                return <option key={key} value={value}>{value}</option>
                              })}
                            </select>
                            <button onClick={(e) => (onModifyInput('status', i, ''))}><MoreOutlined /></button>
                          </div>
                          }
                          <div className='memo'>
                            <span className='lable'>메모</span>
                            <input 
                              name="memo"
                              value={v.memo}
                              onChange={(e) => (handleInputChange(e, i))}
                              maxLength={10}
                              autoComplete="off"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  }
                })}
              </>
            )
          })}
        </StockBox>
        :
        <InventoryTable>
          <thead>
            <tr>
              <th>품명</th>
              <th>위치</th>
              <th>단위</th>
              <th>요구수량</th>
              <th>현재수량</th>
              <th>상태</th>
              <th>메모</th>
              <th></th>
            </tr>
          </thead>
            {types?.map((type, i) => {
              return (
                <tbody key={i}>
                  <tr className='code'>
                    <td colSpan={9}>
                      {type}
                    </td>
                  </tr>
                  {stockInputs?.map((v, j)=>{
                    if (v.stockType=== type) {
                      return (
                        <tr>
                        <td 
                          onClick={() => {
                            setSelectedStockIndex(j);
                            setIsViewModalVisible(true);
                          }}
                        >
                          <input
                            name="stockName"
                            className='name'
                            value={v.stockName}
                            disabled
                          />
                        </td>
                        <td>
                          {locArray.indexOf(v.location) === -1?
                          <div className='selectWrap'>
                            <input 
                              name="location"
                              value={v.location}
                              onChange={(e) => (handleInputChange(e, j))}
                              maxLength={10}
                              autoComplete="off"
                              required
                            />
                            <button onClick={(e) => (onModifyInput('location', j, 'A'))}><MoreOutlined /></button>
                          </div>
                          :
                          <div className='selectWrap'>
                            <select name='location' value={v.location} onChange={(e) => (handleInputChange(e, j))}>
                              {locArray.map((value) => {
                                return <option value={value}>{value}</option>
                              })}
                            </select>
                            <button onClick={(e) => (onModifyInput('location', j, ''))}><MoreOutlined /></button>
                          </div>
                          }
                        </td>
                        <td>
                          {unitArray.indexOf(v.unit) === -1?
                          <div className='selectWrap'>
                            <input 
                              name="unit"
                              value={v.unit}
                              onChange={(e) => (handleInputChange(e, j))}
                              maxLength={10}
                              autoComplete="off"
                              required
                            />
                            <button onClick={(e) => (onModifyInput('unit', j, '개'))}><MoreOutlined /></button>
                          </div>
                          :
                          <div className='selectWrap'>
                            <select name='unit' value={v.unit} onChange={(e) => (handleInputChange(e, j))}>
                              {unitArray.map((value) => {
                                return <option value={value}>{value}</option>
                              })}
                            </select>
                            <button onClick={(e) => (onModifyInput('unit', j, ''))}><MoreOutlined /></button>
                          </div>
                          }
                        </td>
                        <td className='numberInput'>
                          <input 
                            name="reqQty"
                            value={v.reqQty}
                            type="number"
                            onChange={(e) => (handleInputChange(e, j))}
                            maxLength={15}
                            autoComplete="off"
                            required
                          />
                        </td>
                        <td className='numberInput'>
                          <input 
                            name="qty"
                            type='number'
                            min={1}
                            max={9999}
                            value={v?.qty} 
                            onChange={(e) => (handleInputChange(e, j))}
                            autoComplete="off"
                            required
                            />
                        </td>
                        <td>
                          {statusArray.indexOf(v.status) === -1?
                          <div className='selectWrap'>
                            <input 
                              name="status"
                              value={v.status}
                              onChange={(e) => (handleInputChange(e, j))}
                              maxLength={10}
                              autoComplete="off"
                              required
                            />
                            <button onClick={(e) => (onModifyInput('status', j, 'OK'))}><MoreOutlined /></button>
                          </div>
                          :
                          <div className='selectWrap'>
                            <select name='status' value={v.status} onChange={(e) => (handleInputChange(e, j))}>
                              {statusArray.map((value) => {
                                return <option value={value}>{value}</option>
                              })}
                            </select>
                            <button onClick={(e) => (onModifyInput('status', j, ''))}><MoreOutlined /></button>
                          </div>
                          }
                        </td>
                        <td>
                          <input 
                            name="memo"
                            value={v.memo}
                            onChange={(e) => (handleInputChange(e, j))}
                            maxLength={50}
                            autoComplete="off"
                          />
                        </td>
                        <td>
                          <div className='qtyInputBox'>
                            <button
                                onClick={(e) => minusQty(j)}
                              >
                                <MinusOutlined style={minusButtonStyle} />
                            </button>
                            <button 
                                name="qty"
                                onClick={(e) => plusQty(j)}
                              >
                                <PlusOutlined style={plusButtonStyle}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                      )
                    }
                  })}
                </tbody>
              )
            })}
        </InventoryTable>
        }
          <HGap />
          <Button type='primary' onClick={onAddField} loading={loading}>+ 품목 추가</Button>
          <HGap />
          <FormBox>
            <span>메모</span>
            <p>{inventoryData?.inventory.memo}</p>
            <Block>
            <Space wrap>
              <input onChange={onChangeMemo} value={memo} maxLength={99}></input>
              <Popconfirm
                title="보고서 작성을 완료하시겠습니까?"
                onConfirm={onSubmit}
                okText="완료"
                cancelText="취소"
              >
                <Button type='primary' loading={loading}>일일 보고서 저장</Button>
              </Popconfirm>
              <Button disabled>보고서 확인</Button>
            </Space>
            </Block>
          </FormBox>
        <HGap />
        <Space wrap>
          <Link href={`/inventory/report/${inventoryGroup?.id}`}><Button>목록으로 돌아가기</Button></Link>
        </Space><br />
      </ContainerWide>
    </AppLayout>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const cookie = context.req ? context.req.headers.cookie : ''; // 쿠키 넣어주기
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  const queryClient = new QueryClient();
  const response = await loadMyInfoAPI();
  // if (!response) { // 로그인 안했으면 홈으로
  //   return {
  //     redirect: {
  //       destination: '/unauth',
  //       permanent: false,
  //     },
  //   };
  // }
  const id = context.params?.id as string;
  await queryClient.prefetchQuery(['user'], () => loadMyInfoAPI());
  // await queryClient.prefetchQuery(['post', id], () => loadPostAPI(Number(id)));
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default UpdateInventory;
