import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState, useRef, useEffect } from 'react';
import { dehydrate, QueryClient, useQuery, useQueryClient } from 'react-query';
import Head from 'next/head';
import { Form, Input, Button, notification, 
  Space, Descriptions, Table, Select, message, Popconfirm, Modal } from 'antd';
import { Typography } from 'antd';
import styled from 'styled-components';
import dayjs from 'dayjs';

import { loadMyInfoAPI, loadUserAPI, loadAllUserListAPI, 
  updateUserRoleAPI, updateUserAPI, changePasswordAPI, terminateUserAPI, loadAddrsAPI, addNewAddrAPI, removeAddrAPI, searchUsersByCompanyAPI, updateMemoAPI } from '../../../apis/user';
import AppLayout from '../../../components/AppLayout';
import User from '../../../interfaces/user';
import useInput from '../../../hooks/useInput';
import Link from 'next/link';
import DaumPostcode from 'react-daum-postcode';
import { SearchOutlined } from '@ant-design/icons';
import OrderList from '../../../components/OrderList'
import { ContainerWide, HGap, MoDal, SearchBlock } from '../../../components/Styled';
import { useMediaQuery } from 'react-responsive';
import MyTable from '../../../components/MyTable';

const UserList = () => {
  const { Title } = Typography;
  const [loading, setLoading] = useState(false);
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  // const { data: userList } = useQuery('userList', loadAllUserListAPI);
  const [form] = Form.useForm();
  const [ userList, setUserList ] = useState(null);

  // 유저정보
  const [ uId, setUid ] = useState('');
  const [ uKey, setuKey ] = useState('');
  const [ keyValidError, setKeyValidError ] = useState(false);
  const [ uCompany, onChangeUcompany, setUcompany ] = useInput('');
  const [ uName, onChangeUname, setUname ] = useInput('');
  const [ uPhone, setUphone ] = useState('');
  const [ uEmail, onChangeUemail, setUemail ] = useInput('');
  const [ uMemo, onChangeUMemo, setMemo ] = useInput('');
  const [ myProvider, setMyProvider ] = useState<any>({});
  const [ password, onChangePassword, setPassword ] = useInput('');
  const [ uRole, setUrole ] = useState('');
  const [ uItems, setUitems ] = useState([]);
  const [ uDate, setUdate ] = useState('');
  const [ isVisible, setIsvisible ] = useState(false);
  const [ isEditable, setIsEditable ] = useState(false);
  const [ isPasswordEdit, setIsPasswordEdit ] = useState(false);
  const [ uRoleToChange, setUroleToChange ] = useState('');
  const [ userInfo, setUserInfo] = useState({});
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
  // 검색
  const [ searchTxt, onChangeSearchTxt, setSearchTxt ] = useInput('');
  const [ searchType, setSearchType ] = useState('COMPANY');
  // 주문목록
  const [ isCustomerOrdersModal, setIsCustomerOrdersModal ] = useState(false);
  const [ isProviderOrdersModal, setIsProviderOrdersModal ] = useState(false);
  // 회원목록 페이징 관련
  const [ isPagination, setIsPagenation ] = useState(false);
  const [ page, setPage ] = useState(1);
  const [ count, setCount ] = useState(0); // inventories.count


  const divRef = useRef<HTMLDivElement>(null);
  const modalOutside = useRef(); // 모달 바깥부분 클릭시 닫기 위한 ref
  const { Option } = Select;
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:768px)",
  });

  const onChangeUKey = useCallback( // 아이디 유효성검사
  (e) => {
    const regExpId = /^[A-Za-z0-9-@.]{1,25}$/;
    setuKey(e.target.value);
    setKeyValidError(!regExpId.test(e.target.value));
  },
  [uKey],
);

const onChangeUphone = (e) => {
  const { value } = e.target;
  const onlyNumber = value.replace(/[^0-9]/g, '');
  // const regExpPhone = /[^0-9]/;
  setUphone(onlyNumber);
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

  const onViewUserInfo = (key) => () => { // 회원정보 보기
    setIsvisible(false);
    setLoading(true);
    loadUserAPI(String(key))
      .then((response) => {
        setUserInfo(response);
        if (response.Providers?.length >= 1) {
          setMyProvider(response.Providers[0]);
        }
        setUid(response.id);
        setuKey(response.key);
        setKeyValidError(false);
        setUcompany(response.company);
        setUname(response.name);
        setUphone(response.phone);
        setUemail(response.email);
        setMemo(response?.memo);
        setUrole(response.role);
        setUdate(response.createdAt);
        setUroleToChange(response.role);
        setPassword('');
        setIsPasswordEdit(false);
        if (response.UserViewItems){
          setUitems(response.UserViewItems);
        } else {
          setUitems([]);
        }
        form.resetFields();
        initAddrStates();
        setIsvisible(true);
        divRef.current?.scrollIntoView({ behavior: 'smooth' });
      })
      .catch((error) => {
        message.error(error.response.data);
        setLoading(false);
        setIsvisible(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleRoleChange = (value) => {
    setUroleToChange(value);
  }

  // 회원등급 변경
  const onReqChangeRole = () => {
    setLoading(true);
    if (uRoleToChange === '' || uId === ''){
      message.error('선택 안한 항목이 있습니다.');
    }
    const data = {userId: uId, role: uRoleToChange};
    updateUserRoleAPI(data)
    .then((response) => {
      message.success('회원구분 변경을 완료했습니다.');
      setUserList(null);
    })
    .catch((error) => {
      alert(error.response.data);
      setLoading(false);
      setIsvisible(false);
    })
    .finally(() => {
      setLoading(false);
    });
  }

  // 회원정보 수정
  const onReqUserEdit = () => {
    if (keyValidError) {
      return message.error('아이디를 올바르게 입력해 주세요.')
    }
    setLoading(true);
    const data = {userKey: uKey, userId: uId, company:uCompany, role: uRoleToChange, name: uName, phone: uPhone, email: uEmail};
    updateUserAPI(data)
    .then((response) => {
      message.success('회원정보 수정을 완료했습니다.');
      setUserList(null);
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

  const onReqUpdateMemo = (id) => {
    updateMemoAPI({userId: id, memo: uMemo})
    .then((response) => {
      message.success('회원 메모를 추가했습니다.');
    })
    .catch((error) => {
      message.error(error.response.data);
    })
    .finally(() => {
      setLoading(false);
    });
  }

  const onTerminateUser = () => {
    setLoading(true);
    terminateUserAPI({userKey: uKey})
    .then((response) => {
      message.success('회원삭제를 완료했습니다.');
      initAddrStates();
      setUid('');
      setuKey('');
      setKeyValidError(false);
      setUcompany('');
      setUname('');
      setUphone('');
      setUemail('');
      setMemo('');
      setUrole('');
      setUroleToChange('');
      setUdate('');
      setPassword('');
      setUserList(null);
      setIsPasswordEdit(false);
      setIsvisible(false);
    })
    .catch((error) => {
      alert(error.response.data);
    })
    .finally(() => {
      setLoading(false);
    });
  }
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

  // 모든 회원 목록 불러오기 // 페이징
  const onLoadAllUsers = (page) => {
    setLoading(true);
    loadAllUserListAPI(page)
    .then((response) => {
      setIsPagenation(true);
      setUserList(response?.rows);
      setCount(response?.count);
    })
    .catch((error) => {
      message.error(error.response.data);
    })
    .finally(() => {
      setLoading(false);
    });
  }

  // 회원 검색
  const onSearchClick = () => {
    setLoading(true);
    if (searchTxt === '') {
      setLoading(false);
      return message.error('값을 입력해주세요.')
    }
    if (searchType === 'KEY') {
      setIsvisible(false);
      loadUserAPI(String(searchTxt).trim())
        .then((response) => {
          setUserInfo(response);
          setUid(response.id);
          setuKey(response.key);
          setKeyValidError(false);
          setUcompany(response.company);
          setUname(response.name);
          setUphone(response.phone);
          setUemail(response.email);
          setMemo(response?.memo);
          setUrole(response.role);
          setUroleToChange(response.role);
          setUdate(response.createdAt);
          setPassword('');
          setIsPasswordEdit(false);
          if (response.UserViewItems){
            setUitems(response.UserViewItems)
          } else {
            setUitems([])
          }
          form.resetFields();
          initAddrStates();
          setIsvisible(true);
          divRef.current?.scrollIntoView({ behavior: 'smooth' });
        })
        .catch((error) => {
          message.error(error.response.data);
          setLoading(false);
          setIsvisible(false)
        })
        .finally(() => {
          setLoading(false);
        });
    }
    if (searchType === 'COMPANY') {
      searchUsersByCompanyAPI(searchTxt)
      .then((response) => {
        setIsPagenation(false);
        setUserList(response);
      })
      .catch((error) => {
        message.error(error.response.data);
        setSearchTxt('');
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
    }
  };

  const onSearchTypeChange = (e) => {
    setSearchType(e.target.value);
  }

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

  const changePage = (page, pageSize) => (clickedPage) => {
    // message.success(clickedPage)
    onLoadAllUsers(clickedPage);
    setPage(clickedPage);
  }

  const pagination = {
    total: count,
    onChange: changePage(page, 10),
  }

  const userTableColumns = [
    {
      title: '아이디',
      dataIndex: 'key',
      type: 'id',
      key: 'key',
      render: (text, record) => 
        {
          return(<span onClick={onViewUserInfo(text)}>{text}</span>)
        },
    }, {
      title: '회사명',
      dataIndex: 'company',
      type: 'title',
      key: 'company',
    }, {
      title: '회원구분',
      key: 'role',
      dataIndex: 'role',
      filters: [
        {
          text: '판매자',
          value: 'PROVIDER'
        }, {
          text: '구매자',
          value: 'CUSTOMER'
        }, {
          text: '비회원',
          value: 'NOVICE'
        }, {
          text: '탈퇴요청',
          value: 'RESIGNED'
        }, {
          text: '삭제완료',
          value: 'TERMINATED'
        }, 
      ],
      onFilter: (value, record) => record.role?.indexOf(value) === 0,
    }, {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
    }, {
      title: '',
      key: 'action',
      type: 'right',
      render: (text, record) => (
        <span style={{color: '#4aa9ff'}} onClick={onViewUserInfo(record.key)} >보기</span>
      ),
    },
  ]

  return (
  <AppLayout>
    <ContainerWide>
      <Head>
        <title>고객 등록</title>
      </Head>
      <Title level={4} style={{ marginTop: '30px' }} >회원 검색</Title>
      <SearchBlock>
        <div>
          <select name='searchType' onChange={onSearchTypeChange}>
            <option key='COMPANY' value='COMPANY'>회사명</option>
            <option key='KEY' value='KEY'>사업자등록번호(ID)</option>
          </select>
          <input
            value={searchTxt}
            onChange={onChangeSearchTxt}
          />
          <button type='button' className='search' onClick={onSearchClick}>
            <SearchOutlined />
          </button>
        </div>
        <button 
          type='button' 
          onClick={()=>onLoadAllUsers(page)}>
            전체목록
        </button>
      </SearchBlock>
      <Title level={4} >회원 목록</Title>
      {isMobile?
        <MyTable 
          rowKey="id"
          loading={loading}
          columns={userTableColumns}
          dataSource={userList}
          pagination={isPagination?pagination:null}
        />
      :
        <Table 
          loading={loading}
          size="small"
          rowKey="id"
          columns={userTableColumns}
          dataSource={userList}
          pagination={isPagination?pagination:null}
        />
      }
      <HGap /><HGap />
      {isVisible ? 
        <div id={'editForm'} ref={divRef}>
          <br/>
          <span style={{fontSize:'15pt', fontWeight:'bold'}}>회원 정보 </span>
          <Button 
            loading={loading}
            onClick={() => {
              setIsEditable(!isEditable);
            }}
          >
            수정모드
          </Button>
          <br />
          <Descriptions 
            style={{ marginTop: '30px' }}
            bordered
          >
            <Descriptions.Item label="회원번호" span={2}>
              {uId}
            </Descriptions.Item>
            <Descriptions.Item label="아이디/사업자번호" span={2}>
              {isEditable?
                <input
                  value={uKey}
                  onChange={onChangeUKey}
                />
                :
                <input
                  value={uKey}
                  onChange={onChangeUKey}
                  disabled
                />
              }
            </Descriptions.Item>
            <Descriptions.Item label="회사명" span={2}>
              {isEditable?
                <input
                  value={uCompany}
                  onChange={onChangeUcompany}
                />
                :
                <input
                  value={uCompany}
                  onChange={onChangeUcompany}
                  disabled
                />
              }
            </Descriptions.Item>
            <Descriptions.Item label="담당자 성함" span={2}>
              {isEditable?
                <input
                  value={uName}
                  onChange={onChangeUname}
                />
                :
                <input
                  value={uName}
                  onChange={onChangeUname}
                  disabled
                />
              }
            </Descriptions.Item>
            <Descriptions.Item label="담당자 전화번호" span={2}>
              {isEditable?
                <input
                  value={uPhone}
                  onChange={onChangeUphone}
                />
                :
                <input
                  value={uPhone}
                  onChange={onChangeUphone}
                  disabled
                />
              }
            </Descriptions.Item>
            <Descriptions.Item label="담당자 이메일" span={2}>
              {isEditable?
                <input
                  value={uEmail}
                  onChange={onChangeUemail}
                />
                :
                <input
                  value={uEmail}
                  onChange={onChangeUemail}
                  disabled
                />
              }
            </Descriptions.Item>
            <Descriptions.Item label="가입일자" span={2}>
                {dayjs(uDate).format('YYYY/MM/DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="회원구분" span={2}>
              <Space>
                <Select
                  onChange={handleRoleChange}
                  defaultValue={uRole}
                >
                  <Option value='PROVIDER'>판매자</Option>
                  <Option value='CUSTOMER'>구매자</Option>
                  <Option value='NOVICE'>비회원</Option>
                  <Option value='RESIGNED'>탈퇴요청</Option>
                </Select>
                {isEditable?
                    null
                  :
                  <Button 
                    loading={loading} onClick={onReqChangeRole} type='primary'> 
                    변경하기
                  </Button>
                }
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="판매사" span={2}>
              {myProvider?.company} / {myProvider?.key}
            </Descriptions.Item>
            <Descriptions.Item label="주문목록" span={2}>
              <Space>
                <Button onClick={()=>setIsCustomerOrdersModal(true)}>구매주문</Button>
                <Button onClick={()=>setIsProviderOrdersModal(true)}>판매주문</Button>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="메모" span={2}>
              <Space>
                <input value={uMemo} onChange={onChangeUMemo} maxLength={29}></input>
                <Button onClick={()=>onReqUpdateMemo(uId)}>메모수정</Button>
              </Space>
            </Descriptions.Item>
          </Descriptions><br />
          <Space>
            {isEditable?
              <Button 
                loading={loading} type='primary' onClick={onReqUserEdit}>회원정보 수정</Button>
              : null
            }
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
        </div>
      : null}<br/><br/>
      <Link href='/factory/user/create'><a><Button 
        loading={loading} type='primary'>+ 회원 생성</Button></a></Link>
    </ContainerWide>
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
    {isProviderOrdersModal?
      <MoDal 
        ref={modalOutside}
        onClick={(e)=>{
          if(modalOutside.current === e.target) {
            setIsProviderOrdersModal(false)}
        }}
      >
        <div className='contents'>
          <OrderList userInfo={userInfo} mode="PROVIDER"/>
          <div className='close'>
            <Button onClick={() => { setIsProviderOrdersModal(false) }}>닫기</Button>
          </div>
        </div>
      </MoDal>
    :null}
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
  if (!response) { // 로그인 안했으면 홈으로
    return {
      redirect: {
        destination: '/unauth',
        permanent: false,
      },
    };
  }
  if (response.role !== 'ADMINISTRATOR') { // 관리자 권한
    return {
      redirect: {
        destination: '/unauth',
        permanent: false,
      },
    };
  }
  await queryClient.prefetchQuery(['user'], () => loadMyInfoAPI());

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default UserList;
