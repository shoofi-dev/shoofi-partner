import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';


const _useAppCurrentState = () => {
  const appState = useRef(AppState.currentState);
  const [currentAppState, setCurrentAppState] = useState(appState.current);
  useEffect(() => {
    const subscription = AppState.addEventListener("change", nextAppState => {
      appState.current = nextAppState;
      setCurrentAppState(appState.current);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    currentAppState
  }
};

export default _useAppCurrentState;