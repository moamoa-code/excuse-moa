import axios from 'axios';
import { backUrl } from '../config/config';

axios.defaults.baseURL = backUrl;
axios.defaults.withCredentials = true; // 쿠키 포함

// 재고보고서 생성
export function createInventoryGroupAPI(data) {
  // data: { codeName: string, string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
  return axios.post('/inventory/create-group', data).then((response) => response.data);
}

// 재고보고서 목록 가져오가
export function getInventoriesAPI(groupId: number, page: number) {
  // data: { codeName: string, string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
  return axios.get(`/inventory/list/${groupId}/${page}`).then((response) => response.data);
}

// 재고보고서 그룹 가져오기
export function getInventoryGroupAPI(groupId: number) {
  // data: { codeName: string, string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
  return axios.get(`/inventory/group/${groupId}`).then((response) => response.data);
}

// 재고보고서 그룹 목록 가져오가
export function getInventoryGroupsAPI(userId: number) {
  // data: { codeName: string, string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
  return axios.get(`/inventory/group-list/${userId}`).then((response) => response.data);
}

// 재고보고서 + 재고보고서 상세 데이터 가져오기.
export function getInventoryDataAPI(id: number) {
  // data: { codeName: string, string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
  return axios.get(`/inventory/report/${id}`).then((response) => response.data);
}

// 재고보고서 확인 (메모, 상태 업데이트)
export function confirmInventoryReportAPI(data) {
  // data: { codeName: string, string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
  return axios.patch('/inventory/confirm', data).then((response) => response.data);
}

// 재고품 생성
export function createStockAPI(data) {
  // data: { codeName: string, string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
  return axios.post('/inventory/create-stock', data).then((response) => response.data);
}

// 재고품 생성
export function createInventoryAPI(data) {
  // data: { codeName: string, string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
  return axios.post('/inventory/create', data).then((response) => response.data);
}

// 재고품 삭제
export function deleteStockAPI(data) {
  // data: { codeName: string, string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
  return axios.patch('/inventory/delete-stock', data).then((response) => response.data);
}

// 재고보고서 삭제
export function deleteInventoryAPI(data) {
  // data: { codeName: string, string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
  return axios.patch('/inventory/delete', data).then((response) => response.data);
}

// 재고보고서 그룹 삭제
export function onDeleteInventoryGroupAPI(data) {
  // data: { codeName: string, string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
  return axios.patch('/inventory/delete-group', data).then((response) => response.data);
}

// 재고품목 가져오기
export function getSotcksAPI(data: number) {
  // data: { codeName: string, string, imgSrc: string|null, name: string, unit: string, msrp: string|null, supplyPrice: string|null }
  return axios.get(`/inventory/stocks/${data}`).then((response) => response.data);
}