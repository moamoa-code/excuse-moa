import { Result } from "antd";
import React from "react";
import AppLayout from "../components/AppLayout";

// -- 열람권한 오류 페이지 --
const UnAuthError = () => {
  return (
    <AppLayout>
      <Result
        status="error"
        title="열람 권한이 없습니다."
        extra={<>관리자에 문의하세요.</>}
      />
    </AppLayout>
  );
};

export default UnAuthError;