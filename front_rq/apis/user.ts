import axios from 'axios';
import { backUrl } from '../config/config';

axios.defaults.baseURL = backUrl;
axios.defaults.withCredentials = true; // 쿠키 포함

export function loadMyInfoAPI() {
  return axios.get('/user').then((response) => response.data);
}

// 회사명으로 유저들 찾기
export function searchUsersByCompanyAPI(keyword) { 
  return axios.get(`/user/search-company/${keyword}`).then((response) => response.data);
}

// 유저정보 불러오기
export function loadUserAPI(data: string) { // key로 찾음
  return axios.get(`/user/${data}`).then((response) => response.data);
}

// 유저정보 불러오기
export function loadUserByIdAPI(data: number) { // id:string 으로 찾음
  return axios.get(`/user/id/${data}`).then((response) => response.data);
}

// 판매자 목록 불러오기
export function loadProvidersAPI() {
  return axios.get(`/user/show-provider`).then((response) => response.data);
}

// 특정 판매자 정보 불러오기
export function loadProviderAPI(data: string) {
  return axios.get(`/user/provider/${data}`).then((response) => response.data);
}

// 특정 판매자 정보 불러오기
export function loadProviderByIdAPI(data: number) {
  return axios.get(`/user/provider-id/${data}`).then((response) => response.data);
}

// 로그인
export function logInAPI(data: { key: string; password: string }) {
  return axios.post('/user/login', data).then((response) => response.data);
}

export function logOutAPI() {
  return axios.post('/user/logout').then((response) => response.data);
}

// export function createUserAPI(data: { providerId: string, id: string, password: string, company: string, name: string, phone: string, email: string|null, hqNumber: string|null }) {
//   return axios.post('/user/create', data).then((response) => response.data);
// }

export function createUserAPI(data) {
  return axios.post('/user/create', data).then((response) => response.data);
}

// 회원가입
export function signUpAPI(data: { key: string, password: string, company: string, name: string|null, phone: string|null, email: string|null, hqNumber: string|null }) {
  return axios.post('/user', data).then((response) => response.data);
}

// 복수회원 생성
export function createUsersAPI(data) {
  return axios.post('/user/multi-create', data).then((response) => response.data);
}

// 회원탈퇴
export function resignAPI() {
  return axios.patch('/user/resign').then((response) => response.data);
}

// 회원삭제
export function terminateUserAPI(data: { userKey }) {
  return axios.patch('/user/terminate', data).then((response) => response.data);
}

// 회원 메모 수정
export function updateMemoAPI(data: { userId, memo }) {
  return axios.patch('/user/memo', data).then((response) => response.data);
}

// 주소 등록
export function registAddrAPI(data: {addrName:String, zipCode:String, addressDetail:String, phone:Number}) {
  return axios.post('/user/addr', data).then((response) => response.data);
}

// 주소 등록 (관리자모드)
export function addNewAddrAPI(data) {
  return axios.post('/user/add-addr', data).then((response) => response.data);
}

// 주소 삭제
export function removeAddrAPI(data: { id: Number }) {
  return axios.patch('/user/addr/remove', data).then((response) => response.data);
}

// 주소 목록 불러오기
export function loadAddrsAPI(data: Number) { // id:Number 으로 찾음S
  return axios.get(`/user/addr/${data}`).then((response) => response.data);
}

// 정보 수정
export function editMyInfoAPI(data: { key: string, password: string, company: string, name: string|null, phone: string|null, email: string|null, hqNumber: string|null } ) {
  return axios.patch('/user/edit', data).then((response) => response.data);
}

// 고객등록
export function addCustomerAPI(data: { providerKey: string, customerKey: string } ) {
  return axios.patch('/user/add-customer', data).then((response) => response.data);
}

// 고객삭제
export function deleteCustomerAPI(data: { providerKey: string, customerKey: string } ) {
  return axios.patch('/user/delete-customer', data).then((response) => response.data);
}

export function addItemToCustomerAPI(data) {
return axios.patch('/user/add-item', data).then((response) => response.data);
}

export function removeItemToCustomerAPI(data: {itemId: number, customerKey: string}) {
  return axios.patch('/user/remove-item', data).then((response) => response.data);
  }

// 모든 회원 목록 가져오기
export function loadAllUserListAPI(page: Number) {
  return axios.get(`/user/list/${page}`).then((response) => response.data);
}

// 회원 등급 변경하기
export function updateUserRoleAPI(data: {userId: string, role: string}) {
  return axios.patch('/user/update-role', data).then((response) => response.data);
}

// 회원 정보 수정하기
export function updateUserAPI(data: { userKey: string, userId: string, company: string, name: string, phone: string, email: string, role: string } ) {
  return axios.patch('/user/update', data).then((response) => response.data);
}

// 회원 비밀번호 초기화하기
export function changePasswordAPI(data: { userId: string, password: string } ) {
  return axios.patch('/user/update-password', data).then((response) => response.data);
}