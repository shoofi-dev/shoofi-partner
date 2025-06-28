import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Device from 'expo-device';


const _useDeviceType = () => {
  const appState = useRef(AppState.currentState);
  const [deviceType, setDeviceType] = useState();
  const initDeviceType = async () =>{
    setDeviceType(await Device.getDeviceTypeAsync())
  }
  useEffect(()=>{
    initDeviceType()
  });

  return {
    deviceType
  }
};

export default _useDeviceType;