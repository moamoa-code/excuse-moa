// 주문서 목록
import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Typography, Button, Divider, Space, message, notification, Descriptions } from 'antd';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useQuery, useQueryClient  } from 'react-query';
import { loadAddrsAPI, loadMyInfoAPI, loadProviderAPI, loadProviderByIdAPI, loadProvidersAPI, loadUserAPI, loadUserByIdAPI } from '../../apis/user';
import { orderPosItemAPI } from '../../apis/order';
import AppLayout from '../../components/AppLayout';

import User from '../../interfaces/user';
import styled from 'styled-components';
import { CheckCircleOutlined, IdcardOutlined, MinusOutlined, PhoneOutlined, PlusOutlined } from '@ant-design/icons';
import Modal from 'antd/lib/modal/Modal';
import { loadCustomerItemListAPI, loadItemListAPI } from '../../apis/item';
import Item from '../../interfaces/item';
import Text from 'antd/lib/typography/Text';
import ItemView from '../../components/ItemView';
import UserInfoBox from '../../components/UserInfoBox';
import useInput from '../../hooks/useInput';


const Container800 = styled.div`
  max-width: 800px;
  padding: 20px;
  margin: 0 auto;
  box-sizing:border-box;
  @media screen and (max-width: 600px) {
    max-width: 100%;
    padding: 10px;
  }
`
const Red = styled.span`
  color: red;
`

const CommentInput = styled.div`
  padding: 5px 15px 5px 15px;
  font-size: 12pt;
  p {
    font-weight: bold;
  }
  textarea  {
    width: 100%;
    height: 2em;
    resize: none;
    border-radius: 4px;
  }
`

const CartItems = styled.div`
  .cartItem{
    position: relative;
    padding: 15px 5px 15px 5px;
    border-bottom: 1px solid #999999;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
      -webkit-appearance: none;
  }
  .first{
    margin: 5px 0px 10px 0px;
  }
  .second{
    margin: 5px 0px 10px 0px;
  }
  .name{
    font-size:14pt;
    font-weight:600;
  }
  .unit{
    background-color:#FF5C8D;
    border-radius: 4px;
    padding: 4px 7px 4px 7px;
    margin: 0px 2px 0px 4px;
    color: white;
    font-size: 11pt;
  }
  .codeName{
    background-color:#00B4D8;
    border-radius: 4px;
    padding: 4px 7px 4px 7px;
    margin: 0px 2px 0px 4px;
    color: white;
    font-size: 11pt;
  }
  .package{
    margin: 0px 2px 0px 4px;
    font-size: 12pt;
  }
  .space{
    display:inline-block;
    width:7px;
  }
  .bottom{
    display: flex;
    justify-content: space-between;
    vertical-align: center;
  }
  .tagInputBox {
    padding: 2px 5px 2px 5px;
    margin: 0px;
    input {
      margin:0px;
      min-width:100px;
      max-width:180px;
      font-size: 14pt;
      border: 1px solid #999999;
      text-align:center;
      border-radius: 25px;
    }
  }
  .delete{
    position: absolute;
    top: 23px;
    right: 5px;
    border: 1px solid #999999;
    background: #999999;
    border-radius: 50%;
    width:25px;
    height:25px;
    font-size:8pt;
    font-wight:600;
    color:white;
  }
  .qtyInputBox {
    vertical-align: center;
    display: inline-block;
    justify-content: space-between;
    margin: 0px;
    padding: 2px 10px 2px 10px;
    border: 1px solid #999999;
    border-radius: 25px;
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
`
const OrderTypeSelects = styled.div`
  a {
    text-decoration:none !important;
  }
  a:hover {
    text-decoration:none !important;
  }
  text-align: center;
  margin 0 auto;
  margin-bottom: 30px;
  box-sizing:border-box;
  .selected{
    color: white;
    background-color: #1890ff;
    border: 1px solid #1890ff;
  }
  div{
    display:inline-block;
    position: relative;
    box-sizing: border-box;
    padding:5px;
    width: 345px;
    height: 50px;
    font-size: 16pt;
    font-wight: 600;
    margin:7px;
    border: 1px solid #111111;
    border-radius: 15px;
    p {
      position: absolute;
      left: 50%;
      top: 50%; 
      transform: translate(-50%,-50%)
    }
  }
  @media screen and (max-width: 600px) {
    div{
      width: 100%;
      padding:0px;
      margin:2px 0px 2px 0px;
    }
  }
`

const ListBox = styled.div`
  overflow:auto;
  max-height:400px;
`

const ContentsBox = styled.div`
  padding: 20px 15px 20px 15px;
  box-sizing:border-box;
  width:100%;
  background-color:#fafafa;
`

const ItemsContainer = styled.div`
  overflow:auto;
  max-height:900px;
  text-align: center;
  width:100%;
  box-sizing: border-box;
  .selected {
    background-color: white;
    box-shadow: 4px 5px 10px 0px rgba(0,0,0,0.2);
}
`

const TiTle = styled.span`
  font-size: 16pt;
  font-weight:600;
`

const CenteredDiv = styled.div`
  text-align: center;
  margin 0 auto;
`
const ItemSelector = styled.div`
  display: inline-block;
  box-sizing: border-box;
  padding:5px;
  width: 340px;

  margin:8px;
  border: 1px dotted #444444;
  border-radius: 7px;

  .underline{
    border-bottom: 1px solid #d4d4d4;
    padding-bottom: 7px;
  }
  .second{
    margin-top: 13px;
  }
  .name{
    font-size:13pt;
    font-weight:600;
  }
  .unit{
    background-color:#FF5C8D;
    border-radius: 4px;
    padding: 4px 7px 4px 7px;
    margin: 0px 2px 0px 4px;
    color: white;
    font-size: 10pt;
  }
  .codeName{
    background-color:#00B4D8;
    border-radius: 4px;
    padding: 4px 7px 4px 7px;
    margin: 0px 2px 0px 4px;
    color: white;
    font-size: 10pt;
  }
  .package{
    margin: 0px 2px 0px 4px;
    font-size: 10pt;
  }
  .space{
    display:inline-block;
    width:5px;
  }
  div{
    margin: 4px 0px 4px 0px;
    vertical-align:middle;
  }
  @media screen and (max-width: 600px) {
    width: 100%;
    margin:8px 0px 8px 0px;
  }
`

const addOrder = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [ loading, setLoading ] = useState(false);
  // 목록 불러오기 필터 state
  const { Title } = Typography;
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { data: providers } = useQuery('providers', loadProvidersAPI);
  // 판매자
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedProviderData, setSelectedProviderData] = useState<any>({});
  // 고객
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedCustomerData, setSelectedCustomerData] = useState<any>({});
  // 제품
  const [items, setItems] = useState<Item[]>([]); // 목록에 나타나는 제품
  const [selectedItems, setSelectedItems] = useState([]); // 카트에 들어간 제품 목록
  const [allItemsOfProvider, setAllItemsOfProvider] = useState<Item[]>([]); // 판매자의 모든제품 목록
  // 주소
  const [selectedAddr, setSelectedAddr]  = useState('');
  const [ addrs, setAddrs ] = useState([]);
  const [ name, setName ] = useState('');
  const [ phone, setPhone ] = useState('');
  const [ address, setAddress ] = useState('');
  const [ zip, setZip ] = useState('');
  const [ comment, onChangeComment ] = useInput('');
  // 총 수량
  const [totalQty, setTotalQty] = useState(0);
  //제품 보기 모달
  const [ isVisible, setIsVisible ] = useState(false);
  const [ selectedItem, setSelectedItem ] = useState();
  // style useMemo
  const minusButtonStyle = useMemo(() => ({fontSize:'14pt', color:'#ff4d4f'}), []);
  const plusButtonStyle = useMemo(() => ({fontSize:'14pt', color:'#1890ff'}), []);

  // 알림창 띄우기
  const openNotification = (text) => { 
    notification.open({
      message: `${text}`,
      description:
        ``,
      icon: <CheckCircleOutlined style={{ color: '#108ee9' }} />,
      duration: 2,
    });
  };

  // 총 수량 계산
  const getTotalQty = (array) => {
    let totalQty = 0;
    array.map((v) => {
      totalQty = totalQty + v.qty;
    });
    setTotalQty(Number(totalQty));
  }

  // 주문완료 버튼
  const onOrderClick = () => {
    setLoading(true);
    // message.error(selectedItems.length)
    if (selectedProvider === '' || selectedCustomer === '' || selectedItems.length <= 0){
      setLoading(false);
      return message.error('선택 안한 항목이 있습니다.');
    }
    console.log('onOrderClick selectedItems', selectedItems);
    orderPosItemAPI(
      { items : selectedItems, 
        providerId: selectedProvider, 
        customerId: selectedCustomer,
        comment,
        address,
        name,
        phone,
      })
    .then((result) => {
      console.log(result);
      openNotification('주문이 추가되었습니다.');
    })
    .catch((error) => {
      setLoading(false);
      alert(error.response.data);
    })
    .finally(() => {
      router.replace(`/factory/order-list`);
    });
  }
    
  // 판매자 선택
  const onProviderSelectClick = (id) => () => {
    setSelectedProvider(id);
    getProviderData(id);
    setSelectedCustomer('');
    setSelectedCustomerData('');
    setSelectedAddr('');
    setSelectedItems([]);
    setAllItemsOfProvider([]);
    setItems([]);
    setName('');
    setPhone('');
    setAddress('');
  }

  // 구매자 선택
  const onCustomerSelectClick = (id) => () => {
    setSelectedCustomer(id);
    getCustomerData(id);
    setSelectedAddr('');
    setSelectedItems([]);
    setAllItemsOfProvider([]);
    setItems([]);
    setName('');
    setPhone('');
    setAddress('');
  }

  // 주소 선택
  const onAddrSelectClick = (addr) => () => {
    setSelectedAddr(addr.id);
    if (addr.id === '공수') {
      setName('공장수령');
      setPhone('');
      setAddress('');
      return;
    }
    if (addr.id === '없음') {
      setName('');
      setPhone('');
      setAddress('');
      return;
    }
    setName(addr.name);
    setPhone(addr.phone);
    setAddress(addr.address);
  }

  // 제품 선택
  const onItemSelectClick = (item) => () => {
    console.log('item',item);
    item.qty = 1;
    item.tag = '';
    if (selectedItems.findIndex((v) => v.id === item.id) !== -1) {
      const array = selectedItems.filter((v) => { if (v.id !== item.id) return v});
      getTotalQty(array);
      return setSelectedItems(array);
    }
    // let array = JSON.parse(JSON.stringify(selectedItems));
    const array = [...selectedItems, item];
    getTotalQty(array);
    return setSelectedItems(array);
  }

  // 추가 제품 목록 불러오기
  const onGetItemListClick = (userId) => () => {
    if (userId === '') {
      return message.error('판매자를 선택해주세요.');
    }
    loadItemListAPI(selectedProviderData?.key)
    .then((response) => {
      setAllItemsOfProvider(response);
    })
    .catch((error) => {
      message.error(error.response.data);
    })
    .finally(() => {

    })
  }


  // 판매자 정보 가져오기
  const getProviderData = (userId) => {
    loadProviderByIdAPI(userId)
    .then((response) => {
      setSelectedProviderData(response);
      setCustomers(response.Customers)
    })
    .catch((error) => {
      alert(error.response.data);
    })
    .finally(() => {

    })
  }

  // 구매자 주소 가져오기
  const getAddrData = (userId) => {
    loadAddrsAPI(userId)
    .then((response) => {
      setAddrs(response);
    })
    .catch((error) => {
      alert(error.response.data);
    })
  }

  // 구매자의 제품목록 불러오기
  const getCustomersItemList = (userId) => {
    loadCustomerItemListAPI(userId)
    .then((response) => {
      if(response){
        setItems(response);
      } else {
        setItems([]);
      }
    }).catch((error) => {
      alert(error.response.data);
    })
  }

  // 구매자 정보 가져오기
  const getCustomerData = (userId) => {
    loadUserByIdAPI(userId)
    .then((response) => {
      setSelectedCustomerData(response);
      getCustomersItemList(userId);
      getAddrData(userId);
    })
    .catch((error) => {
      alert(error.response.data);
    })
  }

  // 모달 닫기
  const handleModalClose = () => {
    setIsVisible(false);
  };


  return (
    <AppLayout>
      <Container800>
      <Modal
          visible={isVisible}
          onCancel={handleModalClose}
          width={680}
          footer={[
            <Button onClick={handleModalClose}>
              닫기
            </Button>,
          ]}
        >
        <ItemView item={selectedItem} myUserInfo={myUserInfo} />
      </Modal>
      
        <OrderTypeSelects>
          <div className='selected'><p>기존 회원 주문</p></div>
          <Link href='/factory/add-new-order'><a><div><p>비회원 신규 주문</p></div></a></Link>
        </OrderTypeSelects>
        <Divider orientation="left">
          <TiTle>
          1. 판매자/브랜드 선택
          </TiTle>
        </Divider>
        <ContentsBox>
          <ListBox>
            <Space wrap>
              {providers?.map((v) => {
                if (v.id === selectedProvider) {
                  return <Button size='large' type="primary">{v.company}</Button>
                }
                return <Button size='large' type="dashed" onClick={onProviderSelectClick(v.id)}>{v.company}</Button>
              })}
            </Space>
          </ListBox>
        </ContentsBox><br />
        {selectedProvider? 
          <UserInfoBox userInfo={selectedProviderData} />
        : null}
        <Divider orientation="left">
          <TiTle>
          2. 구매자 선택
          </TiTle>
        </Divider>
        {!selectedProvider? null :
          <ContentsBox>
            <ListBox>
              <Space wrap>
                {customers?.map((v) => {
                  if (v.id === selectedCustomer) {
                    return <Button size='large' type="primary">{v.company}</Button>
                  }
                  return <Button size='large' type="dashed" onClick={onCustomerSelectClick(v.id)}>{v.company}</Button>
                })}
              </Space>
            </ListBox>
          </ContentsBox>
        }
        <br />
        {selectedCustomer? 
          <UserInfoBox userInfo={selectedCustomerData} />
        : null}
        <br />
        <Divider orientation="left">
          <TiTle>
          2-2. 수령지 선택
          </TiTle>
        </Divider>
        {!selectedProvider? null :
          <ContentsBox>
            <ListBox>
              <Space wrap>
                {selectedAddr === "공수"?
                <Button size='large' danger>공장수령</Button>
                :<Button size='large' type="dashed" onClick={onAddrSelectClick({id:'공수'})} danger>공장수령</Button>
                }
                {selectedAddr === "없음"?
                <Button size='large' danger>정보없음</Button>
                :<Button size='large' type="dashed" onClick={onAddrSelectClick({id:'없음'})} danger>정보없음</Button>
                }
                {selectedAddr === "추가"?
                <Button size='large' danger>새로입력</Button>
                :<Button size='large' type="dashed" onClick={onAddrSelectClick({id:'추가'})} danger><PlusOutlined /> 새로입력</Button>
                }
              </Space><br /><br />
              <Space wrap>
                {addrs?.map((v) => {
                  if (v.id === selectedAddr) {
                    return <Button size='large' type="primary">{v.addrName}</Button>
                  }
                  return <Button size='large' type="dashed" onClick={onAddrSelectClick(v)}>{v.addrName}</Button>
                })}  
              </Space>
            </ListBox>
          </ContentsBox>
        }
        <br />
        {selectedAddr !== '공수' && selectedAddr !== '없음' && selectedAddr !== ''?
        <Descriptions
          bordered
          size="small"
          style={{ marginTop: '10px' }}
        >
          <Descriptions.Item span={3} label="주소">
          <Text editable={{ onChange: (value) => {
                setAddress(value);
              }}}>{address}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="받는분">
            <Text editable={{ onChange: (value) => {
              setName(value);
            }}}>{name}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="받는분 전화번호">
            <Text editable={{ onChange: (value) => {
                setPhone(value);
              }}}>{phone}</Text>
          </Descriptions.Item>
        </Descriptions>
        :
        null}
        <br /><br />
        <Divider orientation="left">
          <TiTle>
          3. 제품 선택
          </TiTle>
        </Divider>
        {!selectedProvider? null :
        <>
          <ContentsBox>
            <ItemsContainer>
              {items?.map((v) => {
                let className = '';
                if (selectedItems.find((i)=>(i.id === v.id))) { // 제품 선택됐을 경우 스타일
                  className = 'selected';
                }
                return (
                  <ItemSelector onClick={onItemSelectClick(v)} className={className}>
                    <div>
                      <span className='underline'>
                        <span className='codeName'>{v.codeName}</span>
                        <div className='space' />
                        <span>({v.id}) </span>
                        <span className='name'>{v.name}</span>
                      </span>
                    </div>
                    <div className='second'>
                      <span className='unit'>{v.unit}</span>
                      <div className='space' />
                      <span className='packageName'>{v.packageName}</span>
                      <span> ({v.supplyPrice})</span>
                    </div>
                  </ItemSelector>
                  )
              })}
            </ItemsContainer>
          </ContentsBox><br/>
          <CenteredDiv>
            <Button size='large' type="dashed" onClick={onGetItemListClick(selectedProvider)}><PlusOutlined /> 판매자의 모든 제품 보기</Button>
          </CenteredDiv><br />
        </>
        }<br />
        {allItemsOfProvider?.length >= 1?
          <ContentsBox>
            <ItemsContainer>
              {allItemsOfProvider?.map((v) => {
                let className = '';
                if (selectedItems.find((i)=>(i.id === v.id))) { // 제품 선택됐을 경우 스타일
                  className = 'selected';
                }
                return (
                  <ItemSelector onClick={onItemSelectClick(v)} className={className}>
                    <div>
                      <span className='underline'>
                        <span className='codeName'>{v.codeName}</span>
                        <div className='space' />
                        <span className='name'>{v.name}</span>
                      </span>
                    </div>
                    <div className='second'>
                      <span className='unit'>{v.unit}</span>
                      <div className='space' />
                      <span className='packageName'>{v.packageName}</span>
                    </div>
                  </ItemSelector>
                  )
              })}
            </ItemsContainer>
          </ContentsBox>
        : null}
        <br />
        <Divider orientation="left">
          <TiTle>
          장바구니
          </TiTle>
        </Divider>
        <CartItems>
          {selectedItems?.map((item) => {
            return (
              <div className='cartItem'>
                <div 
                  className='first'
                  >
                  <span className='codeName'>{item.codeName}</span>
                  <div className='space' />
                  <span 
                    className='name'
                    onClick={() => {
                        setSelectedItem(item);
                        if(String(item.id).includes('F_')) {
                          return;
                        }
                        setIsVisible(true);
                    }}
                  >
                    {item.name}
                  </span>
                </div>
                <button 
                  className='delete'
                  onClick={() => {
                    const array = selectedItems.filter((v) => { if (v.id !== item.id) return v});
                    getTotalQty(array);
                    setSelectedItems(array);
                  }}
                >X 
                </button>
                <div className='second'>
                  <span className='unit'>{item.unit}</span>
                  <div className='space' />
                  <span className='packageName'>{item.packageName}</span>
                </div>
                <div className='bottom'>
                  <div className='tagInputBox'>
                    <input
                      placeholder='표기사항'
                      value={item?.tag}
                      maxLength={11}
                      onChange={
                        (e)=>{
                          let array = JSON.parse(JSON.stringify(selectedItems));
                          const idx = array.findIndex((v) => v.id === item.id);
                          array[idx].tag = e.target.value;
                          return setSelectedItems(array);
                        }
                      }
                    />
                  </div>
                  <div className='wrapper'>
                    <div className='qtyInputBox'>
                      <button
                        onClick={()=>{
                          let array = JSON.parse(JSON.stringify(selectedItems));
                          const idx = array.findIndex((v) => v.id === item.id);
                          if (array[idx].qty <= 1){
                            return;
                          }
                          array[idx].qty = Number(array[idx].qty) - 1;
                          getTotalQty(array);
                          return setSelectedItems(array);
                        }}>
                          <MinusOutlined style={minusButtonStyle} />
                      </button>
                      <input 
                        type='number'
                        min={1}
                        max={9999}
                        value={item?.qty} 
                        onChange={
                          (e)=>{
                            let array = JSON.parse(JSON.stringify(selectedItems));
                            const idx = array.findIndex((v) => v.id === item.id);
                            if (Number(e.target.value) >= 9999){
                              array[idx].qty = 9999;
                              return setSelectedItems(array);
                            }
                            if (Number(e.target.value) <= 0){
                              array[idx].qty = 1;
                              return setSelectedItems(array);
                            }
                            array[idx].qty = Number(e.target.value);
                            getTotalQty(array);
                            return setSelectedItems(array);
                          }
                        }
                        />
                      <button 
                        onClick={()=>{
                          let array = JSON.parse(JSON.stringify(selectedItems));
                          const idx = array.findIndex((v) => v.id === item.id);
                          if (array[idx].qty >= 9999){
                            return;
                          }
                          array[idx].qty = Number(array[idx].qty) + 1;
                          getTotalQty(array);
                          return setSelectedItems(array);
                        }}
                      >
                        <PlusOutlined style={plusButtonStyle}/>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </CartItems>
        <br />
        <CommentInput>
          <p>기타요구사항</p>
          <textarea
            value={comment}
            maxLength={50}
            onChange={onChangeComment}
          />
        </CommentInput>
        <br />
        <Space>
          <Button 
            size='large'
            type='primary'
            onClick={onOrderClick}
            loading={loading}
          >
            {totalQty}개 주문 추가 완료
          </Button>
          <Link href={`/factory/order-list`}><a><Button size='large' danger>취소</Button></a></Link>
        </Space>

      </Container800>
    </AppLayout>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const cookie = context.req ? context.req.headers.cookie : ''; // 쿠키 넣어주기
  axios.defaults.headers.Cookie = '';
  const id = context.params?.id as string;
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
  // if (response.role !== 'PROVIDER' && response.role !== 'ADMINISTRATOR') { // 로그인 안했으면 홈으로
  //   return {
  //     redirect: {
  //       destination: '/unauth',
  //       permanent: false,
  //     },
  //   };
  // }
  await queryClient.prefetchQuery(['user'], () => loadMyInfoAPI());
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default addOrder;
