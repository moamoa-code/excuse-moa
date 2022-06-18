import { MenuOutlined, UserOutlined } from "@ant-design/icons";
import { Layout } from "antd";
import Link from "next/link";
import PropTypes from "prop-types";
import React, { FC, useState } from "react";
import { useQuery } from "react-query";
import styled, { createGlobalStyle } from "styled-components";
import { loadMyInfoAPI } from "../apis/user";
import User from "../interfaces/user";
import LoginForm from "./LoginForm";
import { HGap } from "./Styled";
import UserProfile from "./UserProfile";

const { Header, Content, Footer } = Layout;

// antd 스크롤 생기는 버그 픽스용 css코드
const Global = createGlobalStyle`
    .ant-row {
        margin-right: 0 !important;
        margin-left: 0 !important;
    }
    .ant-col:first-child{
        padding-left : 0 !important;
    }
    .ant-col:last-child{
        padding-right: 0 !important;
    }
`;

const HeaderBar = styled.div`
  margin: 0;
  background-color: #ffffff;
  box-shadow: 0 0 8px #999999;
  height: 50px;
`;
const Nav = styled.nav`
  margin: 5px 0px 0px 20px;
  display: flex;
  justify-content: space-between;
`;
const MenuUl = styled.ul<{ horizon: boolean }>`
  display: ${(props) => (props.horizon ? "flex" : "block")};
  list-style: none;
  padding-left: 0;
  @media screen and (max-width: 600px) {
    display: ${(props) => (props.horizon ? "none" : "block")};
  }
`;
const MenuLi = styled.li<
  null | undefined | { underline: boolean | null | undefined }
>`
  @import url("https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@500&display=swap");
  font-family: "Noto Sans KR", sans-serif;
  font-weight: 500;
  display: block;
  font-size: 16px;
  padding: 10px 0;
  margin: 0 15px 0 15px;
  ${(props) => (props.underline ? "border-bottom: 1px solid #dedede" : null)};
  @media screen and (max-width: 600px) {
    height: 50px;
    padding-left: 10px;
  }
`;
const MenuBtn = styled.span`
  position: absolute;
  right: 10px;
  width: 40px;
  padding-top: 10px;
`;
const Logo = styled.div`
  position: absolute;
  right: 80px;
  padding-top: 10px;
`;
const MenuModal = styled.div`
  .container {
    position: absolute;
    margin: 0px;
    right: 0;
    top: 50px;
    z-index: 99;
    width: 320px;
    box-shadow: 0px 17px 35px -10px rgba(0, 0, 0, 0.53);
    background-color: #ffffff;
    @media screen and (max-width: 600px) {
      width: 100%;
    }
  }
`;
const A = styled.a`
  text-decoration: none;
  display: block;
  color: black;
`;

// 앱 기본 레이아웃. antd 활용
const AppLayout: FC = ({ children }) => {
  // const [ myInfo, setMyInfo ] = useState({});
  const { data: myUserInfo } = useQuery<User>("user", loadMyInfoAPI, {
    // onSuccess: (data) => {
    //   setMyInfo(myUserInfo);
    // }
  });
  const [showMenuModal, setShowMenuModal] = useState(false);

  const onShowMenuModal = () => {
    setShowMenuModal((showMenuModal) => !showMenuModal);
  };

  return (
    <Layout>
      <Global />
      <HeaderBar>
        <Nav>
          <MenuUl horizon={true}>
            <MenuLi underline={false}>
              <Link href="/">
                <A>
                  <span style={{ width: "100%" }}>홈</span>
                </A>
              </Link>
            </MenuLi>
            {myUserInfo?.role === "CUSTOMER" ? (
              <>
                <MenuLi underline={false}>
                  <Link href={`/post/list`}>
                    <A>공지사항</A>
                  </Link>
                </MenuLi>
                <MenuLi underline={false}>
                  <Link href={`/order/order-items`}>
                    <A>주문하기</A>
                  </Link>
                </MenuLi>
                <MenuLi underline={false}>
                  <Link href={`/inventory`}>
                    <A>재고관리</A>
                  </Link>
                </MenuLi>
                <MenuLi underline={false}>
                  <Link href={`/item/order/list/${myUserInfo?.id}`}>
                    <A>주문목록</A>
                  </Link>
                </MenuLi>
              </>
            ) : null}
            {myUserInfo?.role === "PROVIDER" ? (
              <>
                <MenuLi underline={false}>
                  <Link href={`/management/check-order/list`}>
                    <A>주문확인</A>
                  </Link>
                </MenuLi>
                <MenuLi underline={false}>
                  <Link href={`/management/add-order`}>
                    <A>주문추가</A>
                  </Link>
                </MenuLi>
                <MenuLi underline={false}>
                  <Link href={`/inventory`}>
                    <A>재고관리</A>
                  </Link>
                </MenuLi>
                <MenuLi underline={false}>
                  <Link href={`/management`}>
                    <A>판매자페이지</A>
                  </Link>
                </MenuLi>
              </>
            ) : null}
            {myUserInfo?.role === "ADMINISTRATOR" ? (
              <>
                <MenuLi underline={false}>
                  <Link href={`/factory/order-list`}>
                    <A>주문현황</A>
                  </Link>
                </MenuLi>
                <MenuLi underline={false}>
                  <Link href={`/factory/add-order`}>
                    <A>주문추가</A>
                  </Link>
                </MenuLi>
                <MenuLi underline={false}>
                  <Link href={`/factory/orders`}>
                    <A>출하량분석</A>
                  </Link>
                </MenuLi>
                <MenuLi underline={false}>
                  <Link href={`/inventory`}>
                    <A>재고관리</A>
                  </Link>
                </MenuLi>
                <MenuLi underline={false}>
                  <Link href={`/factory`}>
                    <A>관리자페이지</A>
                  </Link>
                </MenuLi>
              </>
            ) : null}
          </MenuUl>
          <Logo>
            <Link href="/">
              <A>Moa-Order</A>
            </Link>
          </Logo>
          <MenuBtn onClick={onShowMenuModal}>
            <MenuOutlined />
            <UserOutlined />
          </MenuBtn>
        </Nav>
      </HeaderBar>
      {showMenuModal ? (
        <MenuModal>
          <div className="container">
            {myUserInfo ? <UserProfile /> : <LoginForm />}
            <MenuUl horizon={false}>
              <MenuLi underline={true}>
                <Link href="/">
                  <A>홈</A>
                </Link>
              </MenuLi>
              {myUserInfo?.role === "PROVIDER" ? (
                <>
                  <MenuLi underline={true}>
                    <Link href={`/management/check-order/list`}>
                      <A>주문확인</A>
                    </Link>
                  </MenuLi>
                  <MenuLi underline={true}>
                    <Link href={`/management/add-order`}>
                      <A>주문추가</A>
                    </Link>
                  </MenuLi>
                  <MenuLi underline={true}>
                    <Link href={`/inventory`}>
                      <A>재고관리</A>
                    </Link>
                  </MenuLi>
                  <MenuLi underline={true}>
                    <Link href={`/management`}>
                      <A>판매자페이지</A>
                    </Link>
                  </MenuLi>
                  <HGap />
                  <MenuLi underline={true}>
                    <Link href={`/intro`}>
                      <A>About Moa-order</A>
                    </Link>
                  </MenuLi>
                  <p></p>
                  <br />
                </>
              ) : null}
              {myUserInfo?.role === "ADMINISTRATOR" ? (
                <>
                  <MenuLi underline={true}>
                    <Link href={`/factory/order-list`}>
                      <A>주문현황</A>
                    </Link>
                  </MenuLi>
                  <MenuLi underline={true}>
                    <Link href={`/factory/add-order`}>
                      <A>주문추가</A>
                    </Link>
                  </MenuLi>
                  <MenuLi underline={true}>
                    <Link href={`/factory/orders`}>
                      <A>출하량분석</A>
                    </Link>
                  </MenuLi>
                  <MenuLi underline={true}>
                    <Link href={`/inventory`}>
                      <A>재고관리</A>
                    </Link>
                  </MenuLi>
                  <MenuLi underline={true}>
                    <Link href={`/factory`}>
                      <A>관리자페이지</A>
                    </Link>
                  </MenuLi>
                  <HGap />
                  <MenuLi underline={true}>
                    <Link href={`/intro`}>
                      <A>About Moa-order</A>
                    </Link>
                  </MenuLi>
                  <p></p>
                  <br />
                </>
              ) : null}
              {myUserInfo?.role === "CUSTOMER" ? (
                <>
                  <MenuLi underline={true}>
                    <Link href="/post/list">
                      <A>공지사항</A>
                    </Link>
                  </MenuLi>
                  <MenuLi underline={true}>
                    <Link href="/order/order-items">
                      <A>주문하기</A>
                    </Link>
                  </MenuLi>
                  <MenuLi underline={true}>
                    <Link href={`/item/order/list/${myUserInfo?.id}`}>
                      <A>주문목록</A>
                    </Link>
                  </MenuLi>
                  <MenuLi underline={true}>
                    <Link href={`/inventory`}>
                      <A>재고관리</A>
                    </Link>
                  </MenuLi>
                  <HGap />
                  <MenuLi underline={true}>
                    <Link href={`/intro`}>
                      <A>About Moa-order</A>
                    </Link>
                  </MenuLi>
                </>
              ) : null}
            </MenuUl>
          </div>
        </MenuModal>
      ) : null}
      <Content
        style={{
          backgroundColor: "#ffffff",
          marginTop: "20px",
          paddingTop: "10px",
        }}
      >
        {children}
        <br />
        <br />
      </Content>
      <Footer>
        <div>
          <span>Excuse-Moa 기능장애 문의: 010-6283-8520</span>
        </div>
      </Footer>
    </Layout>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppLayout;
