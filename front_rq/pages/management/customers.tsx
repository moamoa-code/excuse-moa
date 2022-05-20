// 고객생성 페이지
// 유저를 생성하고 판매자의 고객으로 등록한다.
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState, useEffect, useRef } from 'react';
import { dehydrate, QueryClient, useQuery, useQueryClient } from 'react-query';
import Head from 'next/head';
import { Form, Input, Checkbox, Button, notification, Space, Tag, Descriptions, Table, Modal, message, Popconfirm } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

import { loadMyInfoAPI, loadUserAPI, addCustomerAPI, deleteCustomerAPI, addItemToCustomerAPI, removeItemToCustomerAPI, updateUserAPI, terminateUserAPI, loadAddrsAPI, addNewAddrAPI, removeAddrAPI, changePasswordAPI } from '../../apis/user';
import { loadMyItemsAPI } from '../../apis/item';
import { Container800, DataShow, HGap, MoDal } from '../../components/Styled'; 
import AppLayout from '../../components/AppLayout';
import User from '../../interfaces/user';
import { useMediaQuery } from 'react-responsive';
import MyTable from '../../components/MyTable';
import OrderList from '../../components/OrderList';
import useInput from '../../hooks/useInput';
import DaumPostcode from 'react-daum-postcode';
// import DataShow from '../../components/DataShow';

const Customers = () => {
  const { Title } = Typography;
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { data: myItems } = useQuery('myItems', loadMyItemsAPI);
  const [form] = Form.useForm();
  const [ isCustomerOrdersModal, setIsCustomerOrdersModal ] = useState(false);
  const modalOutside = useRef(); // 모달 바깥부분 클릭시 닫기 위한 ref

  const { Search } = Input;
  const [ userInfo, setUserInfo] = useState({});
  const [ uId, setUId ] = useState('');
  const [ uKey, setUKey ] = useState('');
  const [ uCompany, onChangeUcompany, setUcompany ] = useInput('');
  const [ uName, onChangeUname, setUname ] = useInput('');
  const [ uPhone, setUphone ] = useState('');
  const [ uEmail, onChangeUemail, setUemail ] = useInput('');
  const [ uDate, setUdate ] = useState('');
  const [ uRole, setUrole ] = useState('');
  const [ uItems, setUitems ] = useState([]);
  const [ isMine, setIsmine ] = useState(false);
  const [ isVisible, setIsvisible ] = useState(false);
  // 회원정보 수정
  const [ isEditable, setIsEditable ] = useState(false);
  const [ keyValidError, setKeyValidError ] = useState(false);
  const [ password, onChangePassword, setPassword ] = useInput('');
  const [ isPasswordEdit, setIsPasswordEdit ] = useState(false);
  // 주소
  const [ isEditAddr, setIsEditAddr ] = useState(false);
  const [ isAddNewAddr, setIsAddNewAddr ] = useState(false);
  const [ isDaumZipVisible, setIsDaumZipVisible ] = useState(false);
  const [ selectedAddr, setSelectedAddr] = useState();
  const [ addrs, setAddrs ] = useState([]);
  const [ name, setName ] = useState('');
  const [ phone, setPhone ] = useState('');
  const [ address, setAddress ] = useState('');
  const [ zip, setZip ] = useState('');
  const [ newZip, setNewZip ] = useState('');
  const [ newAddr, onChangeNewAddr, setNewAddr ] = useInput('');
  const [ newAddr2, onChangeNewAddr2, setNewAddr2 ] = useInput('');
  const [ newName, onChangeNewName, setNewName ] = useInput('');
  const [ newPhone, setNewPhone ] = useState('');

  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:768px)",
  });

  const divRef = useRef<HTMLDivElement>(null);

  const openNotification = (text) => {
    notification.open({
      message: `${text}`,
      description:
        ``,
      icon: <CheckCircleOutlined style={{ color: '#108ee9' }} />,
      duration: 2,
    });
  };

  const onChangeUKey = useCallback( // 아이디 유효성검사
    (e) => {
      let value = e.target.value.replace(/[ㄱ-힣\{\}\[\]\/?.,;:|\)*~`!^\+<>@\#$%&\\\=\(\'\")]/g, '').trim().toLowerCase();
      setUKey(value);
    },
    [uKey],
  );

  const onChangeUphone = (e) => {
    const { value } = e.target;
    const onlyNumber = value.replace(/[^0-9]/g, '');
    // const regExpPhone = /[^0-9]/;
    setUphone(onlyNumber);
  }

  // 회원정보 수정
  const onReqUserEdit = () => {
    if (keyValidError) {
      return message.error('아이디를 올바르게 입력해 주세요.')
    }
    setLoading(true);
    const data = {userKey: uKey, userId: uId, company:uCompany, role: 'CUSTOMER', name: uName, phone: uPhone, email: uEmail};
    updateUserAPI(data)
    .then((response) => {
      message.success('회원정보 수정을 완료했습니다.');
      // setUserList(null);
    })
    .catch((error) => {
      alert(error.response.data);
      setLoading(false);
      setIsvisible(false);
    })
    .finally(() => {
      initAddrStates();
      setLoading(false);
      setIsEditable(false);
    });
  }

  const onReqChangePassword = () => {
    setLoading(true);
    const regExpPw = /^[A-Za-z0-9`~_!@#$%^&*()_+=,.></?-]{6,15}$/;
    if (!regExpPw.test(password)){
      setLoading(false);
      return message.error('6자 이상 15자 이하로 입력해 주세요.');
    }
    const data = { userId: uId, password };
    changePasswordAPI(data)
    .then((response) => {
      message.success('비밀번호를 변경 했습니다.');
    })
    .catch((error) => {
      alert(error.response.data);
      setLoading(false);
    })
    .finally(() => {
      setLoading(false);
      setPassword('');
      setIsPasswordEdit(false);
    });
  }

  const onTerminateUser = () => {
    setLoading(true);
    terminateUserAPI({userKey: uKey})
    .then((response) => {
      message.success('회원삭제를 완료했습니다.');
      initAddrStates();
      setUId('');
      setUKey('');
      setKeyValidError(false);
      setUcompany('');
      setUname('');
      setUphone('');
      setUemail('');
      setUrole('');
      setUdate('');
      // setPassword('');
      // setIsPasswordEdit(false);
      setIsvisible(false);
    })
    .catch((error) => {
      alert(error.response.data);
    })
    .finally(() => {
      setLoading(false);
    });
  }

  const onSearch = (value) => {
    let key = String(value).replace(' ','');
    console.log(key);
    setLoading(true);
    setIsEditable(false);
    initAddrStates();
    setIsPasswordEdit(false);
    setPassword('');
    loadUserAPI(key)
      .then((response) => {
        setUserInfo(response);
        if (myUserInfo.Customers.find((v) => (v.key === response.key))){
          setIsmine(true);
        } else {
          setIsmine(false);
        }
        setUId(response.id)
        setUdate(response.createdAt);
        setUKey(response.key);
        setUcompany(response.company)
        setUname(response.name)
        setUphone(response.phone)
        setUemail(response.email)
        setUrole(response.role)
        if (response.UserViewItems){
          setUitems(response.UserViewItems)
        } else {
          setUitems([])
        }
        form.resetFields();
        setIsvisible(true)
      })
      .catch((error) => {
        message.error(error.response.data);
        setLoading(false);
        setIsvisible(false)
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 구매자 주소 가져오기
  const getAddrData = (userId) => {
    loadAddrsAPI(userId)
    .then((response) => {
      setAddrs(response);
    })
    .catch((error) => {
      message.error(error.response.data);
    })
  }
  // 주소관련 상태 초기화
  const initAddrStates = () => {
    setSelectedAddr(null);
    setAddrs([]);
    setName('');
    setPhone('');
    setAddress('');
    setZip('');
    setNewZip('');
    setNewAddr('');
    setNewAddr2('');
    setNewName('');
    setNewPhone('');
    setIsEditAddr(false);
    setIsAddNewAddr(false);
    setIsDaumZipVisible(false);
  }

  // 주소 선택
  const onAddrSelectClick = (addr) => () => {
    setIsAddNewAddr(false);
    setZip(addr.zip);
    setSelectedAddr(addr.id);
    setName(addr.name);
    setPhone(addr.phone);
    setAddress(addr.address);
  }

  const onChangeNewPhone = (e) => {
    const { value } = e.target;
    const onlyNumber = value.replace(/[^0-9]/g, '');
    // const regExpPhone = /[^0-9]/;
    setNewPhone(onlyNumber);
  }

  const onChangeNewZip = (e) => {
    const { value } = e.target;
    const onlyNumber = value.replace(/[^0-9]/g, '');
    // const regExpPhone = /[^0-9]/;
    setNewZip(onlyNumber);
  }

  // 다음 주소찾기모듈
  const onCompletePost = (data) => {
    let fullAddr = data.address;
    let extraAddr = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddr += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddr += extraAddr !== '' ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddr += extraAddr !== '' ? ` (${extraAddr})` : '';
    }
    setNewZip(data.zonecode);
    setNewAddr(fullAddr);
    setIsDaumZipVisible(false);
  };

  // 새로운 주소 추가
  const onAddNewAddr = () => {
    setLoading(true);
    if (uId === '' || newAddr === '' || newName === '' || newPhone === '' || newZip === ''){
      setLoading(false);
      return message.error('입력안한 항목이 있습니다.');
    }
    const fulladdr = newAddr + ' ' + newAddr2;
    const addrData = {UserId: uId, zip: newZip, address: fulladdr, name: newName, phone: newPhone}
    addNewAddrAPI(addrData)
    .then((response) => {
      message.success('주소를 추가했습니다.');
      setSelectedAddr(null);
      setName('');
      setPhone('');
      setAddress('');
      setNewAddr('');
      setNewAddr2('');
      setNewName('');
      setNewPhone('');
      setIsAddNewAddr(false);
      getAddrData(uId);
    })
    .catch((error) => {
      message.error(error.response.data);
    })
    .finally(() => {
      setLoading(false);
    })
  }

  // 선택한 주소 삭제
  const onDeleteAddr = () => {
    setLoading(true);
    if (uId === '' || selectedAddr === null) {
      return message.error('')
    }
    removeAddrAPI({id: selectedAddr})
    .then((response) => {
      message.success('주소를 삭제했습니다.');
      setSelectedAddr(null);
      setZip('');
      setName('')
      setPhone('')
      setAddress('')
      getAddrData(uId);
    })
    .catch((error) => {
      message.error(error.response.data);
    })
    .finally(() => {
      setLoading(false);
    })
  }

  const onToggleItem = (e) => { // 고객에 열람가능 제품 추가/제거
    console.log('click', e.target.value)
    const itemId = parseInt(e.target.value);
    if (e.target.checked) {
      setLoading(true);
      addItemToCustomerAPI({ itemId: itemId, customerKey: uKey })
      .then(() => {
        
      })
      .catch((error) => {
        alert(error.response.data);
        setLoading(false);
      })
      .finally(() => {
        queryClient.invalidateQueries('myItems');
        setLoading(false);
        openNotification('고객에 열람가능한 제품을 추가했습니다.');
      });
    } else {
      setLoading(true);
      removeItemToCustomerAPI({ itemId: itemId, customerKey: uKey })
      .then(() => {
        
      })
      .catch((error) => {
        alert(error.response.data);
        setLoading(false);
      })
      .finally(() => {
        queryClient.invalidateQueries('myItems');
        setLoading(false);
        openNotification('고객에 열람가능한 제품을 제거했습니다.');
      });
    }
  }

  const onViewUserInfo = (key) => () => { // 회원목록의 회원 태그 클릭
    setLoading(true);
    setIsEditable(false);
    initAddrStates();
    setIsPasswordEdit(false);
    setPassword('');
    loadUserAPI(String(key))
      .then((response) => {
        setUserInfo(response);
        if (myUserInfo.Customers.find((v) => (v.key === response.key))){
          setIsmine(true);
        } else {
          setIsmine(false);
        }
        setUId(response.id);
        setUKey(response.key);
        setUcompany(response.company);
        setUname(response.name);
        setUdate(response.createdAt);
        setUphone(response.phone)
        setUemail(response.email)
        setUrole(response.role)
        if (response.UserViewItems){
          setUitems(response.UserViewItems)
        } else {
          setUitems([])
        }
        console.log(uItems);
        form.resetFields();
        setIsvisible(true);
        divRef.current?.scrollIntoView({ behavior: 'smooth' });
      })
      .catch((error) => {
        alert(error.response.data);
        setLoading(false);
        setIsvisible(false)
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onAddCustomer = () => {
    setLoading(true);
    addCustomerAPI({ providerKey: myUserInfo.key, customerKey: uKey})
    .then((response) => {
      openNotification('고객 등록이 완료됐습니다.');
      setUrole('CUSTOMER');
      setIsmine(true);
      console.log(response);
    })
    .catch((error) => {
      alert(error.response.data);
      setLoading(false);
    })
    .finally(() => {
      setLoading(false);
      queryClient.invalidateQueries('user');
    });
  }

  const onDeleteCustomer = () => {
    setLoading(true);
    deleteCustomerAPI({ providerKey: myUserInfo.key, customerKey: uKey})
    .then((response) => {
      openNotification('고객 해제가 완료됐습니다.');
      setIsmine(false);
      console.log(response);
    })
    .catch((error) => {
      alert(error.response.data);
      setLoading(false);
    })
    .finally(() => {
      setLoading(false);
      queryClient.invalidateQueries('user');
    });
  }

  const userTableColumns = [
    {
      title: '아이디',
      dataIndex: 'key',
      key: 'key',
      type: 'id',
      render: (text, record) => (
        <span onClick={onViewUserInfo(text)}>{text}</span>
      ),
    }, {
      title: '회사명',
      type: 'title',
      dataIndex: 'company',
      key: 'company',
      render: (text, record) => (
        <span onClick={onViewUserInfo(record.key)}>{text}</span>
      ),
    }, {
      title: '담당자',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '연락처',
      dataIndex: 'phone',
      key: 'phone',
    }, {
      title: '',
      key: 'action',
      type: 'right',
      render: (text, record) => (
        <span onClick={onViewUserInfo(record.key)} style={{color: '#4aa9ff'}}>보기</span>
      ),
    },
  ]

  return (
  <AppLayout>
    <Container800>
    {isDaumZipVisible?
      <MoDal 
        ref={modalOutside}
        onClick={(e)=>{
          if(modalOutside.current === e.target) {
            setIsDaumZipVisible(false)}
        }}
      >
        <div className='contents'>
          <DaumPostcode onComplete={onCompletePost } />
          <div className='close'>
            <Button onClick={() => { setIsDaumZipVisible(false) }}>닫기</Button>
          </div>
        </div>
      </MoDal>
    :null}
    {isCustomerOrdersModal?
      <MoDal 
        ref={modalOutside}
        onClick={(e)=>{
          if(modalOutside.current === e.target) {
            setIsCustomerOrdersModal(false)}
        }}
      >
        <div className='contents'>
          <OrderList userInfo={userInfo} mode="CUSTOMER"/>
          <div className='close'>
            <Button onClick={() => { setIsCustomerOrdersModal(false) }}>닫기</Button>
          </div>
        </div>
      </MoDal>
    :null}
      <Head>
        <title>고객 등록</title>
      </Head>
      <Title level={4} >{myUserInfo.company}사의 고객 목록</Title>
      {isMobile?
        <MyTable 
        loading={loading}
        rowKey="id"
        columns={userTableColumns}
        dataSource={myUserInfo?.Customers}
        />
      :      
        <Table
          loading={loading}
          rowKey="id"
          columns={userTableColumns}
          dataSource={myUserInfo?.Customers}
        />
      }

      <Title level={4} style={{ marginTop: '30px' }} >회원 검색</Title>
      <Search placeholder="사업자 등록번호(아이디) 정확히 입력" onSearch={onSearch} enterButton />
      {isVisible ? 
      <>
        <HGap />
        <DataShow ref={divRef}>
          <h1>
            <Space wrap>
              <span>회원정보</span>
              <Button 
                loading={loading}
                onClick={() => {
                  setIsEditable(!isEditable);
                }}
                disabled={!isMine}
              >
                수정모드
            </Button>
          </Space>
          </h1>
          <div className='container'>
            <span className='title'>사업자등록번호(아이디)</span>
            <span className='data'>
              {isEditable?
                <input
                  value={uKey}
                  onChange={onChangeUKey}
                  maxLength={25}
                />
                :
                <input
                  value={uKey}
                  onChange={onChangeUKey}
                  disabled
                />
              }
            </span>
          </div>
          <div className='container'>
            <span className='title'>회사명</span>
            <span className='data'>
              {isEditable?
                <input
                  value={uCompany}
                  onChange={onChangeUcompany}
                  maxLength={20}
                />
                :
                <input
                  value={uCompany}
                  onChange={onChangeUcompany}
                  disabled
                />
              }
            </span>
          </div>
          <div className='container'>
            <span className='title'>담당자 성함</span>
            <span className='data'>
              {isEditable?
                <input
                  value={uName}
                  onChange={onChangeUname}
                  maxLength={20}
                />
                :
                <input
                  value={uName}
                  onChange={onChangeUname}
                  disabled
                />
              }
            </span>
          </div>
          <div className='container'>
            <span className='title'>전화번호</span>
            <span className='data'>
              {isEditable?
                <input
                  value={uPhone}
                  onChange={onChangeUphone}
                  maxLength={20}
                />
                :
                <input
                  value={uPhone}
                  onChange={onChangeUphone}
                  disabled
                />
              }
            </span>
          </div>
          <div className='container'>
            <span className='title'>담당자 이매일</span>
            <span className='data'>
              {isEditable?
                <input
                  value={uEmail}
                  onChange={onChangeUemail}
                  maxLength={20}
                />
                :
                <input
                  value={uEmail}
                  onChange={onChangeUemail}
                  disabled
                />
              }
            </span>
          </div>
          <div className='container'>
            <span className='title'>등급</span>
            <span className='data'>{uRole}</span>
          </div>
          <div className='container'>
            <span className='title'>주문목록</span>
            <span className='data'>
              <Button disabled={!isMine} onClick={()=>setIsCustomerOrdersModal(true)}>구매주문</Button>
            </span>
          </div>
            <span className='bigTitle'>열람가능 제품 등록</span>
            <span className='bigData'>
            {isMine ? 
              <Form 
                initialValues={{ // 제품 볼 수 있는 유저 체크
                  'userItems': uItems.map((v) => (v.id)),
                }}
                form={form}
              >
                <Form.Item name="userItems">
                  <Checkbox.Group>
                    <Space size={8} wrap>
                      {myItems? 
                        <>
                          {myItems.map((v, i) => {
                            if (v.scope === 'PRIVATE'){
                              return (
                                <Tag key={i}>
                                  <Checkbox value={v.id} disabled={loading} onClick={onToggleItem}>({v.id}) {v.name}</Checkbox>
                                </Tag>)
                            }
                          })
                          } 
                        </>
                      : null}
                    </Space>
                  </Checkbox.Group>
                </Form.Item>
              </Form>
            : <p>아직 귀사의 고객이 아닙니다.</p> }
            </span>
        </DataShow>
          {isEditable?
            <Button 
              loading={loading} type='primary' onClick={onReqUserEdit}
            >
              회원정보 수정
            </Button>
            :isMine ?
            <Space>
              <Popconfirm
                title="고객을 해제하시겠습니까?"
                onConfirm={onDeleteCustomer}
                okText="해제"
                cancelText="취소"
              >
                <Button loading={loading}>고객등록 해제</Button>
              </Popconfirm>
              {isPasswordEdit?
                <>
                  <input 
                    type='password'
                    value={password}
                    onChange={onChangePassword}
                    placeholder='6자 이상 15자 이하'
                  />
                  <Button 
                    loading={loading}
                    onClick={onReqChangePassword}
                    type='primary'
                  >
                    변경완료
                  </Button>
                </>
                :
                <Button 
                  loading={loading}
                  onClick={()=>{
                    setIsPasswordEdit(!isPasswordEdit);
                  }}
                >
                  비밀번호 변경
                </Button>
              }
              <Button
                loading={loading}
                onClick={()=>{
                  getAddrData(uId);
                  setIsEditAddr(!isEditAddr);
                }}
              >
                주소편집모드
              </Button>
              <Popconfirm
                title="회원을 삭제하시겠습니까?"
                okText="네"
                onConfirm={onTerminateUser}
                cancelText="취소"
              >
                <Button loading={loading} danger>회원 삭제</Button>
              </Popconfirm>
            </Space>
            :<Button onClick={onAddCustomer} loading={loading}>내 고객으로 등록</Button>
          }
          {isEditAddr?
            <div>
              <br /><br />
              <Title level={4}>주소목록</Title>
              <Space wrap>
                {addrs?.map((v) => {
                  if (v.id === selectedAddr) {
                    return <Button type="primary">{v.addrName}</Button>
                  }
                  return <Button type="dashed" onClick={onAddrSelectClick(v)}>{v.addrName}</Button>
                })}  
              </Space>
              {isAddNewAddr?
                <>
                  <Descriptions 
                    style={{ marginTop: '30px' }}
                    bordered
                  >
                    <Descriptions.Item label="우편번호" span={2}>
                      <Button onClick={() => {setIsDaumZipVisible(true)}}>우편번호 찾기</Button>
                      <input value={newZip} onChange={onChangeNewZip} maxLength={8}></input>
                    </Descriptions.Item>
                    <Descriptions.Item label="주소" span={2}>
                      <input value={newAddr} onChange={onChangeNewAddr} maxLength={100}></input><br />
                      <input value={newAddr2} onChange={onChangeNewAddr2} maxLength={20} placeholder='상세주소'></input>
                    </Descriptions.Item>
                    <Descriptions.Item label="받는분" span={2}>
                      <input value={newName} onChange={onChangeNewName} maxLength={10}></input>
                    </Descriptions.Item>
                    <Descriptions.Item label="받는분 전화번호" span={2}>
                      <input 
                        value={newPhone}
                        onChange={onChangeNewPhone}
                        placeholder=' - 없이 숫자만 입력'
                        maxLength={13}
                        autoComplete="off"
                      ></input>
                    </Descriptions.Item>
                  </Descriptions>
                  <Button onClick={onAddNewAddr}>주소 추가 완료</Button>
                </>
              : <Descriptions 
                style={{ marginTop: '30px' }}
                bordered
                >
                  <Descriptions.Item label="우편번호" span={2}>
                    {zip}
                  </Descriptions.Item>
                  <Descriptions.Item label="주소" span={2}>
                    {address}
                  </Descriptions.Item>
                  <Descriptions.Item label="받는분" span={2}>
                    {name}
                  </Descriptions.Item>
                  <Descriptions.Item label="받는분 전화번호" span={2}>
                    {phone}
                  </Descriptions.Item>
                </Descriptions>
              }
              <br /><br />
              <Space>
                <Button onClick={() => { setIsAddNewAddr(!isAddNewAddr) }}>+ 새로운 주소 생성</Button>
                {selectedAddr? 
                  <Popconfirm
                    title="선택한 주소를 삭제하시겠습니까?"
                    okText="네"
                    onConfirm={onDeleteAddr}
                    cancelText="취소"
                  >
                    <Button danger>선택한 주소 삭제</Button>
                  </Popconfirm>
                :null}
              </Space>
            </div>
          :null}
        </>
        : null
      }
    </Container800>
  </AppLayout>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const cookie = context.req ? context.req.headers.cookie : ''; // 쿠키 넣어주기
  axios.defaults.headers.Cookie = '';
  const key = context.params?.key as string;
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
  if (response.role !== 'PROVIDER' && response.role !== 'ADMINISTRATOR') { // 로그인 안했으면 홈으로
    return {
      redirect: {
        destination: '/unauth',
        permanent: false,
      },
    };
  }
  await queryClient.prefetchQuery(['user'], () => loadMyInfoAPI());
  await queryClient.prefetchQuery(['myItems'], () => loadMyItemsAPI());

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};


export default Customers;
