import React from 'react';
import AppLayout from '../components/AppLayout';

const UnAuthError = () => {
  return (
    <AppLayout>
      <h1>열람 권한이 없습니다.</h1>
      <h4>관리자에게 문의하십시오.</h4>
    </AppLayout>
  )
}

export default UnAuthError;