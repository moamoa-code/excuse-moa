import axios from 'axios';
import { backUrl } from '../config/config';

axios.defaults.baseURL = backUrl;
axios.defaults.withCredentials = true; // 쿠키 포함

export function loadMyInfoAPI() {
  return axios.get('/user').then((response) => response.data);
}

// 유저정보 불러오기
export function loadUserAPI(data: string) { // id:string 으로 찾음
  return axios.get(`/user/${data}`).then((response) => response.data);
}

// 판매자 목록 불러오기
export function loadProvidersAPI() {
  return axios.get(`/user/show-provider`).then((response) => response.data);
}

// 특정 판매자 정보 불러오기
export function loadProviderAPI(data: string) {
  return axios.get(`/user/provider/${data}`).then((response) => response.data);
}


// 로그인
export function logInAPI(data: { id: string; password: string }) {
    console.log('loginAPI 실행', data);
  return axios.post('/user/login', data).then((response) => response.data);
}

export function logOutAPI() {
  return axios.post('/user/logout').then((response) => response.data);
}

export function createUserAPI(data: { providerId: string, id: string, password: string, company: string, name: string, phone: string, email: string|null, hqNumber: string|null }) {
  return axios.post('/user/create', data).then((response) => response.data);
}

// 회원가입
export function signUpAPI(data: { id: string, password: string, company: string, name: string|null, phone: string|null, email: string|null, hqNumber: string|null }) {
  return axios.post('/user', data).then((response) => response.data);
}

// 회원탈퇴
export function resignAPI() {
  return axios.patch('/user/resign').then((response) => response.data);
}

// 주소 등록
export function registAddrAPI(data: {addrName:String, zipCode:String, addressDetail:String, phone:Number}) {
  console.log('registAddrAPI', data);
  return axios.post('/user/addr', data).then((response) => response.data);
}

// 주소 삭제
export function removeAddrAPI(data: { id: Number }) {
  return axios.patch('/user/addr/remove', data).then((response) => response.data);
}

// 주소 목록 불러오기
export function loadAddrsAPI(data:string) { // id:string 으로 찾음S
  return axios.get(`/user/addr/${data}`).then((response) => response.data);
}

// 정보 수정
export function editUserAPI(data: { id: string, password: string, company: string, name: string|null, phone: string|null, email: string|null, hqNumber: string|null } ) {
  return axios.patch('/user/edit', data).then((response) => response.data);
}

// 고객등록
export function addCustomerAPI(data: { providerId: string, customerId: string } ) {
  return axios.patch('/user/addcustomer', data).then((response) => response.data);
}

// 고객삭제
export function deleteCustomerAPI(data: { providerId: string, customerId: string } ) {
  return axios.patch('/user/deletecustomer', data).then((response) => response.data);
}

export function addItemToCustomerAPI(data: {itemId: number, customerId: string}) {
return axios.patch('/user/add-item', data).then((response) => response.data);
}

export function removeItemToCustomerAPI(data: {itemId: number, customerId: string}) {
  return axios.patch('/user/remove-item', data).then((response) => response.data);
  }