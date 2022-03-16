import { useState, useCallback, SetStateAction, Dispatch } from 'react';

// form의 input의 값을 state에 넣는 핸들러와 serValue 리턴
type ReturnType<T> = [T, (e: any) => void, Dispatch<SetStateAction<T>>];
export default <T extends string>(initialValue: T): ReturnType<T> => {
  const [value, setValue] = useState<T>(initialValue);
  const handler = useCallback((e) => {
    setValue(e.target.value);
  }, []);
  return [value, handler, setValue];
};
