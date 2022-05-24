// 판매자의 제품 리스트
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import React, { useState } from 'react';
import { Button, Table, Typography } from 'antd';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { loadMyInfoAPI, loadProvidersAPI } from '../../../apis/user';
import { loadItemListAPI } from '../../../apis/item';
import AppLayout from '../../../components/AppLayout';
import User from '../../../interfaces/user';
import ItemView from '../../../components/ItemView';
import { DownOutlined, RightOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import UserInfoBox from '../../../components/UserInfoBox';
import { useMediaQuery } from 'react-responsive';
import MyTable from '../../../components/MyTable';
import { ContainerWide, OptionContainer } from '../../../components/Styled';

// const OptionContainer = styled.div`
//   padding: 10px 0px 10px 0px;
//   display: block;
//   overflow:auto;
//   max-height:300px;
//   p {
//     display: inline-block;
//     box-sizing: border-box;
//     border-radius: 4px;
//     padding: 5px 8px 5px 8px;
//     margin: 6px;
//     font-size: 10pt;
//   }
//   p:active {
//     position: relative; 
//     top:2px;
//   }
//   .codeName{
//     background-color:#00B4D8;
//     color: white;
//   }
//   .unit{
//     background-color:#FF5C8D;
//     color: white;
//   }
//   .package{
//     background-color:#ec7728;
//     color: white;
//   }
//   .provider{
//     border: 1px solid #999999;
//   }
// `

const FactoryItemList = () => {
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:768px)",
  });
  // const queryClient = useQueryClient();
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  // const { data: items } = useQuery(['items'], loadItemsAPI);
  const [ loading, setLoading ] = useState(false);
  const { data: providerList } = useQuery('userList', loadProvidersAPI);
  const [ itemList, setItemList ] = useState<any>([]);
  const [selectedProvider, setSelectedProvider] = useState<any>(null) // 선택된 판매자
  const { Title } = Typography;

  const onLoadItems = (v) => () => {
    setLoading(true);
    setSelectedProvider(v);
    loadItemListAPI(v.key)
    .then((result)=>{
      setItemList(result);
    })
    .finally(()=>{
      setLoading(false);
    })
  }
  const columns = [
    {
      title: '판매사',
      dataIndex: 'User',
      type: 'id',
      key: 'User',
      render: (text, record) => (
        <>{text?.company}</>
      ),
    }, {
      title: '제품명',
      dataIndex: 'name',
      type: 'title',
      key: 'name',
      render: (text, record) => (
        <>{text}</>
      ),
    }, {
      title: '포장종류',
      dataIndex: 'packageName',
      key: 'packageName',
    }, {
      title: '무게단위',
      dataIndex: 'unit',
      type: 'right',
      key: 'unit',
    },{
      title: '공급가',
      dataIndex: 'supplyPrice',
      key: 'supplyPrice',
    },
  ];

  const expandable = {
    expandedRowRender: (record) => 
    <ItemView item={record} myUserInfo={myUserInfo} />,
    columnWidth: 20,
    expandIcon: ({ expanded, onExpand, record }) =>
    expanded ? (
      <DownOutlined style={{color: '#64707a', fontSize: '8pt', margin: '0px'}} onClick={e => onExpand(record, e)} />
    ) : (
      <RightOutlined style={{color: '#64707a', fontSize: '8pt'}} onClick={e => onExpand(record, e)} />
    )
  };

  return (
    <AppLayout>
      <ContainerWide>
      <Title level={4}>판매사 선택</Title>
        <OptionContainer>
          {providerList?.map((v)=>{
            return (
              <p className='provider' onClick={onLoadItems(v)}>{v.company}</p>
              ) 
          })}
        </OptionContainer><br />
        {selectedProvider? 
          <UserInfoBox userInfo={selectedProvider}/>
        :null}
        <br /><br />
        <Title level={4}>{selectedProvider?.company} 제품목록</Title>
        {isMobile? 
        <MyTable
          rowKey="id"
          columns={columns}
          expandable={expandable}
          dataSource={itemList}
        />
        :
        <Table
          rowKey="id"
          columns={columns}
          expandable={expandable}
          dataSource={itemList}
        />
        }<br />
        <Link href='/factory/item/regist'><a><Button type='primary'> + 새로운 제품 추가</Button></a></Link>
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

export default FactoryItemList;
