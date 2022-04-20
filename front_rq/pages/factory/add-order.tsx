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
import { CheckCircleOutlined, IdcardOutlined, MinusOutlined, PhoneOutlined, PlusOutlined } from '@ant-design/icons';
import Modal from 'antd/lib/modal/Modal';
import { loadCustomerItemListAPI, loadItemListAPI } from '../../apis/item';
import Item from '../../interfaces/item';
import Text from 'antd/lib/typography/Text';
import ItemView from '../../components/ItemView';
import UserInfoBox from '../../components/UserInfoBox';
import useInput from '../../hooks/useInput';
import { CartItems, CenteredDiv, CommentInput, Container800, ContentsBox, ItemsContainer, ItemSelector, ListBox, OrderTypeSelects, TiTle } from '../../components/Styled';

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
          <div><Link href='/factory/add-new-order'><a><p>비회원 신규 주문</p></a></Link></div>
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
