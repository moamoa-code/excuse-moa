import React, { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { GetServerSidePropsContext } from 'next';
import axios from 'axios';
import { dehydrate, QueryClient } from 'react-query';
import { loadMyInfoAPI } from '../apis/user';
import { ContainerMax, HGap } from '../components/Styled';
import { useMediaQuery } from 'react-responsive';
import styled from 'styled-components';

const IntroContainer = styled.div`
text-align: center;
  .section {
    padding: 69px 25px 69px 25px;
    margin: 10px 0 10px 0;
    text-align: center;
    h1  {
      color: #4e4e4e;
      font-size: 18pt;
    }
    h2 {
      font-size: 14pt;
  }
  :nth-of-type(even) {
    background-color: #f9f9f9;
  }
  .grey {
    color:pink;
    background-color:grey;
  }
  button {
    margin: 5px;
    font-size: 14pt;
    padding: 0 15px;
    height: 40px;
    line-height: 40px;
    background-color: white;
    border: solid 1px #d3d3d3;
    border-radius: 20px;
  }
}
`

// 메인 페이지
const Welcome = () => {
  const [ content, setContent ] = useState('intro');
  const isMobile = useMediaQuery({
    query: "(min-width:0px) and (max-width:768px)",
  });

  return (
    <AppLayout>
        <ContainerMax>
          {content === 'intro' ?
            <IntroContainer>
              <div className='section'>
                <h1>
                  B2B 원두커피 주문관리 시스템
                </h1>
                <h2>
                  소규모 사업자 원두커피 주문 관리에 최적화된 시스템!<br />
                  복잡한 ERP나 수기장부는 이제 그만, 꼭 필요한 기능만 담았습니다.<br />
                  간편하게 원두커피를 주문 해 보세요.
                </h2>
              </div>
              <div className='section grey'>
                <h1>
                  편리한 모바일 인터페이스
                </h1>
                <h2>
                  KIOSK, 온라인 쇼핑몰과 비슷한 친숙한 UI로 간편하게 이용가능합니다.
                </h2>
              </div>
              <div className='section'>
                <h1>
                  판매회원 혹은 구매회원으로 시작해 보세요.
                </h1>
                  <button onClick={()=>setContent('customer')}>구매회원</button>
                    <br />
                  <button onClick={()=>setContent('provider')}>판매회원</button>
              </div>
            </IntroContainer>
          : content === 'customer' ?
            <IntroContainer>
              <div className='section'>
                <h1>
                  시작 방법
                </h1>
                <p>
                  판매자가 생성한 구매회원의 아이디로 로그인 하거나 <br />
                  회원가입 후, 판매자에게 이용신청을 할 수 있습니다. <br />
                  지정된 판매자에 문의하세요!
                </p>
              </div>
            </IntroContainer>
          : content === 'provider' ?
            <IntroContainer>
              <div className='section'>
                <h1>
                  고객 관리
                </h1>
                <p>
                  판매자는 고객을 생성하고 관리할 수 있습니다. <br />
                  따로 회원가입으로 가입한 고객을 판매자의 회원으로 등록할 수 있습니다.
                </p>
              </div>
              <div className='section'>
                <h1>
                  제품 주문
                </h1>
                <p>
                  판매자가 생성한 고객이 직접 시스템을 통해 제품주문이 가능하며<br />
                  판매자가 구매자를 선택해 발주가 가능합니다.
                </p>
              </div>
              <div className='section'>
                <h1>
                  고객 맞춤 관리
                </h1>
                <p>
                  구매자별로 노출가능한 제품, 공지사항을 설정 할 수 있습니다.
                </p>
              </div>
            </IntroContainer>
          :null}
        </ContainerMax>
    </AppLayout>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const cookie = context.req ? context.req.headers.cookie : ''; // 쿠키 넣어주기
  axios.defaults.headers.Cookie = '';
  // const orderId = context.params?.id as string;
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(['user'], loadMyInfoAPI);
  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default Welcome;
