// 공지 수정/ 열람가능 고객 추가
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Button, Divider, Typography, message, Modal, Space } from 'antd';
import { useRouter } from 'next/router';
import Router from 'next/router';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { loadMyInfoAPI } from '../../../apis/user';
import AppLayout from '../../../components/AppLayout';
import User from '../../../interfaces/user';

import { Block, ContainerWide, FormBox, HGap, InputFormTable } from '../../../components/Styled';
import {  createInventoryAPI, getInventoryGroupAPI } from '../../../apis/inventory';
import StockList from '../../../components/StockList';
import useInput from '../../../hooks/useInput';
import { MoreOutlined } from '@ant-design/icons';

const CreateInventory = () => {
  const emptyStock = {
    stockId: null, stockName: '', stockType: '', reqQty: 0.0, unit: '개', qty: 0.0, location: 'A', status: 'OK', memo: ''
  }
  const router = useRouter();
  const { id } = router.query; // 공지 id
  // const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const { data: myUserInfo } = useQuery<User>('me', loadMyInfoAPI);
  const { data: inventoryGroup } = useQuery(['inventoryGroup', id], () => getInventoryGroupAPI(Number(id)));
  const { Title } = Typography;
  const [ memo, onChangeMemo ] = useInput('');
  const [ stockInputs, setStockInputs ] = useState([]);
  const [ isStockModalVisible, setIsStockModalVisible ] = useState(false);
  const unitArray = ['개', '묶음', '박스', 'kg', 'l'];
  const statusArray = ['OK', '부족', '주문완료', '주문필요', '불요', '보류'];
  const locArray = ['A', 'B', 'C', 'D'];
  
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
  }

  const handleInputChange = (e, index) => {
    // const { name, value } = e.target;
    const name = e.target.name;
    const value = e.target.value;
    const list = [...stockInputs];
    list[index][name] = value;
    setStockInputs(list);
  }

  const onModifyInput = (name, index, value) => {
    const list = [...stockInputs];
    list[index][name] = value;
    setStockInputs(list);
  }

  const onSubmit = (e) => {
    e.preventDefault();
    if (!myUserInfo || !id ) {
      return message.error('로그인 정보가 없습니다.')
    }
    if (stockInputs.length < 1) {
      return message.error('데이터를 입력해주세요.')
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
        GroupId: id,
        datas: stockInputs,
        memo,
      }
      createInventoryAPI(datas)
      .then((result) => {
        message.success('재고 보고서 작성을 완료했습니다.')
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
        <Divider><Title level={4}>새로운 재고 보고서 작성</Title></Divider>
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
        <Title level={4}>재고 목록 입력</Title>
          <InputFormTable>
            <tr>
              <th>품명</th>
              <th>타입</th>
              <th>위치</th>
              <th>단위</th>
              <th>요구수량</th>
              <th>현재수량</th>
              <th>상태</th>
              <th>메모</th>
              <th>삭제</th>
            </tr>
            {stockInputs?.map((x, i) => {
              return (
                <tr>
                  <td>
                    <input
                      name="stockName"
                      value={x.stockName}
                      disabled
                    />
                    </td>
                  <td>
                    <input
                      name="stockType"
                      value={x.stockType}
                      disabled
                    />
                    </td>
                  <td>
                    {locArray.indexOf(x.location) === -1?
                    <div className='selectWrap'>
                      <input 
                        name="location"
                        value={x.location}
                        onChange={(e) => (handleInputChange(e, i))}
                        maxLength={25}
                        autoComplete="off"
                        required
                      />
                      <button onClick={(e) => (onModifyInput('location', i, 'A'))}><MoreOutlined /></button>
                    </div>
                    :
                    <div className='selectWrap'>
                      <select name='location' value={x.location} onChange={(e) => (handleInputChange(e, i))}>
                        {locArray.map((value) => {
                          return <option value={value}>{value}</option>
                        })}
                      </select>
                      <button onClick={(e) => (onModifyInput('location', i, ''))}><MoreOutlined /></button>
                    </div>
                    }
                  </td>
                  <td>
                    {unitArray.indexOf(x.unit) === -1?
                    <div className='selectWrap'>
                      <input 
                        name="unit"
                        value={x.unit}
                        onChange={(e) => (handleInputChange(e, i))}
                        maxLength={10}
                        autoComplete="off"
                        required
                      />
                      <button onClick={(e) => (onModifyInput('unit', i, '개'))}><MoreOutlined /></button>
                    </div>
                    :
                    <div className='selectWrap'>
                      <select name='unit' value={x.unit} onChange={(e) => (handleInputChange(e, i))}>
                        {unitArray.map((value) => {
                          return <option value={value}>{value}</option>
                        })}
                      </select>
                      <button onClick={(e) => (onModifyInput('unit', i, ''))}><MoreOutlined /></button>
                    </div>
                    }
                  </td>
                  <td>
                    <input 
                      name="reqQty"
                      value={x.reqQty}
                      type="number"
                      onChange={(e) => (handleInputChange(e, i))}
                      maxLength={15}
                      autoComplete="off"
                      required
                    />
                  </td>
                  <td>
                    <input 
                      name="qty"
                      value={x.qty}
                      type="number"
                      onChange={(e) => (handleInputChange(e, i))}
                      maxLength={15}
                      autoComplete="off"
                      required
                    />
                  </td>
                  <td>
                    {statusArray.indexOf(x.status) === -1?
                    <div className='selectWrap'>
                      <input 
                        name="status"
                        value={x.status}
                        onChange={(e) => (handleInputChange(e, i))}
                        maxLength={12}
                        autoComplete="off"
                        required
                      />
                      <button onClick={(e) => (onModifyInput('status', i, 'OK'))}><MoreOutlined /></button>
                    </div>
                    :
                    <div className='selectWrap'>
                      <select name='status' value={x.status} onChange={(e) => (handleInputChange(e, i))}>
                        {statusArray.map((value) => {
                          return <option value={value}>{value}</option>
                        })}
                      </select>
                      <button onClick={(e) => (onModifyInput('status', i, ''))}><MoreOutlined /></button>
                    </div>
                    }
                  </td>
                  <td>
                    <input 
                      name="memo"
                      value={x.memo}
                      onChange={(e) => (handleInputChange(e, i))}
                      maxLength={50}
                      autoComplete="off"
                    />
                  </td>
                  <td>
                    <Button danger onClick={onRemoveField(i)} loading={loading}>제거</Button>
                  </td>
                </tr>
              )
            })}
          </InputFormTable>
          <Button type='primary' onClick={onAddField} loading={loading}>+ 품목 추가</Button>
    
          <HGap /><HGap />
          <Block>
            <label>메모</label>
            <input
              value={memo}
              onChange={onChangeMemo}
              maxLength={99}
            />
          </Block>
          <Space>
            <Button onClick={onSubmit} type='primary' loading={loading}>새로운 보고서로 저장</Button>
            <Link href={`/inventory/report/${id}`}><Button>목록으로 돌아가기</Button></Link>
          </Space>
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
  await queryClient.prefetchQuery(['inventoryGroup', id], () => getInventoryGroupAPI(Number(id)));
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default CreateInventory;
