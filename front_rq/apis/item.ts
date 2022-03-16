import axios from 'axios';
import { backUrl } from '../config/config';
import User from '../interfaces/user';

axios.defaults.baseURL = backUrl;
axios.defaults.withCredentials = true; // 쿠키 포함

// 단일 제품 조회
export function loadItemAPI(data: number){
  return axios.get(`/item/${data}`).then((response) => response.data);
}

// 카트에 담긴 제품 불러오기
export function loadCartAPI(userId: string){
  return axios.get(`/item/cart/${userId}`).then((response) => response.data);
}

// 주문서 불러오기
export function loadOrderAPI(orderId: number){
  return axios.get(`/item/order/${orderId}`).then((response) => response.data);
}

// 주문서 목록 불러오기 (고객용)
export function loadOrdersAPI(userId: string){
  return axios.get(`/item/orders/${userId}`).then((response) => response.data);
}

// 제품 리스트 불러오기
export function loadItemsAPI(){
  console.log('loadItemsAPI 실행');
  return axios.get(`/item/all`).then((response) => response.data);
}

// 제품 리스트 불러오기 (판매자)
export function loadMyItemsAPI(){
  return axios.get(`/item/my`).then((response) => response.data);
}

// 제품 리스트 불러오기 (특정 판매자)
export function loadItemListAPI(userId: string){
  return axios.get(`/item/list/${userId}`).then((response) => response.data);
}

// 제품 리스트 불러오기 (구매자)
export function loadCustomerItemsAPI(){
  return axios.get(`/item/customer`).then((response) => response.data);
}

// 제품 리스트 불러오기 (구매자)
export function loadCustomerItemListAPI(userId){
  return axios.get(`/item/list-customer/${userId}`).then((response) => response.data);
}

// 제품 등록
export function registerItemAPI(data: FormData) {
  // data: { codeName: string, string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
  return axios.post('/item/regist', data).then((response) => response.data);
}

// 제품 수정
export function updateItemAPI(data: FormData) {
  // data: { itemId: number, codeName: string, string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
  return axios.post('/item/update', data).then((response) => response.data);
}

// 제품 삭제
export function deleteItemAPI(data: { itemId: number }) {
  return axios.patch('/item/delete', data).then((response) => response.data);
}

// 제품 사진 업로드
export function uploadImageAPI<T>(data: FormData) {
  return axios.post<T>('/item/image', data).then((response) => response.data);
}

// export function addCustomerToItemAPI(data: {itemId: number, customerId}){
// 제품에 열람가능한 유저 등록
export function addCustomerToItemAPI(data){
  return axios.post(`/item/add-customer/`, data).then((response) => response.data);
}

// 제품 카트에 넣기
export function addCartAPI(data: {itemId: number, userId: string}){
  return axios.patch(`/item/add-cart/`, data).then((response) => response.data);
}

// 제품 카트에서 빼기
export function removeCartAPI(data: {itemId: number, userId: string}){
  return axios.patch(`/item/remove-cart/`, data).then((response) => response.data);
}