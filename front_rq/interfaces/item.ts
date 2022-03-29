import User from './user';

export default interface Item {
  id: number;
  codeName: string;
  name: string;
  packageName: string;
  unit: string;
  msrp: string|null;
  supplyPrice: string|null;
  imgSrc: string|null;
  description: string|null;
  UserId: Partial<User> & { id: string };
  ItemViewUsers: any;
}
