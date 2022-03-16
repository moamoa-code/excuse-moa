import axios from 'axios';
import { backUrl } from '../config/config';
import User from '../interfaces/user';

axios.defaults.baseURL = backUrl;
axios.defaults.withCredentials = true; // 쿠키 포함

// 게시글 등록
export function registerPostAPI(data: FormData) {
  // data: { codeName: string, string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
  return axios.post('/post/regist', data).then((response) => response.data);
}

// 게시글 수정
export function editPostAPI(data: FormData) {
  // data: { codeName: string, string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
  return axios.post('/post/edit', data).then((response) => response.data);
}

// 게시글 삭제
export function deltePostAPI(data) {
  // data: { codeName: string, string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
  return axios.patch('/post/delete', data).then((response) => response.data);
}

// 아이디로 단일 게시글 조회
export function loadPostAPI(data: number){
  return axios.get(`/post/${data}`).then((response) => response.data);
}

// 최근 단일 게시글 조회
export function loadRecentPostAPI(){
  return axios.get(`/post/recent`).then((response) => response.data);
}

// 구매자가 볼 수 있는 게시글 리스트
export function loadPostListAPI(){
  return axios.get(`/post/list`).then((response) => response.data);
}

// 판매자가 작성한 게시글 리스트
export function loadMyPostListAPI(){
  return axios.get(`/post/my`).then((response) => response.data);
}

// 게시글 사진 업로드
export function uploadImageAPI<T>(data: FormData) {
  return axios.post<T>('/post/image', data).then((response) => response.data);
}

// 게시글 열람가능한 유저 등록
// export function addCustomerToPostAPI(data: {id: number, customerId: string[]}){
export function addCustomerToPostAPI(data){
  return axios.post(`/post/add-customer/`, data).then((response) => response.data);
}