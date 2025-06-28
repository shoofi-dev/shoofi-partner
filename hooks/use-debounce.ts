import debounce from 'lodash.debounce';
import { useEffect, useMemo, useRef } from 'react';

export const _useDebounce = (callback: Function, delay?: number) => {
  const ref = useRef<any>();

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = () => {
      ref.current?.();
    };

    return debounce(func, delay || 500);
  }, []);

  return debouncedCallback;
};