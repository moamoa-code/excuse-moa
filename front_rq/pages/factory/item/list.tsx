// 판매자의 제품 리스트
import axios from 'axios';
import { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import React, { useState } from 'react';
import { Button, message, Table, Typography } from 'antd';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { loadMyInfoAPI, loadProvidersAPI } from '../../../apis/user';
import { loadItemListAPI, loadItemsAPI, loadMyItemsAPI } from '../../../apis/item';
import AppLayout from '../../../components/AppLayout';
import ItemList from '../../../components/ItemList'; // 제품 상세정보 보기 컴포넌트
import User from '../../../interfaces/user';
import Item from '../../../interfaces/item';
import styled from 'styled-components';
import ItemView from '../../../components/ItemView';
import { DownOutlined, RightOutlined, ShoppingCartOutlined } from '@ant-design/icons';

const Container800 = styled.div`
max-width: 800px;
padding: 20px;
margin: 0 auto;
@media screen and (max-width: 600px) {
  padding: 10px;
}
`

const OptionContainer = styled.div`
  padding: 10px 0px 10px 0px;
  display: block;
  overflow:auto;
  max-height:300px;
  p {
    display: inline-block;
    box-sizing: border-box;
    border-radius: 4px;
    padding: 5px 8px 5px 8px;
    margin: 6px;
    font-size: 10pt;
  }
  p:active {
    position: relative; 
    top:2px;
  }
  .codeName{
    background-color:#00B4D8;
    color: white;
  }
  .unit{
    background-color:#FF5C8D;
    color: white;
  }
  .package{
    background-color:#ec7728;
    color: white;
  }
  .provider{
    border: 1px solid #999999;
  }
`

const FactoryItemList = () => {
  const router = useRouter();
  // const queryClient = useQueryClient();
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { data: items } = useQuery(['items'], loadItemsAPI);
  const [ loading, setLoading ] = useState(false);
  const { data: providerList } = useQuery('userList', loadProvidersAPI);
  const [ itemList, setItemList ] = useState<any>([]);
  const [selectedProvider, setSelectedProvider] = useState<any>({}) // 선택된 판매자
  const { Title } = Typography;

  const onLoadItems = (v) => () => {
    setLoading(true);
    setSelectedProvider(v);
    loadItemListAPI(v.id)
    .then((result)=>{
      setItemList(result);
    })
    .finally(()=>{
      setLoading(false);
    })
  }

  return (
    <AppLayout>
      <Container800>
      <Title level={4}>판매사 선택</Title>
        <OptionContainer>
          {providerList?.map((v)=>{
            return (
              <p className='provider' onClick={onLoadItems(v)}>{v.company}</p>
              ) 
          })}
        </OptionContainer><br /><br />
        <Title level={4}>{selectedProvider?.company} 제품목록</Title>
        <Table
        size="small"
        rowKey="id"
        columns={
          [
            {
              title: '판매사',
              dataIndex: 'User',
              key: 'User',
              render: (text, record) => (
                <>{text?.company}</>
              ),
            }, {
              title: '제품명',
              dataIndex: 'name',
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
              key: 'unit',
            },{
              title: '공급가',
              dataIndex: 'supplyPrice',
              key: 'supplyPrice',
            },
          ]}
        expandable={{
          expandedRowRender: (record) => 
          <ItemView item={record} myUserInfo={myUserInfo} />,
          columnWidth: 20,
          expandIcon: ({ expanded, onExpand, record }) =>
          expanded ? (
            <DownOutlined style={{color: '#64707a', fontSize: '8pt', margin: '0px'}} onClick={e => onExpand(record, e)} />
          ) : (
            <RightOutlined style={{color: '#64707a', fontSize: '8pt'}} onClick={e => onExpand(record, e)} />
          )
        }}
        dataSource={itemList}
        />
        <Link href='/factory/item/regist'><a><Button type='primary'> + 새로운 제품 추가</Button></a></Link>
      </Container800>
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
  if (response.role !== 'PROVIDER' && response.role !== 'ADMINISTRATOR') { // 로그인 안했으면 홈으로
    return {
      redirect: {
        destination: '/unauth',
        permanent: false,
      },
    };
  }
  await queryClient.prefetchQuery(['user'], () => loadMyInfoAPI());
  await queryClient.prefetchQuery(['items'], () => loadMyItemsAPI());
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default FactoryItemList;
