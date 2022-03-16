import User from './user';

export default interface Item {
  id: number;
  date: string;
  totalPrice: string;
  comment: string;
  address: string;
  zip: string|null;
  name: string|null;
  imgSrc: string|null;
  UserId: Partial<User> & { id: number };
  AuthorisedUser: Partial<User> & { id: number }[];
}