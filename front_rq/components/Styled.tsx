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

// 레이아웃 대짜
export const ContainerBig = styled.div`
  max-width: 1024px;
  margin 0 auto;
  padding: 15px;
`

// 레이아웃 중간
export const ContainerMid = styled.div`
  max-width: 600px;
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
    position: absolute;
    font-size:12pt;
    font-wight:bold;
    top: 23px;
    right: 40px;
  }
  .delete{
    position: absolute;
    top: 23px;
    right: 5px;
    border: 1px solid #999999;
    background: #999999;
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
  padding: 20px 15px 20px 15px;
  box-sizing:border-box;
  width:100%;
  background-color:#fafafa;
`
// 공장-주문추가 
export const ItemsContainer = styled.div`
  overflow:auto;
  max-height:900px;
  text-align: center;
  width:100%;
  box-sizing: border-box;
  .selected {
    background-color: white;
    box-shadow: 4px 5px 10px 0px rgba(0,0,0,0.2);
}
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
// 공장-주문추가 제품 선택
export const ItemSelector = styled.div`
  display: inline-block;
  box-sizing: border-box;
  padding:5px;
  width: 340px;

  margin:8px;
  border: 1px dotted #444444;
  border-radius: 7px;

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
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 8;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: #ffffffe2;
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
    overflow: auto;
    min-width: 500px;
    max-width: 90%;
    max-height: 90%;
    z-index: 9;
    padding: 15px;
    background-color: white;
    border-radius: 10px;
    -webkit-box-shadow: 1px 1px 15px 3px rgba(0,0,0,0.34); 
    box-shadow: 1px 1px 15px 3px rgba(0,0,0,0.34);
    transition: opacity 1s;
  }
  .close {
    margin-top: 10px;
    float:right;
  }
`
export const ErrorMessage = styled.div`
  color: red;
`;


// 입력 폼 한줄
export const Block = styled.div`
  margin: 18px 0 18px 0;
  label {
    display: block;
    margin: 0 0 7px 0;
  }
  input {
    width: 100%;
    padding-left: 5px;
    height: 38px;
    border: 1px solid #999999;
    border-radius: 4px;
  }
`
// 검색
export const SearchBlock = styled.div`
  margin: 18px 0 18px 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  input {
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
    margin-left: 5px;
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
  padding: 10px 0px 10px 0px;
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
    font-size: 10pt;
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