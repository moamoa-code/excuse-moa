# Moa-Order
**B2B 원두커피 주문관리 시스템**   
<br/><br/>

## 솔루션의 개요
![image](https://user-images.githubusercontent.com/73521025/172571391-fd8f3b15-1f7c-4e27-9743-de40e9b61600.png)
_(주)에뜨왈의 기존 워크플로우_
<br/><br/>

㈜에뜨왈은 원두커피 생산업체로서 도매 납품을 전문으로 하고 있습니다. 자체 브랜드 ‘에뜨왈’을 통해 여러 카페와 일반 고객에게 판매됩니다. 또한 위탁생산 및 배송서비스로 다양한 브랜드와 프렌차이즈 카페를 통해 제품을 유통하고 있습니다. 
같은 원산지의 커피더라도 고객의 요구에 따라 볶음정도와 브랜드, 용량, 포장방법, 가격 등이 달라지며 경우의 수는 기하급수적으로 늘어납니다.
이는 생산근무자 및 관리자의 업무를 비효율적으로 만드며 오배송률을 높이게 됩니다.

Moa-Order는 그런 에뜨왈의 워크플로우에 맞게 개발되었습니다. 회원을 생산자, 판매자, 구매자로 나누어 모든 [주문의 상세사항](#주문현황)을 생산자가 확인하여 요구에 맞는 제품 생산 및 발송 관리를 돕습니다. 다양한 브랜드의 제품 데이터를 생성할 수 있으며 [고객별로 열람가능한 제품을 설정](#판매자-구매자-관리)하여 판매계약 조건에 맞는 맞춤 설정이 가능합니다.

<br/><br/>

## 사용 기술
_아마존 AWS 사용. 우분투 18.04 LTS 환경._

### 프론트앤드   
- **TypeScript (JavaScript)**    
- **Next 프레임워크, React**   
- **axios**   
- **react-query**   
- **Styled-Component(CSS), Ant-Design**   

### 백앤드   
- **NodeJS, Express**   
- **Sequelize, MySQL**   

<br/><br/>

## 개발기간
2021년 12월~

<br/><br/>

## 배포
- (주)에뜨왈
http://moaorder.com/

- 개발용 테스트 페이지
http://excusemoa.com/

- 깃허브
https://github.com/moamoa-code/excuse-moa

<br/><br/><br/>


<br/><br/>

## 데이터 모델
![erdd](https://user-images.githubusercontent.com/73521025/173772945-c5e9f2ab-9ca0-4b80-a6be-18c2725e12fb.png)
ERD<br/>

- **회원**<br/>
회원의 등급은 비회원, 구매회원, 판매회원, 관리자로 나뉩니다.
- **회원관계**<br/>
판매회원은 다수의 구매회원을 자신의 고객으로 등록할 수 있습니다.
- **주소록**<br/>
회원은 다수의 주소를 가질 수 있습니다.
- **제품**<br/>
판매회원은 다수의 제품을 등록 할 수 있습니다.
- **제품 열람**<br/>
판매회원은 특정 제품에 열람가능한 고객을 등록할 수 있습니다.<br/>
구매회원은 열람가능한 제품만 열람 가능합니다.
- **공지**<br/>
관리자, 판매회원은 다수의 공지를 등록 할 수 있습니다.
- **공지 열람**<br/>
판매회원은 특정 제품에 열람가능한 고객을 등록 할 수 있습니다.<br/>
구매회원은 관리자 공지사항과 열람가능한 공지만 열람 가능합니다.
- **주문서**<br/>
주문서를 작성하면 구매회원, 판매회원이 열람이 가능합니다.
- **주문 상세**<br/>
주문서의 제품 수량 등의 상세사항입니다.<br/>제품의 삭제, 변동이 있고 제품 테이블에 존재하지 않는 제품도 주문가능하므로 제품테이블을 참조하지 않습니다.
- **재고 품목**<br/>
회원은 재고보고서에 담을 재고 품목을 등록할 수 있습니다.
- **재고 상세**<br/>
재고보고서에 담길 내역으로 재고 품목의 수량, 상태, 메모 등의 정보를 담습니다.
- **재고 보고서**<br/>
여러개의 재고상세를 담으며 확인, 출고 등의 보고서 상태를 담습니다.
- **재고 그룹**<br/>
여러개의 재고 보고서를 담습니다.

<br/><br/>

## 반응형 디자인
![pc](https://user-images.githubusercontent.com/73521025/173990964-d2d9bdf5-091e-42e7-82c9-dd064c05c29a.PNG)<br/>
**PC 화면**
<br/><br/>
![mobile](https://user-images.githubusercontent.com/73521025/173990956-187ef5ce-b520-48e6-b8a3-bb7f9cd976f0.PNG)
<br/>

**모바일 화면**

반응형 디자인으로 PC, 모바일에서도 다양한 데이터를 표시해 줍니다.


<br/><br/>
## 페이지 목록
* 공통
  - <a href="http://moaorder.com/intro" target="_blank">인트로</a> (외부링크)
  - 회원정보 수정
  - 주소록
* 구매 회원

  - [홈](#홈)
  - 공지사항
  - 주문하기
  - 재고관리
  - 주문목록
    + 주문확인서
    
* 판매 회원
  - [홈](#홈)
  - [주문확인](#주문목록)
    + [주문확인서](#주문확인서)
  - 주문추가
  - 재고관리
  - 판매자페이지
    + 고객관리
      - 고객 생성
      - 여러고객 생성
      - 고객관리 및 등록
    + 제품관리
      - 제품등록
      - 제품목록
    + 공지사항 관리
      - 공지사항 등록
      - 공지사항 목록
* 관리자
  - [주문현황](#주문현황)
  - [주문추가](#주문추가)
  - [출하량분석](#출하량분석)
  - [재고관리](#재고관리)
  - 관리자페이지
    + 고객관리
      - [회원목록](#회원목록)
      - [판매자-구매자 관리](#판매자-구매자-관리)
      - 회원생성
      - [여러 회원 생성](#여러-회원-생성)
    + 제품관리
      - [제품등록](#제품등록)
      - [제품목록](#제품목록)
        + [제품수정](#제품수정)
    + 공지사항 관리
      - [공지사항 등록](#공지사항-등록)
      - [공지사항 목록](#공지사항-목록)
        + [공지사항 수정](#공지사항-수정)

<br/><br/>
## 페이지 상세 설명
페이지의 상세 설명입니다.

<br/><br/>
### 홈
![home](https://user-images.githubusercontent.com/73521025/174000791-dab7b024-141c-4a0b-8708-fcf3146f41ee.PNG)
<br/>
(구매회원, 판매회원)<br/>
공지사항과 최근 주문내역을 표시합니다.
<br/><br/>[목록으로](#페이지-목록)

<br/><br/>
### 주문목록
![orders](https://user-images.githubusercontent.com/73521025/173564208-378d7f31-7e98-43aa-ac18-672d743cd25e.PNG)
<br/>
(구매회원, 판매회원)<br/>
특정 기간 회원의 주문 목록을 불러옵니다. 
<br/>완료된 주문의 총 주문 중량과 금액을 보여줍니다.
<br/><br/>[목록으로](#페이지-목록)

<br/><br/>
### 주문확인서
![print-order](https://user-images.githubusercontent.com/73521025/173564235-8e705e41-c54f-4480-8a3d-e80f8caaa974.PNG)
<br/>
특정 주문의 상세 사항을 열람합니다.
<br/><br/>[목록으로](#페이지-목록)

<br/><br/>
### 주문현황
![order-list](https://user-images.githubusercontent.com/73521025/173562804-b29d75c0-4352-4f99-b308-fb1d9d6be115.PNG)
<br/>
(관리자)<br/>
특정 기간, 특정 조건의 모든 주문상세를 불러옵니다. 
<br/><br/>[목록으로](#페이지-목록)

<br/><br/>
### 주문추가
![add-order](https://user-images.githubusercontent.com/73521025/173562990-c0508948-80fe-4f30-ae24-e9d914cc6e9a.png)
<br/>
(관리자) 판매자, 구매자, 제품을 선택하여 주문을 추가합니다.<br/>
(판매회원) 구매자, 제품을 선택하여 주문을 추가합니다.<br/>
(구매회원) 제품을 선택하여 주문을 추가합니다.
<br/><br/>[목록으로](#페이지-목록)

<br/><br/>
### 출하량분석
![graphs](https://user-images.githubusercontent.com/73521025/173563044-0c3c15eb-397f-45d4-97b1-b614de8d689f.png)
<br/>
(관리자)<br/>
선택한 조건의 출하 완료된 주문을 불러와 중량, 금액의 합계를 표시합니다.<br/>
Nivo 라이브러리를 활용하여 차트를 보여줍니다.
<br/><br/>[목록으로](#페이지-목록)

<br/><br/>
### 재고관리
![reports_](https://user-images.githubusercontent.com/73521025/173745024-76f9a2e8-ee29-40d7-a507-eff606edad03.png)<br/>
재고보고서 그룹<br/><br/>
![reports1](https://user-images.githubusercontent.com/73521025/173747886-699082db-6d32-43e9-86aa-8ed38b3f17bd.png)
<br/>
간단한 재고 수량 파악 페이지입니다.<br/>
관리할 품목을 등록 한 후 재고 보고서에 품목을 추가해 수량을 관리할 수 있습니다.
<br/><br/>[목록으로](#페이지-목록)


<br/><br/>
### 회원목록
![users](https://user-images.githubusercontent.com/73521025/173563150-91f5f46b-ccbe-463b-b22e-29e6b88f3276.png)
<br/>
(관리자)<br/>
모든 회원의 목록을 불러오고 회원의 주문목록 열람, 회원정보 및 주소록 수정, 등급변경 및 탈퇴처리, 삭제를 할 수 있습니다.<br/>
(판매회원)<br/>
판매회원의 고객(구매회원)목록을 불러오고 회원정보 및 주소록 수정, 고객등록 해제, 탈퇴처리를 할 수 있습니다.
<br/>고객의 열람가능한 제품을 등록합니다.
<br/><br/>[목록으로](#페이지-목록)


<br/><br/>
### 판매자-구매자 관리
![pro-cus](https://user-images.githubusercontent.com/73521025/173563188-6576b064-f8e0-4690-b280-c05ba82be4e2.png)
<br/>
(관리자)<br/>
판매회원 목록과 판매회원의 구매회원 목록을 불러옵니다. 특정 회원을 판매회원의 고객(구매회원)으로 등록하거나 해제할 수 있습니다.<br/>
특정 회원고객이 열람가능한 판매자의 제품을 등록합니다.
<br/><br/>[목록으로](#페이지-목록)

<br/><br/>
### 여러 회원 생성
![create-users](https://user-images.githubusercontent.com/73521025/173563239-1d46358b-8af0-4b44-ba08-7128a3549c03.png)<br/>
(관리자)<br/>
회원 등급별로 복수의 회원을 생성합니다.<br/>
(판매회원)<br/>
복수의 고객(구매회원)을 생성합니다.
<br/><br/>[목록으로](#페이지-목록)

<br/><br/>
### 제품등록
![add-item](https://user-images.githubusercontent.com/73521025/173563262-652d187f-2bda-4a83-bfe3-17be8b3f70dd.png)<br/>
(관리자) 판매회원을 선택하고 특정 판매회원의 제품을 등록합니다.<br/>
(판매회원) 판매회원의 제품을 등록합니다.
<br/><br/>[목록으로](#페이지-목록)

<br/><br/>
### 제품목록
![item-list](https://user-images.githubusercontent.com/73521025/173563304-bf2d1eec-855e-4772-b379-455039509b6f.png)
(관리자) 판매회원을 선택하고 특정 판매회원의 제품목록을 불러옵니다.<br/>
(판매회원) 판매회원의 제품 목록을 불러옵니다.
<br/><br/>[목록으로](#페이지-목록)

<br/><br/>
### 제품수정
<br/>
(관리자, 판매회원) 제품의 정보를 수정하거나 복사생성합니다. 제품을 열람가능한 판매회원을 등록합니다.
<br/><br/>[목록으로](#페이지-목록)

<br/><br/>
### 공지사항 등록
![reports1](https://user-images.githubusercontent.com/73521025/173747886-699082db-6d32-43e9-86aa-8ed38b3f17bd.png)
![add-notice](https://user-images.githubusercontent.com/73521025/173756001-f4774b29-ebad-42bf-9d85-d9f7e0c0c365.PNG)<br/>
(관리자) 관리자 공지사항을 작성하거나 판매회원을 선택하고 특정 고객이 열람가능한 공지사항을 작성합니다.<br/>
(판매회원) 판매회원의 고객이 열람가능한 공지사항을 작성합니다.
<br/><br/>[목록으로](#페이지-목록)

<br/><br/>
### 공지사항 목록
![notice-list](https://user-images.githubusercontent.com/73521025/173756316-c5015049-53b1-457d-ae68-846402c73dd2.PNG)<br/>
(관리자) 모든 공지사항 목록을 불러오고 열람하거나 수정합니다.
(판매회원) 판매회원의 공지사항 목록을 불러오고 열람하거나 수정합니다.
<br/><br/>[목록으로](#페이지-목록)

<br/><br/>
### 공지사항 수정<br/>
(관리자, 판매회원) 공지사항을 수정하고 열람가능한 고객을 등록합니다.
<br/><br/>[목록으로](#페이지-목록)


<br/><br/>
<br/><br/>

# 개발자 코멘트
## 개발하며 느꼈던 어려운 점
- 설계도가 중요하다.<br/>
  모델과 요구사항 100% 파악, 설계되지 않은 시점에서 프론트 개발을 시작. 매우 잦은 타입스크립트 인터페이스 수정과 Redux 스토어 수정에 피로를 많이 느낌.<br/>
  REST API를 생각하지 않고 API를 개발하니 기능이 많아질수록 헷갈리고 가독성이 떨어짐.
- 호환성 문제<br/>
  자체 첫 테스트를 마치고 직원들에게 사용법을 교육하고 테스트를 시작하니 '안되는데요' 발생.<br/>
  크롬 브라우저 버전에 따라 axios 제대로 적용 안되는점 확인, 애플 사파리 브라우저 또한 사용불가. 구글링 통해 해외에 같은 사례를 찾아 코드를 수정하니 기능은 정상 작동. <br/>
  크로스브라우징과 Webpack에 대해 공부가 더 필요하다.
- 관리자 페이지<br/>
  대부분의 DB를 조작해야 하다보니 관리자페이지 개발 기간이 본 기능 개발보다 오래걸릴줄은 몰랐음.<br/>
- 서버 세팅<br/>
  로컬 환경에서 개발하다 아마존 AWS에 올리니 작동 불가. 윈도우와 리눅스 환경은 다르다.
<br/><br/>

## 앞으로 개선해야할 사항
- SSR적용되지 않는 부분 수정, SSR/CSR 유연 적용
- API를 RESTful하게 수정
- 중복된 코드들 모듈화, 리팩토링
- HTTPS 적용
- 크로스브라우징 강화