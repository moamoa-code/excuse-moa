import axios from 'axios';
import { backUrl } from '../config/config';

axios.defaults.baseURL = backUrl;
axios.defaults.withCredentials = true; // 쿠키 포함
/**과거 주문 입력 API */
export function orderItemsByFactoryAPI(data: {
  items: any[];
  date: Date;
  status: string;
  factoryStatus: string;
  comment: string;
  providerId: string;
  customerId: string;
  address: string;
  name: string;
  phone: string;
  totalWeight: string;
}) {
  return axios.post(`/rest/order/old`, data).then((response) => response.data);
}
