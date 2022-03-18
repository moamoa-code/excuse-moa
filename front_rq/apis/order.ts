import axios from 'axios';
import { backUrl } from '../config/config';

axios.defaults.baseURL = backUrl;
axios.defaults.withCredentials = true; // 쿠키 포함

// 주문확인 완료 (판매자)
// export function confirmOrderAPI(data: {orderId: number, message: string}){
export function confirmOrderAPI(data){
  return axios.patch(`/order/confirm/`, data).then((response) => response.data);
}

// 주문취소 완료 (판매자)
// export function cancelOrderAPI(data: {orderId: number, message: string}){
export function cancelOrderAPI(data: {orderId: any, message: string}){
  return axios.patch(`/order/cancel/`, data).then((response) => response.data);
}

// 주문취소 요청 (구매자)
// export function requestCancelOrderAPI(data: {orderId: number, message: string}){
export function requestCancelOrderAPI(data){
  return axios.patch(`/order/req-cancel/`, data).then((response) => response.data);
}

// 주문서 불러오기 (구매자)
// export function loadMyOrdersAPI(userId: string, dates: [any, any]){
export function loadMyOrdersAPI(userId, dates){
  return axios.get(`/order/${userId}/${dates[0]}/${dates[1]}`).then((response) => response.data);
}


// 공장에서 제품 주문
export function orderPosItemAPI(data: {items: any[], providerId: string, customerId: string, address: string, name: string, phone: string}){
  return axios.post(`/order/from-factory`, data).then((response) => response.data);
}

// // 공장에서 제품 주문
// export function orderPosItemAPI(data: {items: Object, providerId: string, customerId: string, address: string, name: string, phone: string}){
//   return axios.post(`/order/from-factory`, data).then((response) => response.data);
// }

// 카트에서 제품 주문
export function orderItemAPI(data: {items: Object, comment: string, userId: string, zip: string, address: string, name: string, phone: string}){
  return axios.post(`/order/`, data).then((response) => response.data);
}

// 주문서 목록 불러오기 (판매자용)
// export function loadReceivedOrdersWithDatesAPI(userId: string, dates?: [any, any]){
export function loadReceivedOrdersWithDatesAPI(userId, dates){
  return axios.get(`/order/received-orders-dates/${userId}/${dates[0]}/${dates[1]}`).then((response) => response.data);
}

export function loadAllOrders(){
  return axios.get(`/order/all`).then((response) => response.data);
}

// export function loadTodosAPI(params){
//   return axios.get(`/order/todos`, {params}).then((response) => response.data);
// }

export function loadTodosAPI(data){
  return axios.post(`/order/todos`, data).then((response) => response.data);
}

// 주문서 목록 불러오기 (판매자용)
export function loadReceivedOrdersAPI(userId: string, number?: number){
  if (number){
    return axios.get(`/order/received-orders-three/${userId}`).then((response) => response.data);
  }
  return axios.get(`/order/received-orders/${userId}`).then((response) => response.data);
}

// 포장 완료 (생산자)
export function packDoneAPI(data){
  return axios.patch(`/order/pack-complete/`, data).then((response) => response.data);
}

// 포장 완료 (생산자)
export function packCancelAPI(data){
  return axios.patch(`/order/pack-cancel/`, data).then((response) => response.data);
}

// 출하 작업 완료 taskDonAPI
export function taskDoneAPI(data){
  return axios.patch(`/order/task-complete/`, {ids:data}).then((response) => response.data);
}