// 상품 수정
import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';
import React, { useCallback, useState } from 'react';
import { Form, Input, Button, Tag, Checkbox, Divider, Space, notification, message } from 'antd';
import { useRouter } from 'next/router';
import { dehydrate, QueryClient, useQuery, useMutation, useQueryClient } from 'react-query';
import { loadMyInfoAPI, loadProviderAPI } from '../../../../apis/user';
import { loadItemAPI, addCustomerToItemAPI } from '../../../../apis/item';
import useInput from '../../../../hooks/useInput';
import AppLayout from '../../../../components/AppLayout';
import User from '../../../../interfaces/user';
import Item from '../../../../interfaces/item';
import ItemEdit from '../../../../components/ItemEdit';
import { CheckCircleOutlined } from '@ant-design/icons';
import Router from 'next/router';

const EditItem = () => {
  const router = useRouter();
  // const queryClient = useQueryClient();
  const { id } = router.query; // 제품의 id
  const [providerId, setProviderId] = useState('');
  const [provider, setProvider] = useState<any>('');
  const { data: myUserInfo } = useQuery<User>('user', loadMyInfoAPI);
  const { data: item } = useQuery<any>(['item', id], () => {
    return loadItemAPI(Number(id))    
  },{
    onSuccess: (item) => {
      setProviderId(item.UserId);
      loadProviderAPI(String(item.UserId))
      .then((response) => {
        setProvider(response);
      })
      .catch((error) => {
        message.error(error.response.data);
      })
    }
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [customerId, onChangeCustomerId] = useInput(''); //

  const openNotification = (text) => {
    notification.open({
      message: `${text}`,
      description:
        ``,
      icon: <CheckCircleOutlined style={{ color: '#108ee9' }} />,
      duration: 2,
    });
  };

  const onSubmit = (values) => {
    console.log(values);
    const itemId = Number(id);
    setLoading(true);
    addCustomerToItemAPI({ itemId, values })
    .then(() => {
      openNotification('제품을 열람가능한 고객 추가를 완료했습니다.')
    })
    .finally(() => {
      setLoading(false);
    })
  }
  return (
    <AppLayout>
      <div style={{maxWidth: '800px', padding: '10px', margin: '0 auto'}}>
        <ItemEdit item={item} myUserInfo={myUserInfo} />
        <br/><br/>
        <Divider orientation="left" style={{ marginTop: '30px' }}>열람가능한 고객 추가</Divider>
        <Form 
          encType="multipart/form-data"
          onFinish={onSubmit}
          initialValues={{ // 제품 볼 수 있는 유저 체크
            'customerIds': item.ItemViewUsers.map((v) => (v.id)),
          }}
        >
          <Form.Item name="customerIds">
            <Checkbox.Group>
              <Space size={8} wrap>
                {provider.Customers? 
                  <>
                    {provider.Customers?.map((v) => (
                      <Tag color="blue"><Checkbox value={v.id}>{v.company} / {v.name}</Checkbox> </Tag>
                    ))} 
                  </>
                : null}
              </Space>
            </Checkbox.Group>
          </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            적용 완료
          </Button>
          <Button onClick={()=> (Router.replace(`/factory/item/list`))}>목록으로 돌아가기</Button>
        </Space>
        </Form>
        {/* <Form 
          style={{ margin: '10px 0 20px' }}
          encType="multipart/form-data"
          onFinish={onSubmit}
          initialValues={{ // 제품 볼 수 있는 유저 체크
            'customerIds': item.ItemViewUsers.map((v) => (v.id)),
          }}
        >
        <Divider orientation="left" style={{ marginTop: '30px' }}>열람가능한 고객 추가</Divider>
          <Form.Item name="customerIds">
            <Checkbox.Group>
              <Space size={8} wrap>
                {myUserInfo.Customers.map((v) => (
                  <>
                    <Tag color="blue"><Checkbox value={v.id}>{v.company} / {v.name}</Checkbox> </Tag>
                  </>
                ))}
              </Space>
            </Checkbox.Group>
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              적용 완료
            </Button>
            <Button onClick={()=> (Router.replace(`/management/items`))}>목록으로 돌아가기</Button>
          </Space>
        </Form> */}
      </div>
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
        destination: '/',
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
  const id = context.params?.id as string;
  await queryClient.prefetchQuery(['user'], () => loadMyInfoAPI());
  await queryClient.prefetchQuery(['item', id], () => loadItemAPI(Number(id)));
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default EditItem;
