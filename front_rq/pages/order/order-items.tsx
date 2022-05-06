// 주문서 목록
import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button, Divider, Space, message, notification, Descriptions, Tag, Spin, Result } from 'antd';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useQuery, useQueryClient  } from 'react-query';
import { loadAddrsAPI, loadMyInfoAPI, loadProviderAPI, loadProviderByIdAPI, loadProvidersAPI, loadUserAPI, loadUserByIdAPI } from '../../apis/user';
import { orderPosItemAPI } from '../../apis/order';
import AppLayout from '../../components/AppLayout';
import 'dayjs/locale/ko';
import User from '../../interfaces/user';
import { CheckCircleOutlined, DeleteOutlined, InfoCircleTwoTone, MinusOutlined, PlusOutlined, SearchOutlined, WarningTwoTone } from '@ant-design/icons';
import Modal from 'antd/lib/modal/Modal';
import { loadCustomerItemListAPI, loadItemListAPI } from '../../apis/item';
import Item from '../../interfaces/item';
import Text from 'antd/lib/typography/Text';
import ItemView from '../../components/ItemView';
import shortId from 'shortid';
import UserInfoBox from '../../components/UserInfoBox';
import useInput from '../../hooks/useInput';
import { CartItems, CenteredDiv, CommentInput, Container800, ContentsBox, CustomerForm, HGap, ItemForm, ItemsContainer, ItemSelector, ListBox, LoadingModal, OrderTypeSelects, Red, TiTle } from '../../components/Styled';

const OrderItems = () => {
  const router = useRouter();
  const [ loading, setLoading ] = useState(false);
  const [ isValidUser, setIsValidUser ] = useState(false)
  const { isLoading, data: myUserInfo } = useQuery<User>('me', loadMyInfoAPI, {
    onSuccess(data) {
      console.log(data);
      if(!data.ProviderId) {
        message.error('아직 판매자가 등록되지 않았습니다.');
        setIsValidUser(false);
        return;
      }
      getProviderData(data.ProviderId);
      setSelectedCustomer(data.id);
      setSelectedCustomerData(data);
      getAddrData(data.id);
      getCustomersItemList(data.id);
      setIsValidUser(true);
    }
  });
  // 판매자
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedProviderData, setSelectedProviderData] = useState<any>({});
  // 고객
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerData, setSelectedCustomerData] = useState(null);
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
  const [ comment, onChangeComment ] = useInput('');
  // 총 수량, 무게
  const [totalQty, setTotalQty] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);
  // 제품 보기 모달
  const [ isVisible, setIsVisible ] = useState(false);
  const [ selectedItem, setSelectedItem ] = useState(null);
  // 입력 모드 상태
  const [ isNewCustomer, setIsNewCustomer ] = useState(false); // 구매자 새로입력
  const [ isNewProduct, setIsNewProduct ] = useState(false); // 제품 새로 입력
  // 새로운 제품 입력 값
  const codeNames = ['싱글', 'ES', 'HOUSE', 'BKY', 'KM5', 'KM6', 'KM5 212', 'HYA', 'BR', 'C7', '506', 'A', 'B', 'P', 'HA', 'ST', 'HOUSE 212', 'DECAFFEIN'];
  const units = ['200g', '500g', '1Kg', '400g', '100g'];
  const packages = ['M 무지', 'M 브랜드스티커', 'M 브랜드인쇄', '지퍼 무지', '지퍼 브랜드인쇄', '지퍼 브랜드스티커'];
  const productTags = ['BR', 'ST', 'C7', '디카페인', 'BKY', '아리차블랜드', '케냐블랜드', '케냐', '예가체프', '수프리모'];
  const [productTag, setProductTag] = useState('');
  const [codeName, setCodeName] = useState('');
  const [unit, setUnit] = useState('');
  const [productName, setProductName] = useState('');
  const [packageName, setPackageName] = useState('');
  // style useMemo
  const opacityStyle = useMemo(() => ({opacity: '0.5'}), []);
  const minusButtonStyle = useMemo(() => ({fontSize:'14pt', color:'#ff4d4f'}), []);
  const plusButtonStyle = useMemo(() => ({fontSize:'14pt', color:'#1890ff'}), []);

  // 총 수량 계산
  const getTotalQty = (array) => {
    let totalQty = 0;
    array.map((v) => {
      totalQty = totalQty + v.qty;
    });
    setTotalQty(Number(totalQty));
  }
  // 총 무게 계산
  const getTotalWeight = (array) => {
    let totalWeight = 0;
    array.map((v) => {
      let weight = 0;
      if (v.weight.toUpperCase().replace(' ','').slice(-2) === 'KG') {
        weight = Number(v.weight.toUpperCase().replace(' ','').replace('KG', ''));
      } else if (v.weight.toUpperCase().replace(' ','').slice(-2) !== 'KG' && v.weight.toUpperCase().replace(' ','').slice(-1) === 'G') {
        weight = Number(v.weight.toUpperCase().replace(' ','').replace('G', '')) * 0.001;
      } else {
        weight = 0;
      }
      totalWeight = totalWeight + weight;
    });
    setTotalWeight(Number(totalWeight));
  }
  // 주문완료 버튼
  const onOrderClick = () => {
    setLoading(true);
    if (selectedProvider === '' || selectedCustomer === null || selectedItems.length <= 0){
      setLoading(false);
      return message.error('선택 안한 항목이 있습니다.');
    }
    if (isNewCustomer && name === ''){
      setLoading(false);
      return message.error('구매자 이름을 입력하세요.');
    }
    let customerId = selectedCustomer;
    const tWeight = totalWeight.toFixed(1)
    orderPosItemAPI(
      { items : selectedItems, 
        providerId: selectedProvider, 
        customerId: customerId,
        comment,
        address,
        name,
        phone,
        totalWeight: tWeight
      })
    .then((result) => {
      console.log(result);
      message.success('주문이 추가되었습니다.');
    })
    .catch((error) => {
      setLoading(false);
      message.error(error.response.data);
    })
    .finally(() => {
      router.replace(`/item/order/list/${selectedCustomer}`);
    });
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
    if (addr.id === '키페') {
      setName('카페수령');
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

  // 새로운제품 추가시 제품이름 자동생성
  const createProductName = (codeName, productTag) => {
    return setProductName(codeName + ' ' + productTag);
  }

  // 제품 선택
  const onItemSelectClick = (item) => (e) => {
    // 클릭 이벤트 자식요소에 전달 중지
    // if (e.target !== e.currentTarget) return;
    console.log('item',item);
    item.qty = 1;
    item.tag = '';
    item.weight = '';
    if (String(item.unit).toUpperCase().replace(' ','') === '1KG') {
      item.weight = '1kg'
    } if (String(item.unit).toUpperCase().replace(' ','') === '500G') {
      item.weight = '500g'
    } if (String(item.unit).toUpperCase().replace(' ','') === '400G') {
      item.weight = '400g'
    }if (String(item.unit).toUpperCase().replace(' ','') === '200G') {
      item.weight = '200g'
    } if (String(item.unit).toUpperCase().replace(' ','') === '100G') {
      item.weight = '100g'
    }
    if (selectedItems.findIndex((v) => v.id === item.id) !== -1) {
      const array = selectedItems.filter((v) => { if (v.id !== item.id) return v});
      getTotalQty(array);
      getTotalWeight(array);
      return setSelectedItems(array);
    }
    // let array = JSON.parse(JSON.stringify(selectedItems));
    const array = [...selectedItems, item];
    getTotalQty(array);
    getTotalWeight(array);
    return setSelectedItems(array);
  }

  // 새로운 제품 카트에 넣기
  const onAddNewProductToCart = () => {
    if (codeName.length <= 0 || unit.length <= 0 || productName.length <= 0 || packageName.length <= 0){
      return message.error('입력하지 않은 항목이 있습니다.');
    }
    let weight = '';
    if (String(unit).toUpperCase() === '1KG') {
      weight = '1kg'
    } if (String(unit).toUpperCase() === '500G') {
      weight = '500g'
    } if (String(unit).toUpperCase() === '400G') {
      weight = '400g'
    }if (String(unit).toUpperCase() === '200G') {
      weight = '200g'
    } if (String(unit).toUpperCase() === '100G') {
      weight = '100g'
    }
    const id = 'F_' + shortId.generate();
    console.log(id);
    const item = {id, codeName, name: productName, packageName, unit, weight: weight, tag: productTag, qty:1};
    console.log('##NEW: ',item)
    const array = [...selectedItems, item];
    getTotalQty(array);
    getTotalWeight(array);
    return setSelectedItems(array);
  }

  // 판매자 정보 가져오기
  const getProviderData = (userId) => {
    setLoading(true);
    loadProviderByIdAPI(userId)
    .then((response) => {
      setSelectedProviderData(response);
      setSelectedProvider(userId);
    })
    .catch((error) => {
      message.error(error.response.data);
    })
    .finally(() => {
      setLoading(false);
    })
  }

  // 구매자 주소 가져오기
  const getAddrData = (userId) => {
    setLoading(true);
    loadAddrsAPI(userId)
    .then((response) => {
      setAddrs(response);
    })
    .catch((error) => {
      message.error(error.response.data);
    })
    .finally(() => {
      setLoading(false);
    })
  }

  // 구매자의 제품목록 불러오기
  const getCustomersItemList = (userId) => {
    setLoading(true);
    loadCustomerItemListAPI(userId)
    .then((response) => {
      if(response){
        setItems(response);
      } else {
        setItems([]);
      }
    }).catch((error) => {
      message.error(error.response.data);
    })
    .finally(() => {
      setLoading(false);
    })
  }

  // 모달 닫기
  const handleModalClose = () => {
    setIsVisible(false);
  };

  if (!isValidUser) {
    return(
    <AppLayout>
      <Container800>
      <OrderTypeSelects>
          <div className='selected'><p>새로운 주문 추가하기</p></div>
      </OrderTypeSelects>
      <Result
        status="warning"
        title="아직 판매자가 등록되지 않았거나 데이터 로딩중입니다."
        extra={
          <>
            <h1>담당 판매자 혹은 관리자에 문의하세요.</h1>
            <HGap />
            <Link href={'/'}><a><Button type="primary" key="console">
              홈으로 이동
            </Button></a></Link>
          </>
        }
      />
      </Container800>
    </AppLayout>
    )
  }

  return (
    <AppLayout>
      <Container800>
      {loading || isLoading?
        <LoadingModal>
          <Spin /> 로딩중
        </LoadingModal>
      :null}
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
          <div className='selected'><p>새로운 주문 추가하기</p></div>
        </OrderTypeSelects>
        <Divider orientation="left">
          <TiTle>
          1. 판매자/브랜드 정보
          </TiTle>
        </Divider>
        <UserInfoBox userInfo={selectedProviderData} />
        <HGap /><HGap />
        <Divider orientation="left">
          <TiTle>
          2. 구매자 정보
          </TiTle>
        </Divider>
        <UserInfoBox userInfo={selectedCustomerData} />
        <HGap /><HGap />
        <Divider orientation="left">
          <TiTle>
          2-2. 수령지 선택
          </TiTle>
        </Divider>
          <ContentsBox>
            <Space wrap>
              {selectedAddr === "공수"?
              <Button size='large' danger>공장수령</Button>
              :<Button size='large' type="dashed" onClick={onAddrSelectClick({id:'공수'})} danger>공장수령</Button>
              }
              {selectedAddr === "카페"?
              <Button size='large' danger>카페수령</Button>
              :<Button size='large' type="dashed" onClick={onAddrSelectClick({id:'카페'})} danger>카페수령</Button>
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
            <ListBox>
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
        {selectedAddr !== '공수' && selectedAddr !== '카페' && selectedAddr !== '없음' && selectedAddr !== ''?
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
        <HGap /><HGap />

        <Divider orientation="left">
          <TiTle>
          3. 제품 선택
          </TiTle>
        </Divider>
        <ContentsBox>
          <ItemsContainer>
            {items?.map((v) => {
              let className = '';
              if (selectedItems.find((i)=>(i.id === v.id))) { // 제품 선택됐을 경우 스타일
                className = 'selected';
              }
              return (
                <ItemSelector onClick={onItemSelectClick(v)} className={className}>
                  <span 
                    className='showModalClick'
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(v);
                      setIsVisible(true);
                    }}
                  >
                    <InfoCircleTwoTone style={opacityStyle}/>
                  </span>
                  <div>
                    <span className='underline'>
                      <span className='codeName'>{v.codeName}</span>
                      <div className='space' />
                      <span className='id'>({v.id}) </span>
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
            {items?.length <= 0? 
              <Result
                status="warning"
                title="판매자가 아직 제품을 등록하지 않았습니다."
                extra={<h1>판매자 혹은 관리자에 문의하세요.</h1>}
              />
            :null}
          </ItemsContainer>
        </ContentsBox>
          <br />
          <CenteredDiv>
            <Space wrap>
              <Button 
                size='large'
                type="dashed" 
                onClick={() => {
                  setAllItemsOfProvider([]);
                  setIsNewProduct(!isNewProduct);
                }}
                danger>
                <PlusOutlined /> 새로운 제품 입력
              </Button>
            </Space>
          </CenteredDiv><br />
        {isNewProduct?
          <ContentsBox>
            <ItemForm>
              <div>
                <div style={{textAlign:'center'}}>
                  <WarningTwoTone /> 판매자와 사전협의되지 않은 제품 입력시 주문이 취소될 수 있습니다.
                </div>
                <div className='optionName'>A. 원두 코드 <Red>*</Red></div>
                <input 
                  value={codeName} 
                  maxLength={12}
                  onChange={(e) => {
                  setCodeName(e.target.value)
                  createProductName(e.target.value, productTag);
                  }} />
                <div className='optionContainer'>
                  {codeNames.map((v)=>{
                    return (
                    <p className='codeName' onClick={() => {
                      setCodeName(v);
                      createProductName(v, productTag);
                    }}>{v}</p>
                    )
                  })}
                </div>
              </div>
              <div>
                <div className='optionName'>B. 무게 단위 <Red>*</Red></div>
                {/* <input value={unit} placeholder='아래에서 선택하세요.' readOnly/> */}
                <input value={unit} placeholder='아래에서 선택하세요.'/>
                <div className='optionContainer'>
                  {units.map((v)=>{
                    return (
                    <p className='unit' onClick={() => (setUnit(v))}>{v}</p>
                    )
                  })}
                </div>
              </div>
              <div>
                <div className='optionName'>C. 포장 종류 <Red>*</Red></div>
                <input 
                  value={packageName}
                  maxLength={20}
                  onChange={(e) => (setPackageName(e.target.value))} />
                <div className='optionContainer'>
                  {packages.map((v)=>{
                    return (
                    <p className='package' onClick={() => (setPackageName(v))}>{v}</p>
                    )
                  })}
                </div>
              </div>
              <div>
                <div className='optionName'>D. 표기사항 / 옵션 (라벨 등)</div>
                <input 
                  maxLength={12}
                  value={productTag}
                  placeholder='필요시 입력'
                  onChange={(e) => {
                    setProductTag(e.target.value);
                    createProductName(codeName, e.target.value);
                  }} 
                />
                <div className='optionContainer'>
                  {productTags.map((v)=>{
                    return (
                    <p className='tag' onClick={() => {
                      setProductTag(v);
                      createProductName(codeName, v);
                    }}>{v}</p>
                    )
                  })}
                </div>
              </div>
              <div>
                <div className='optionName'>E. 제품 이름 <Red>*</Red></div>
                <input 
                  className='productName'
                  maxLength={20}
                  value={productName}
                  onChange={(e) => (setProductName(e.target.value))} 
                />
              </div>
              <div className='buttonWrapper'>
                <button onClick={onAddNewProductToCart}>
                  장바구니에 제품 추가하기
                </button>
              </div>
            </ItemForm>
        </ContentsBox>
        :null }
        
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
                  <span className='name'>
                    {item.name}
                  </span>
                </div>
                <button 
                  className='delete'
                  onClick={() => {
                    const array = selectedItems.filter((v) => { if (v.id !== item.id) return v});
                    getTotalQty(array);
                    getTotalWeight(array);
                    setSelectedItems(array);
                  }}
                >X 
                </button>

                <div className='second'>
                  <span className='unit'>{item.unit}</span>
                  <div className='space' />
                  <span className='packageName'>{item.packageName}</span>
                  <div className='weight'>
                    총 {item?.weight}
                  </div>
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
                          const newQty = Number(array[idx].qty) - 1;
                          if (String(item.unit).toUpperCase().replace(' ','') === '1KG') {
                            array[idx].weight = newQty * 1 + 'Kg'
                          } else if (String(item.unit).toUpperCase().replace(' ','') === '500G') {
                            array[idx].weight = (newQty * 0.5).toFixed(1)+ 'Kg'
                          } else if (String(item.unit).toUpperCase().replace(' ','') === '400G') {
                            array[idx].weight = (newQty * 0.4).toFixed(1)+ 'Kg'
                          } else if (String(item.unit).toUpperCase().replace(' ','') === '200G') {
                            array[idx].weight = (newQty * 0.2).toFixed(1) + 'Kg'
                          } else if (String(item.unit).toUpperCase().replace(' ','') === '100G') {
                            array[idx].weight = (newQty * 0.1).toFixed(1)+ 'Kg'
                          } else {
                            array[idx].weight = '0';
                          }
                          array[idx].qty = newQty;
                          getTotalQty(array);
                          getTotalWeight(array);
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
                            if (Number(e.target.value) <= 1){
                              array[idx].qty = 1;
                              return setSelectedItems(array);
                            }
                            array[idx].qty = Number(e.target.value);
                            getTotalQty(array);
                            getTotalWeight(array);
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
                          const newQty = Number(array[idx].qty) + 1;
                          if (String(item.unit).toUpperCase().replace(' ','') === '1KG') {
                            array[idx].weight = newQty * 1 + 'Kg'
                          } else if (String(item.unit).toUpperCase().replace(' ','') === '500G') {
                            array[idx].weight = (newQty * 0.5).toFixed(1)+ 'Kg'
                          } else if (String(item.unit).toUpperCase().replace(' ','') === '400G') {
                            array[idx].weight = (newQty * 0.4).toFixed(1)+ 'Kg'
                          } else if (String(item.unit).toUpperCase().replace(' ','') === '200G') {
                            array[idx].weight = (newQty * 0.2).toFixed(1) + 'Kg'
                          } else if (String(item.unit).toUpperCase().replace(' ','') === '100G') {
                            array[idx].weight = (newQty * 0.1).toFixed(1)+ 'Kg'
                          } else {
                            array[idx].weight = '0';
                          }
                          array[idx].qty = newQty;
                          getTotalQty(array);
                          getTotalWeight(array);
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
        <CenteredDiv>
          <Button 
            size='large'
            type='primary'
            onClick={onOrderClick}
            loading={loading}
          >
            {totalQty}개 ({totalWeight.toFixed(1)}Kg) 주문 추가 완료
          </Button>
        </CenteredDiv>
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
  if (!response) { // 로그인 안했으면 홈으로
    return {
      redirect: {
        destination: '/unauth',
        permanent: false,
      },
    };
  }
  await queryClient.prefetchQuery('user', loadMyInfoAPI);
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default OrderItems;
