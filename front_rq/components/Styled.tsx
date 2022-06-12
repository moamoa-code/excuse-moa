import styled from 'styled-components';

// 레이아웃 800
export const Container800 = styled.div`
  max-width: 800px;
  padding: 20px;
  margin: 0 auto;
  box-sizing:border-box;
  @media screen and (max-width: 600px) {
    max-width: 100%;
    padding: 10px;
  }
`

export const ContainerMax = styled.div`
  max-width: 100%;
  margin: 0 auto;
  box-sizing:border-box;
`

// 레이아웃 대짜
export const ContainerBig = styled.div`
  max-width: 1024px;
  margin 0 auto;
  padding: 15px;
`

// 레이아웃 더 대짜
export const ContainerWide = styled.div`
  max-width: 1280px;
  margin 0 auto;
  padding: 15px;
`

// 레이아웃 중간
export const ContainerMid = styled.div`
  max-width: 600px;
  margin 0 auto;
  padding: 10px;
`

// 레이아웃 중간
export const ContainerSmall = styled.div`
  max-width: 480px;
  margin 0 auto;
  padding: 10px;
`

// 공장-주문추가-상단 버튼
export const OrderTypeSelects = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content:space-between;
  gap: 10px;
  a {
    text-decoration:none !important;
  }
  a:hover {
    text-decoration:none !important;
  }
  p {
    display: inline-block;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
    white-space: nowrap;
  }
  text-align: center;
  margin-bottom: 30px;
  box-sizing:border-box;
  .selected{
    color: white;
    background-color: #1890ff;
    border: 1px solid #1890ff;
  }
  div{
    box-sizing: border-box;
    padding:5px;
    height: 50px;
    font-size: 16pt;
    font-wight: 600;
    border: 1px solid #111111;
    border-radius: 15px;
    flex: 1;
  }
`
// 공장-주문추가 기타요구사항
export const CommentInput = styled.div`
  padding: 5px 15px 5px 15px;
  font-size: 12pt;
  p {
    font-weight: bold;
  }
  textarea  {
    width: 100%;
    height: 2em;
    resize: none;
    border-radius: 4px;
  }
`
export const Red = styled.span`
  color: red;
`
// 공장-주문추가 선택한 제품목록
export const CartItems = styled.div`
  .cartItem{
    position: relative;
    padding: 15px 5px 15px 5px;
    border-bottom: 1px solid #999999;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
      -webkit-appearance: none;
  }
  .first{
    margin: 5px 0px 10px 0px;
  }
  .second{
    margin: 5px 0px 10px 0px;
  }
  .name{
    font-size:14pt;
    font-weight:600;
  }
  .unit{
    background-color:#FF5C8D;
    border-radius: 4px;
    padding: 4px 7px 4px 7px;
    margin: 0px 2px 0px 4px;
    color: white;
    font-size: 11pt;
  }
  .codeName{
    background-color:#00B4D8;
    border-radius: 4px;
    padding: 4px 7px 4px 7px;
    margin: 0px 2px 0px 4px;
    color: white;
    font-size: 11pt;
  }
  .package{
    margin: 0px 2px 0px 4px;
    font-size: 12pt;
  }
  .space{
    display:inline-block;
    width:7px;
  }
  .bottom{
    display: flex;
    justify-content: space-between;
    vertical-align: center;
  }
  .tagInputBox {
    padding: 2px 5px 2px 5px;
    margin: 0px;
    input {
      margin:0px;
      min-width:100px;
      max-width:180px;
      font-size: 14pt;
      border: 1px solid #999999;
      text-align:center;
      border-radius: 25px;
    }
  }
  .weight{
    // position: absolute;
    font-size:11pt;
    font-wight:bold;
    // top: 56px;
    // right: 10px;
    float: right;
  }
  .delete{
    position: absolute;
    top: 23px;
    right: 5px;
    border: 1px solid #999999;
    background: #5f5f5f99;
    border-radius: 50%;
    width:25px;
    height:25px;
    font-size:8pt;
    font-wight:600;
    color:white;
  }
  .qtyInputBox {
    vertical-align: center;
    display: inline-block;
    justify-content: space-between;
    margin: 0px;
    padding: 2px 10px 2px 10px;
    border: 1px solid #999999;
    border-radius: 25px;
    button {
      border: none;
      background: none;
    }
    input {
      margin:0px;
      text-align:center;
      font-size: 14pt;
      width:45px;
      border:none;
    }
    button:active {
      position: relative; 
      top:2px;
    }
  }
`
// 공장-주문추가 목록컨테이너
export const ListBox = styled.div`
  overflow: auto;
  max-height: 500px;
`

// 공장-주문추가 
export const ContentsBox = styled.div`
  border-radius: 4px;
  padding: 20px 15px 20px 15px;
  box-sizing:border-box;
  width:100%;
  background-color:#fafafa;
`

// 공장-주문추가 제목
export const TiTle = styled.span`
  font-size: 16pt;
  font-weight:600;
`
// 공장-주문추가 
export const CenteredDiv = styled.div`
  text-align: center;
  margin 0 auto;
`
// 공장-주문추가 새 아이템 입력
export const ItemForm = styled.div`
.buttonWrapper{
  margin: 24px 0px 10px 0px;
  text-align:center;
  button{
    padding: 8px 12px 8px 12px;
    display:inline-block;
    font-size: 14pt;
    color: white;
    background-color: #1890ff;
    border: none;
    border-radius: 4px;
  }
  button:active {
    position: relative; 
    top:4px;
  }
}
.optionName{
  margin-top: 18px;
  font-size: 14pt;
  font-weight: 600;
  display: block;
}
.productName{
  width:100%;
}
input{
  display: block;
  padding: 5px 8px 5px 8px;
  font-size: 14pt;
  margin: 12px 0px 12px 0px;
  border: 1px solid #999999;
  text-align:center;
  border-radius: 25px;
}
.optionContainer{
  display: block;
  overflow:auto;
  max-height:300px;
  p {
    display: inline-block;
    box-sizing: border-box;
    border-radius: 4px;
    padding: 5px 8px 5px 8px;
    margin: 6px;
    font-size: 13pt;
  }
  p:active {
    position: relative; 
    top:2px;
  }
  .codeName{
    background-color:#00B4D8;
    color: white;
  }
  .unit{
    background-color:#FF5C8D;
    color: white;
  }
  .package{
    background-color:#ec7728;
    color: white;
  }
  .tag{
    border: 1px solid #999999;
    background-color:#ffffff;
    color: black;
  }
  .readMe{

  }
}
`
// 공장-주문추가 새 구매자 입력
export const CustomerForm = styled.table`
  width:100%;
  margin: 15px 0px 10px 0px;
  font-size: 12pt;
  td {
    padding: 12px;
  }
  background-color: white;
  .left{
    width: 60px;
  }
  input {
    padding: 6px;
    width:100%;
  }
`
// 공장-주문추가 
export const ItemsContainer = styled.div`
  overflow:auto;
  max-height:900px;
  text-align: center;
  align-content: space-between;
  align-items: center;
  justify-content: center;
  display: flex;
  width:100%;
  flex-wrap: wrap;
  box-sizing: border-box;
  .selected {
    background-color: white;
    box-shadow: 4px 5px 10px 0px rgba(0,0,0,0.2);
}
`
// 공장-주문추가 제품 선택
export const ItemSelector = styled.div`
  // display: inline-block;
  box-sizing: border-box;
  position: relative;
  padding:5px;
  flex-basis: 340px;

  margin:8px;
  border: 1px dotted #444444;
  border-radius: 7px;
  .showModalClick {
    position : absolute;
    padding: 3px 6px 3px 8px;
    margin: 0px;
    top: 0px;
    right: 5px;
    font-size: 17pt;
  }
  .underline{
    border-bottom: 1px solid #d4d4d4;
    padding-bottom: 7px;
  }
  .second{
    margin-top: 13px;
  }
  .name{
    font-size:13pt;
    font-weight:600;
  }
  .unit{
    background-color:#FF5C8D;
    border-radius: 4px;
    padding: 4px 7px 4px 7px;
    margin: 0px 2px 0px 4px;
    color: white;
    font-size: 10pt;
  }
  .codeName{
    background-color:#00B4D8;
    border-radius: 4px;
    padding: 4px 7px 4px 7px;
    margin: 0px 2px 0px 4px;
    color: white;
    font-size: 10pt;
  }
  .package{
    margin: 0px 2px 0px 4px;
    font-size: 10pt;
  }
  .space{
    display:inline-block;
    width:5px;
  }
  .id{
    font-size: 8pt;
  }
  div{
    margin: 4px 0px 4px 0px;
    vertical-align:middle;
  }
  @media screen and (max-width: 600px) {
    width: 100%;
    margin:8px 0px 8px 0px;
  }
`

// 공통

//모달
export const MoDal = styled.div`
  overflow: auto;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: baseline;
  top: 0;
  left: 0;
  z-index: 8;
  width: 100vw;
  height: 100vh; 
  background-color: #828080e2;
  animation: fadein 0.2s;
  @keyframes fadein {
    from {
      opacity: 0;
      top: -100px;
    }
    to {
      opacity: 1;
      top: 0;
    }
  }
  .contents {
    margin-top: 10%;
    margin-bottom: 10%;
    width: 680px;
    max-width: 90%;
    max-height: 90%;
    background-color: white;
    padding: 20px;
    overflow: auto;
    border-radius: 10px;
    -webkit-box-shadow: 1px 1px 15px 3px rgba(0,0,0,0.34); 
    box-shadow: 1px 1px 15px 3px rgba(0,0,0,0.34);
    transition: opacity 1s;
    @media screen and (max-width: 680px) {
      padding: 10px;
      max-width: 95%;
      max-height: 90%;
    }
  }
  .close {
    display: block;
    margin-top: 10px;
    float:right;
  }
`
export const ErrorMessage = styled.div`
  color: red;
`;

export const FormBox = styled.div`
  box-shadow: 4px 5px 10px 0px rgba(0,0,0,0.1); 
  border: 2px solid #cccccc;
  border-radius: 20px;
  background-color: #fdfdfd;
  margin: 0;
  padding: 10px 20px 10px 20px;
  @media screen and (max-width: 600px) {
    padding: 8px 18px 8px 18px;
  }
  hr {
    width: 100%;
    border: 0;
    border: 1px solid #cccccc;
    margin-top: 18px;
    margin-bottom: 18px;
  }
`

// 입력 폼 한줄
export const Block = styled.div`
  margin: 20px 0 20px 0;
  label {
    font-weight: bold;
    color: #626262;
    display: block;
    margin: 0 0 5px 0;
    @media screen and (max-width: 600px) {
      margin: 0;
      padding: 0;
    }
  }
  input {
    background-color: #white;
    width: 100%;
    padding-left: 5px;
    height: 2.8em;
    border: 1px solid #e4e4e4;
    border-radius: 6px;
  }
`
// 검색
export const SearchBlock = styled.div`
  margin: 18px 0 18px 0;
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  .leftHolder {
  }
  div {
    display: flex;
    flex-grow: 1;
    align-items: center;
  }
  select {
    box-sizing : border-box;
    height: 38px;
    border-radius: 4px 0 0 4px;
    border: 1px solid #999999;
    background-color:white;
  }
  input {
    flex-basis: 50px;
    flex-grow: 1;
    height: 38px;
    margin: 0;
    padding-left: 5px;
    box-sizing : border-box;
    border-radius: 4px 0 0 4px;
    border: 1px solid #999999;
  }
  .search{
    color: white;
    font-size: 12pt;
    font-weight: 800;
    min-width: 35px;
    border:0;
    margin: 0;
    border-radius: 0 4px 4px 0;
    background-color:#1890ff;
  }
  button {
    flex-grow: none;
    box-sizing : border-box;
    height: 38px;
    border-radius: 4px;
    border: 1px solid #999999;
    background-color:white;
  }
  button:active {
    position: relative; 
    top:2px;
  }
  label {
    display: block;
    margin: 0 0 7px 0;
  }
`
// 검색결과, 각종 옵션
export const OptionContainer = styled.div`
  background-color: #f1f8ff;
  padding: 8px 0px 8px 0px;
  display: block;
  overflow:auto;
  max-height:300px;
  p {
    background-color: white;
    display: inline-block;
    box-sizing: border-box;
    border-radius: 4px;
    padding: 5px 8px 5px 8px;
    margin: 6px;
    font-size: 9pt;
  }
  p:active {
    position: relative; 
    top:2px;
  }
  .codeName{
    background-color:#00B4D8;
    color: white;
  }
  .unit{
    background-color:#FF5C8D;
    color: white;
  }
  .package{
    background-color:#ec7728;
    color: white;
  }
  .provider{
    border: 1px solid #999999;
  }
`

// 여러 회원생성
// 입력 폼 테이블
export const InputFormTable = styled.table`
  .selectWrap {
    display: flex;
    input {
      width: 40px;
      flex: 1;
    }
    select {
      flex: 1;
      padding: 4px 0px 4px 0px;
      border-radius: 4px;
      border: 1px solid #398AB9;
    }
    button {
      background: white;
      padding: 0 3px 0 3px;
      border-radius: 4px;
      border: 1px solid #398AB9;
    }
  }
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #444444;
  th {
    font-size: 12pt;
    height: 40px;
    background-color: #f6f6f6;
    border: 1px solid #444444;
  }
  td {
    text-align: center;
    border: 1px solid #444444;
  }
  input {
    width: 100%;
    padding: 4px 0px 4px 0px;
    border: none;
  }
  tr {
    margin-bottom: 5px;
  }
`

export const SearchAndTitle = styled.div`
margin: 18px 0 18px 0;
width: 100%;
display: flex;
justify-content: space-between;
flex-wrap: wrap;
hr {
  flex-grow: 1;
  width: 50px;
  margin: 0 5px 0 5px;
  border : 0px;
  border-top: 1px solid #cfcfcf;
}
.left {
  width: 15px;
  margin-right: 10px;
}
.search input {
  height: 38px;
  margin: 0;
  padding-left: 5px;
  box-sizing : border-box;
  border-radius: 4px 0 0 4px;
  border: 1px solid #999999;
}
.search Button{
  height: 38px;
  color: white;
  font-size: 12pt;
  font-weight: 800;
  min-width: 35px;
  border:0;
  margin: 0;
  border-radius: 0 4px 4px 0;
  background-color:#1890ff;
}
.listBtn {
  margin-left: 5px;
  height: 38px;
  border-radius: 4px;
  border: 1px solid #999999;
  background-color:white;
}
.listBtn:active {
  position: relative; 
  top:2px;
}
.textBox {
  font-size: 16pt;
  font-weight: bold;
  margin: 0px 10px 0px 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
`


// 로딩중 모달
export const LoadingModal = styled.div`
overflow: auto;
display: flex;
position: fixed;
top: 0;
left: 0;
z-index: 8;
align-items: center;
justify-content: center;
width: 100vw;
height: 100vh;
background-color: rgba(255, 255, 255, 0.5);
animation: fadein 0.2s;
@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
div {
  overflow: auto;
  z-index: 9;
  padding: 15px;
}
`

export const DataShow = styled.div`
  display: flex;
  flex-flow: wrap;
  margin: 8px 0 8px 0px;
  @media screen and (max-width: 600px) {
    flex-basis: 100%;
  }
  h1 {
    font-size: 13pt;
    font-weight: bold;
    display: block;
    flex-basis: 100%; 
  }
  .container {
    border: 1px solid #f0f0f0;
    display: flex;
    flex-grow: 1;
    @media screen and (max-width: 600px) {
      flex-basis: 100%;
      flex-direction:column;
    }
  }
  .title{
    white-space:nowrap;
    background-color:#fafafa;
    flex-grow: 1;
    padding: 15px;
    @media screen and (max-width: 600px) {
      padding: 5px;
      flex-basis: 100%;
    }
  }
  .data{
    min-width:100px;
    padding: 15px;
    flex-wrap: wrap;
    flex-grow: 4;
    @media screen and (max-width: 600px) {
      padding: 5px;
      flex-basis: 100%;
    }
  }
  .bigTitle{
    display: block;
    flex-basis: 100%; 
    padding: 15px;
    background-color:#fafafa;
    border: 1px solid #f0f0f0;
    @media screen and (max-width: 600px) {
      padding: 5px;
    }
  }
  .bigData{
    display: block;
    flex-basis: 100%; 
    padding: 15px;
    border: 1px solid #f0f0f0;
    @media screen and (max-width: 600px) {
      padding: 5px;
    }
  }
`

export const HGap = styled.div`
  display: block;
  width: 100%;
  height: 15px;
`

export const MyTaBle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px 0px;
.tag{
  background-color: #f0f0f0;
  box-sizing: border-box;
  border-radius: 4px;
  padding: 1px 4px 1px 4px;
  font-size: 8pt;
}
.expandable{
  animation-duration: 3s;
  animation-name: slidein;
  margin: 10px 0px 10px 0;
  animation: fadein 0.2s;
  @keyframes fadein {
    from {
      transform: translate3d(0, -10%, 0);
      opacity: 0;
    }
    to {
      transform: translateZ(0);
      opacity: 1;
    }
  }
}
.container {
  padding: 14px;
  border: 1px solid #e4e4e4;
  border-radius: 12px;
  box-shadow: 0px 9px 10px -4px rgba(0,0,0,0.07);
}
span {
}
.id {
  background-color: #a8d5ff;
  box-sizing: border-box;
  border: 1px solid;
  border-radius: 4px;
  padding: 1px 4px 1px 4px;
  color: white;
  font-size: 8pt;
}
.top {
  justify-content: flex-start;
  padding: 4px 0 4px 0;
  display: flex;
  align-items: center;
  flex-direction: row;
  font-size: 11pt;
  gap: 0px 6px;
  flex-wrap: wrap;
}
.bottom {
  padding: 4px 0 4px 0;
  display: flex;
  flex-direction: row;
  gap: 0px 6px;
  flex-wrap: wrap;
}
.inputs {
  padding: 4px 0 4px 0;
  display: flex;
  flex-direction: row;
  flex;justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}
.inputName{
  background-color: #a8d5ff;
  box-sizing: border-box;
  border-radius: 4px;
  padding: 1px 4px 1px 4px;
  font-size: 9pt;
}
.title{
  font-weight: 500;
}
.sub{
}
.right{
  margin-left: auto;
}
.sub::before {
  content:" | "
}
`

export const RightText = styled.div`
  text-align: right;
`

export const LeftAndRightDiv = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  .left{
    flex: 1;
  }
  .right{
    margin-left: auto;
  }
  
`

// 재고보고서
export const InventoryTable = styled .table`
  width: 100%;
  min-width: 350px;
  border-collapse: collapse;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  .extended{
    .container {
      background-color:white;
      padding: 18px;
      border-radius: 12px;
      border: 1px solid #d4d4d4;
      display: flex;
      flex-direction: column;
      gap: 8px;
      div {
        flex: 1;
        .tag {
          display: block;
          font-weight: bold;
        }
      }
    }
  }
  .name {
    color:#1890ff;
  }
  .qty {
    width: 80px;
    text-align: center;
    font-size: 12pt;
    div {
      display: flex;
      margin:0 auto;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
      .unitTag {
        background-color: white;
        box-sizing: border-box;
        border-radius: 4px;
        border: 1px solid #d4d4d4;
        padding: 1px 4px 1px 4px;
        font-size: 8pt;
      }
    }
  }
  .unit {
    width: 60px;
  }
  .selectWrap {
    display: flex;
    input {
      width: 40px;
      flex: 1;
    }
    select {
      flex: 1;
      flex-basis: 90px;
      padding: 4px 0px 4px 0px;
      border-radius: 4px;
      border: 1px solid #398AB9;
    }
    button {
      background: white;
      padding: 0 3px 0 3px;
      border-radius: 4px;
      border: 1px solid #398AB9;
    }
  }
  input {
    width: 100%;
    padding: 4px 0px 4px 0px;
    border: none;
  }
  th, td{
    padding: 10px 6px 10px 6px;
  }
  th {
    position: sticky;
    z-index: 2;
    top: 0px;
    background-color: #167c80;
    border-left: 3px solid #ffffff;
    color: #ffffff;
    font-size: 12pt;
  }
  .status {
    width: 100px;
  }
  th:first-child {
    border-left: none;
  }
  .code {
    background-color: #a6cfe2;
  }
  .code td {
    padding: 10px;
    font-size: 12pt;
    font-weight: 600;
  }
  .totalQty {
    background-color: white;
    td {
      text-align: right;
    }
  }
  .numberInput {
    font-size: 13pt;
    font-weight: bold;
    width: 60px;
  }
  tr {
    border-bottom: 3px solid #dadada;
  }
  tbody tr:nth-of-type(even) {
    background-color: #f8f8f8;
  }
  tbody tr:last-of-type {
    border-bottom: 2px solid #398AB9;
  }
  td {
    border-left: 1px solid #dadada;
  }
  td:first-child {
    border-left: none;
  }
  .wraper{
    display: flex;
  }
  .qtyInputBox {
    align-items: center;
    vertical-align: center;
    display: inline-block;
    justify-content: space-between;
    margin: 0px;
    button {
      border: none;
      background: none;
    }
    input {
      margin:0px;
      text-align:center;
      font-size: 14pt;
      width:45px;
      border:none;
    }
    button:active {
      position: relative; 
      top:2px;
    }
  }
`

export const StockViewModal = styled.div`
  display:flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 13pt;

  h1 {
    flex-basis: 100%;
    margin: 0;
  }
  p {
    flex-basis: 100%;
  }
  div {
    
  }
  input {
    text-align:center;
    border-radius: 4px;
    border: 1px solid #398AB9;
  }
  .numberInput {
    input {
      width: 45px;
    }
  }
  .selectWrap {
    display: flex;
    input {
      width: 40px;
      flex: 1;
    }
    select {
      flex: 1;
      padding: 4px 0px 4px 0px;
      border-radius: 4px;
      border: 1px solid #398AB9;
    }
    button {
      background: white;
      padding: 0 3px 0 3px;
      border-radius: 4px;
      border: 1px solid #398AB9;
    }
  }
  .qtyInputBox {
    margin-left: 10px;
    align-items: center;
    vertical-align: center;
    display: inline-block;
    justify-content: space-between;
    button {
      border: none;
      background: none;
    }
    input {
      margin:0px;
      text-align:center;
      font-size: 14pt;
      width:45px;
      border:none;
    }
    button:active {
      position: relative; 
      top:2px;
    }
`

// 재고보고서 갱신 모바일용
export const StockBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 11px;
  h1 {
    margin-top: 12px;
    font-size: 14pt;
    padding: 5px;
    font-weight: bold;
    span {
      background-color: #2db7f5;
    }
    border-bottom: 1px solid #e4e4e4;
  }
  .container{
    padding: 14px;
    border: 1px solid #e4e4e4;
    border-radius: 12px;
    box-shadow: 0px 9px 10px -4px rgba(0,0,0,0.07);
  }
  .top {
    display: flex;
    padding-bottom: 5px;
    border-bottom: 1px solid #e4e4e4;
    .title {
      font-size: 12pt;
    }
    .action {
      margin-left:auto;
      .qtyInputBox {
        align-items: center;
        vertical-align: center;
        display: inline-block;
        justify-content: space-between;
        margin: 0px;
        button {
          border: none;
          background: none;
        }
        input {
          margin:0px;
          text-align:center;
          font-size: 14pt;
          width:45px;
          border:none;
        }
        button:active {
          position: relative; 
          top:2px;
        }
      }
    }
  }

  .bottom {
    margin-top: 10px;
    display: flex;
    gap: 10px;
    font-size: 11pt;
    flex-wrap: wrap;
    .memo {
      flex-basis: 100%;
      input {
        max-width: 100%;
      }
    }
    .lable {
      margin-right: 5px;
    }
    input, select {
      flex: 1;
      max-width: 90px;
      padding: 4px 0px 4px 0px;
      border-radius: 4px;
      border: 1px solid #398AB9;
    }
    .selectWrap {
      .number {
        text-align: center;
        width: 50px;
        font-weight: bold;
      }
      align-items: center;
      display: flex;
      button {
        align-self: stretch;
        background: white;
        padding: 0 3px 0 3px;
        border-radius: 4px;
        border: 1px solid #398AB9;
      }
    }
  }
`