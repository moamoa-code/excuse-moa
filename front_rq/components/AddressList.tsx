// @ts-nocheck
// -> UseRef 문제 해결 못함
// 주소 등록 폼, 다음 주소 API 활용
import React, { useCallback, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import Link from 'next/link';
import { Select, Descriptions, Typography, Space, Tag, Button } from 'antd';
import { LinkOutlined, PlusOutlined } from '@ant-design/icons';

const AddressList = forwardRef((props, ref) => {
  const { editable } = props;
  const { Option } = Select;
  const { Text } = Typography;
  const [ name, setName ] = useState('');
  const [ phone, setPhone ] = useState('');
  const [ address, setAddress ] = useState('');
  const onChangeAddr = (value) => {
    if (value === 'nope!'){
      props.setId();
      props.setName('');
      setName('');
      props.setPhone('');
      setPhone('');
      props.setAddress('');
      setAddress('');
      return;
    }
    const data = props.addrs?.find((v) => v.id === value);
    props.setId(data.id);
    props.setName(data.name);
    setName(data.name);
    props.setPhone(data.phone);
    setPhone(data.phone);
    props.setAddress(data.address);
    setAddress(data.address);
    props.setZip(data.zip);
  };

  useImperativeHandle(ref, () => ({
    setInit() {
      props.setId();
      setName('');
      setPhone('');
      setAddress('');
    },
  }));

  return (
    <>
      <Space>
        <Select
          placeholder="내 주소 목록"
          onChange={onChangeAddr}
        >
          <Option value='nope!'>선택안함</Option>
          {
            props.addrs?.map((v) => (
              <Option value={v.id}>{v.addrName}</Option>
            ))
          }
        </Select>
        <Link href="/user/regist-addr"><a><Button type="primary"><PlusOutlined />주소추가</Button></a></Link>
      </Space>
      <Descriptions 
        bordered
        size="small"
        style={{ marginTop: '10px' }}
      >
        <Descriptions.Item span={3} label="주소">
          {address}
        </Descriptions.Item>
        <Descriptions.Item label="받는분">
          {!props?.editable?
            <Text>{name}</Text>
            :
            <Text editable={{ onChange: (value) => {
              setName(value);
              props.setName(value);
            }}}>{name}</Text>
          }
        </Descriptions.Item>
        <Descriptions.Item label="받는분 전화번호">
          {!props?.editable?
              <Text>{phone}</Text>  
            :
            <Text editable={{ onChange: (value) => {
              setPhone(value);
              props.setPhone(value);
            }}}>{phone}</Text>  
          }
        </Descriptions.Item>
      </Descriptions>
    </>
  );
});

export default AddressList;