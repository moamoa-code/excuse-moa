import { useState, useCallback, SetStateAction, Dispatch } from 'react';

// input onchange 훅
type ReturnType<T> = [T, (e: any) => void, Dispatch<SetStateAction<T>>];
export default <T extends string>(initialValue: T): ReturnType<T> => {
  const [value, setValue] = useState<T>(initialValue);
  const handler = useCallback((e) => {
    setValue(e.target.value);
  }, []);
  return [value, handler, setValue];
};
