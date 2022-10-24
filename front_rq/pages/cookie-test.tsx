import type { NextPage } from 'next';
import React, { useState } from 'react';
import { useCookies } from 'react-cookie';
import { Button, Input } from 'antd';
import axios from 'axios';
import AppLayout from '../components/AppLayout';
import { backUrl } from '../config/config';

const Tests: NextPage = () => {
  const [input1, setInput1] = useState('');
  const [cookies, setCookie] = useCookies(['test1', 'test2']);
  const [response, setResponse] = useState(null);

  axios.defaults.baseURL = `${process.env.NEXT_PUBLIC_API_URL}/api`;
  axios.defaults.withCredentials = true; // 쿠키 포함

  const onChangeInput1 = (e) => {
    setInput1(e.target.value);
  };

  const onSaveCookieInput1 = (e) => {
    setCookie('test1', input1);
    setCookie('test2', 'test222');
  };

  const onLoadCookieInput1 = () => {};

  const onFetchData = () => {
    console.log('시도');
    axios.defaults.baseURL = backUrl;
    axios.defaults.withCredentials = true; // 쿠키 포함
    axios.get(`/test/cookie`).then((res) => {
      console.log(res);
      setResponse(res.data);
    }).catch((error)=>console.log(error))
  };

  return (
    <AppLayout>
      <Input onChange={onChangeInput1} value={input1} />
      <Button onClick={onSaveCookieInput1}>쿠키에 저장</Button>
      <hr />
      cookies?.test1: {JSON.stringify(cookies?.test1)}
      <hr />
      cookies?.test2: {JSON.stringify(cookies?.test2)}
      <Button type="primary" onClick={onFetchData}>
        서버에 전송
      </Button>
      <hr />
      res: {JSON.stringify(response)}
      <hr />
      {JSON.stringify(cookies)}
    </AppLayout>
  );
};

export default Tests;
