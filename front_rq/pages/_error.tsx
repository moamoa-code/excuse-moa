import React from 'react';
import AppLayout from '../components/AppLayout';

// -- 500에러 등 표시 페이지 --
const Error = () => {
  return (
    <AppLayout>
      <h1>잘못된 요청입니다.</h1>
    </AppLayout>
  )
}

export default Error;