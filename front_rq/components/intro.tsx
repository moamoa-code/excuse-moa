import { Button, Carousel, message } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import MyDivCarousel from './MyDivCaousel';
import { ContainerMax, HGap } from './Styled';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const IntroContainer = styled.div`
  a {color: #4e4e4e; text-decoration: none; outline: none}
  a:hover, a:active {text-decoration: none; color: #4e4e4e;}
  text-align: center;
  .section {
    padding: 90px 25px 90px 25px;
    text-align: center;
    h1  {
      color: #4e4e4e;
      font-size: 19pt;
    }
    h2 {
      font-size: 13pt;
    }
  // :nth-of-type(even) {
  //   background-color: #f9f9f9;
  // }
    @media screen and (max-width: 600px) {
      padding: 50px 20px 50px 20px;
    }
    .logo{
      margin: 20px;
      span {
        font-size: 41pt;
      }
      .beta {
        font-size: 12pt;
        color: #2155CD;
      }
    }
  }

  .button {
    margin: 5px;
    font-size: 14pt;
    padding: 0 25px;
    line-height: 40px;
    background-color: white;
    border: solid 1px #d3d3d3;
    border-radius: 20px;
  }

  .grey {
    background-color: #f9f9f9;
  }

  .skyblue {
    background-color: #e9f4fe;
  }

  .features {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    gap: 35px;
    .box {
      background-color: white;
      box-shadow: 4px 5px 10px 0px rgba(0,0,0,0.1);
      flex-direction: column;
      gap: 18px;
      padding: 30px;
      border-radius: 24px;
      // border: 1px solid #d4d4d4;
      display: flex;
      img {
        height: 70px;
      }
      span {
        font-size: 12pt;
        font-weight: bold;
      }
    }
  }

  .feature {
    div {
      animation: fadeInUp 0.5s;
    }
  }

  @keyframes fadeInUp {
    0% {
      opacity: 0;
      transform: translate3d(0, 100%, 0);
    }
    to {
      opacity: 1;
      transform: translateZ(0);
    }
  }

  .mobile_mockup {
    padding: 50px 0 50px 0;
    margin: 0 auto;
    overflow:hidden;
    width: 100%;
    .mock {
      display: block;
      overflow:hidden;
      width: 100%;
      height: 900px;
      position: relative;
      @media screen and (max-width: 600px) {
        height: 648px;
      }
    }
    .phone {
      width: 465px;
      height: 900px;
      position: absolute;
      top: 0px;
      left: 50%;
      transform: translate(-50%, 0);
      z-index: 2;
      @media screen and (max-width: 600px) {
        width: 335px;
        height: 648px;
      }
    }
    .frame {
      width: 378px;
      height: 825px;
      position: absolute;
      overflow:hidden;
      top: 39px;
      left: 50%;
      transform: translate(-50%, 0);
      z-index: 1;
      @media screen and (max-width: 600px) {
        width: 272px;
        height: 594px;
      }
    }
    .animateImg {
      img {
        width: 378px;
        animation: up 6s;
        @media screen and (max-width: 600px) {
          width: 272px;
        }
      }
      @media screen and (max-width: 600px) {
        img {
          animation: up_m 6s;
        }
      }
    }
    @keyframes up {
      0% {
        transform: translate3d(0, 0, 0);
      }
      10% {
        transform: translate3d(0, 0, 0);
      }
      50%{
        transform: translate3d(0, -24%, 0);
      }
      86% {
        transform: translate3d(0, calc( -105% + 825px ), 0);
      }
      100% {
        transform: translate3d(0, calc( -101% + 825px ), 0);
      }
    }
    @keyframes up_m {
      0% {
        transform: translate3d(0, 0, 0);
      }
      10% {
        transform: translate3d(0, 0, 0);
      }
      50%{
        transform: translate3d(0, -24%, 0);
      }
      80% {
        transform: translate3d(0, calc( -105% + 594px ), 0);
      }
      100% {
        transform: translate3d(0, calc( -101% + 594px ), 0);
      }
    }

  }
`

const Intro = () => {
  const [ content, setContent ] = useState('intro');
  const [ selctedFeature, setSelectedFeature ] = useState(null);
  const divRef = useRef<HTMLDivElement>(null);
  const [ mokeupImgsTurn, setMokeupImgsTurn ] = useState(1);
  const slideImgStyle = useMemo(
    () => ({width: '100%', maxWidth: '1280px', display: 'block', margin: '0 auto'}),
    []
  );
  const slideTitleStyle = useMemo(
    () => ({fontSize:'19pt'}),
    []
  );
  const slideDescStyle = useMemo(
    () => ({fontSize:'13pt'}),
    []
  );

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  const slide1 = [
    {
      img: '/imgs/create_users.png',
      title: '고객생성',
      content: '하히하'
    }, {
      img: '/imgs/user_list_info.png',
      title: '고객자',
      content: '하히하'
    }
  ]

  const onClickFeature = (feature) => () => {
    if (feature === selctedFeature) {
      return setSelectedFeature(null);
    }
    setSelectedFeature(feature);
    divRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  const mobileAnimationEnd = () => {
    if (mokeupImgsTurn === 1) {
      return setMokeupImgsTurn(2);
    }
    setMokeupImgsTurn(1);
  }

  return (
    <ContainerMax>
      {content === 'intro' ?
        <IntroContainer>
          <div className='section'>
            <div className='logo'>
              <span>Moa-Order</span><span className='beta'>BETA</span>
            </div>
            <h1>
              B2B 원두커피 주문관리 시스템
            </h1>
            <h2>
              소규모 사업자 원두커피 주문 관리에 최적화된 시스템!<br />
              복잡한 ERP나 수기장부는 이제 그만, 꼭 필요한 기능만 담았습니다.<br />
              간편하게 원두커피를 주문 해 보세요.
            </h2>
          </div>
          <div className='section features grey'>
            <div className='box' onClick={onClickFeature('customers')}>
              <img src="./imgs/customers.png" />
              <span>고객관리</span>
            </div>
            <div className='box'  onClick={onClickFeature('orders')}>
              <img src="/imgs/order.png" />
              <span>주문관리</span>
            </div>
            <div className='box'  onClick={onClickFeature('products')}>
              <img src="/imgs/product.png" />
              <span>제품관리</span>
            </div>
            <div className='box'  onClick={onClickFeature('inventory')}>
              <img src="/imgs/inventory.png" />
              <span>재고관리</span>
            </div>
            <div className='box'  onClick={onClickFeature('graph')}>
              <img src="/imgs/graph.png" />
              <span>주문통계</span>
            </div>
            <div className='box'  onClick={onClickFeature('menus')}>
              <img src="/imgs/cafe_menu.png" />
              <span>메뉴관리</span>
            </div>
          </div>
          {selctedFeature === 'customers'?
            <div className='section feature' ref={divRef} key={1}>
              <Slider {...sliderSettings}>
                <div>
                  <img src={'./imgs/create_users.png'} style={slideImgStyle}/>
                  <h1 style={slideTitleStyle}>회원 생성</h1>
                  <p style={slideDescStyle}>스프레드시트 스타일로 편리하게 회원 일괄생성</p>
                </div>
                <div>
                  <img src={'./imgs/user_list_2.png'} style={slideImgStyle}/>
                  <h1 style={slideTitleStyle}>회원 맞춤 설정</h1>
                  <p style={slideDescStyle}>회원별 열람가능 제품, 공지사항 설정</p>
                </div>
              </Slider>
            </div>
          :selctedFeature === 'orders'?
            <div className='section feature' ref={divRef} key={2}>
              <Slider {...sliderSettings}>
                <div>
                  <img src={'./imgs/order_1.png'} style={slideImgStyle}/>
                  <h1 style={slideTitleStyle}>주문 추가</h1>
                  <p style={slideDescStyle}>키오스크 스타일로 간편하게 주문 추가</p>
                </div>
                <div>
                  <img src={'./imgs/order_2.png'} style={slideImgStyle}/>
                  <h1 style={slideTitleStyle}>주문서 열람</h1>
                  <p style={slideDescStyle}>실시간 주문상태 반영과 인쇄 기능</p>
                </div>
              </Slider>
            </div>
          :selctedFeature === 'products'?
            <div className='section feature' ref={divRef} key={3}>
              <Slider {...sliderSettings}>
                <div>
                  <img src={'./imgs/product_1.png'} style={slideImgStyle}/>
                  <h1 style={slideTitleStyle}>제품 등록</h1>
                  <p style={slideDescStyle}>제품의 꼭 필요한 정보를 등록</p>
                </div>
                <div>
                  <img src={'./imgs/product_2.png'} style={slideImgStyle}/>
                  <h1 style={slideTitleStyle}>제품 관리</h1>
                  <p style={slideDescStyle}>제품별 열람가능 회원 맞춤 적용</p>
                </div>
              </Slider>
            </div>
          :selctedFeature === 'inventory'?
          <div className='section feature' ref={divRef} key={4}>
            <Slider {...sliderSettings}>
              <div>
                <img src={'./imgs/inventory_2.png'} style={slideImgStyle}/>
                <h1 style={slideTitleStyle}>재고 보고서</h1>
                <p style={slideDescStyle}>현재 재고를 빠르게 파악</p>
              </div>
              <div>
                <img src={'./imgs/inventory_1.png'} style={slideImgStyle}/>
                <h1 style={slideTitleStyle}>재고 갱신</h1>
                <p style={slideDescStyle}>간편하게 재고 조사</p>
              </div>
            </Slider>
          </div>
          :selctedFeature === 'graph'?
          <div className='section feature' ref={divRef} key={5}>
            <Slider {...sliderSettings}>
              <div>
                <img src={'./imgs/graph_2.png'} style={slideImgStyle}/>
                <h1 style={slideTitleStyle}>원하는 주문 데이터를 시각화</h1>
                <p style={slideDescStyle}>기간별, 품목별, 판매사별로 주문 통계</p>
              </div>
              <div>
                <img src={'./imgs/graph_1.png'} style={slideImgStyle}/>
                <h1 style={slideTitleStyle}>기간별 주문 열람</h1>
                <p style={slideDescStyle}>기간별로 주문량 빠르게 파악</p>
              </div>
            </Slider>
          </div>
          :selctedFeature === 'menus'?
          <div className='section feature' ref={divRef} key={6}>
            <h1>Coming soon</h1>
          </div>
          :<div ref={divRef}></div>}
          <div className='section '>
            <h1>
              편리한 모바일 인터페이스
            </h1>
            <h2>
              KIOSK, 온라인 쇼핑몰과 비슷한 친숙한 UI로 간편하게 이용가능합니다.
            </h2>
            <div className='mobile_mockup'>
              <div className='mock'>
                <img className='phone' src={'./imgs/smartphone.png'} />
                {mokeupImgsTurn === 1?
                  <div className='frame animateImg' key={1} onAnimationEnd={mobileAnimationEnd}>
                    <img className='screen' src={'./imgs/m_1.png'}/>
                  </div>
                :mokeupImgsTurn === 2?
                <div className='frame animateImg' key={2} onAnimationEnd={mobileAnimationEnd}>
                  <img className='screen' src={'./imgs/m_2.png'} />
                </div>
                :null}

              </div>
            </div>
          </div>
          <div className='section grey'>
            <h1>
              판매회원 혹은 구매회원으로 시작해 보세요.
            </h1>
              <button className='button' onClick={()=>setContent('customer')}>구매회원</button>
                <br />
              <button className='button' onClick={()=>setContent('provider')}>판매회원</button>
          </div>
          <div className='section'>
            <h1>
              <img src={'./imgs/chrome.png'} />
            </h1>
            <HGap />
            <h2>
              원활한 서비스 이용을 위해 크롬 브라우저 이용을 권장합니다.
            </h2>
            <HGap />
            <a href='https://www.google.co.kr/chrome/' target='_blank'><button className='button'>크롬설치</button></a>
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
            <HGap />
            <button className='button' onClick={()=>setContent('intro')}>뒤로가기</button>
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
              판매자의 고객이 시스템을 통해 직접 제품주문 또는<br />
              판매자가 구매자를 선택해 주문 주입이 가능합니다.
            </p>
          </div>
          <div className='section'>
            <h1>
              고객 맞춤 관리
            </h1>
            <p>
              구매자별로 노출가능한 제품, 공지사항을 설정 할 수 있습니다.
            </p>
            <HGap />
            <button className='button' onClick={()=>setContent('intro')}>뒤로가기</button>
          </div>
        </IntroContainer>
      :null}
    </ContainerMax>
  );
};

export default Intro;
