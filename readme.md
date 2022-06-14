# Moa-Order
**B2B 원두커피 주문관리 시스템**   
<br><br>

## 솔루션의 개요
![image](https://user-images.githubusercontent.com/73521025/172571391-fd8f3b15-1f7c-4e27-9743-de40e9b61600.png)
_(주)에뜨왈의 기존 워크플로우_
<br><br>

㈜에뜨왈은 원두커피 생산업체로서 도매 납품을 전문으로 하고 있습니다. 자체 브랜드 ‘에뜨왈’을 통해 여러 카페와 일반 고객에게 판매됩니다. 또한 위탁생산 및 배송서비스로 다양한 브랜드와 프렌차이즈 카페를 통해 제품을 유통하고 있습니다. 
같은 원산지의 커피더라도 고객의 요구에 따라 볶음정도와 브랜드, 용량, 포장방법, 가격 등이 달라지며 경우의 수는 기하급수적으로 늘어납니다.
이는 생산근무자 및 관리자의 업무를 비효율적으로 만드며 오배송률을 높이게 됩니다.

Moa-Order는 그런 에뜨왈의 워크플로우에 맞게 개발되었습니다. 회원을 생산자, 판매자, 구매자로 나누어 모든 주문의 상세사항을 생산자가 확인하여 요구에 맞는 제품 생산 및 발송 관리를 돕습니다. 다양한 브랜드의 제품 데이터를 생성할 수 있으며 고객별로 열람가능한 제품을 설정하여 판매계약 조건에 맞는 맞춤 설정이 가능합니다.

<br><br>

## 사용 기술
_아마존 AWS 사용. 우분투 18.04 LTS 환경._

### 프론트앤드   
- **TypeScript (JavaScript)**   
타입스크립트를 사용했지만 모델을 설계하지 않은상태에서 인터페이스, 자료형의 수정이 잦았던점, Ant-Design에서 로케일 객체 인식불가로 일부에 제한적으로만 사용했습니다.   
- **Next 프레임워크, React**   
리액트 기반의 Next 프레임워크를 사용했습니다. 라우팅의 편리함을 장점으로 느꼈습니다.   
- **axios**   
백앤드 서버와 비동기통신을 위해 사용했습니다.   
- **react-query**   
아직 모델 설계를 하지 않은 상태에서 Redux와 Redux-saga를 사용하다가 잦은 수정에 불편함을 느껴 react-query로 서버상태를 관리했습니다.   
- **Styled-Component(CSS), Ant-Design**   
반응형 디자인, 레이아웃을 위해 사용했습니다.

### 백앤드   
- **NodeJS, Express**   
프론트와 같이 자바스크립트로 작성할수 있는 점, 빠른 모델설계와 간편한 수정이 가능하다는 장점으로 익스프레스 프레임워크를 사용했습니다.
- **Sequelize, MySQL**   
MYSQL을 쿼리문을 사용하지 않고 조작해주는 ORM으로 모델설계 및 데이터 조작을 했습니다.

<br><br>

## 개발기간
2021년 12월~

<br><br>

## 배포
- (주)에뜨왈
http://moaorder.com/

- 개발용 테스트 페이지
http://excusemoa.com/

- 깃허브
https://github.com/moamoa-code/excuse-moa

<br><br>

## 페이지 목록
* 공통
  - <a href="http://moaorder.com/intro" target="_blank">인트로</a>
  - 회원정보 수정
  - 주소록
* 구매 회원
  - 홈
  - 공지사항
  - 주문하기
  - 재고관리
  - 주문목록
    + 주문확인서
    
* 판매 회원
  - 홈
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
    + 공지사항 관리
      - [공지사항 등록](#공지사항-등록)
      - [공지사항 목록](#공지사항-목록)
<br/><br/>
## 페이지 상세 설명
페이지의 상세 설명입니다.

<br/><br/>
### 주문목록
![orders](https://user-images.githubusercontent.com/73521025/173564208-378d7f31-7e98-43aa-ac18-672d743cd25e.PNG)
<br/>
(구매회원, 판매회원)
특정 기간 회원의 주문 목록을 불러옵니다. 
<br/>완료된 주문의 총 주문 중량과 금액을 보여줍니다.

<br/><br/>
### 주문확인서
![print-order](https://user-images.githubusercontent.com/73521025/173564235-8e705e41-c54f-4480-8a3d-e80f8caaa974.PNG)
<br/>
특정 주문서의 상세 사항을 열람합니다.

<br/><br/>
### 주문현황
![order-list](https://user-images.githubusercontent.com/73521025/173562804-b29d75c0-4352-4f99-b308-fb1d9d6be115.PNG)
<br/>
(관리자) 특정 기간, 특정 조건의 모든 주문을 불러옵니다. <br/>

<br/><br/>
### 주문추가
![add-order](https://user-images.githubusercontent.com/73521025/173562990-c0508948-80fe-4f30-ae24-e9d914cc6e9a.png)

<br/><br/>
### 출하량분석
![graphs](https://user-images.githubusercontent.com/73521025/173563044-0c3c15eb-397f-45d4-97b1-b614de8d689f.png)

<br/><br/>
### 재고관리
![reports](https://user-images.githubusercontent.com/73521025/173563096-91a34208-3bb5-41ae-8568-18825575c5f6.png)

<br/><br/>
### 회원목록
![users](https://user-images.githubusercontent.com/73521025/173563150-91f5f46b-ccbe-463b-b22e-29e6b88f3276.png)

<br/><br/>
### 판매자-구매자 관리
![pro-cus](https://user-images.githubusercontent.com/73521025/173563188-6576b064-f8e0-4690-b280-c05ba82be4e2.png)

<br/><br/>
### 여러 회원 생성
![create-users](https://user-images.githubusercontent.com/73521025/173563239-1d46358b-8af0-4b44-ba08-7128a3549c03.png)

<br/><br/>
### 제품등록
![add-item](https://user-images.githubusercontent.com/73521025/173563262-652d187f-2bda-4a83-bfe3-17be8b3f70dd.png)

<br/><br/>
### 제품목록
![item-list](https://user-images.githubusercontent.com/73521025/173563304-bf2d1eec-855e-4772-b379-455039509b6f.png)
