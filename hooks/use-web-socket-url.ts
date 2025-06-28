import { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../stores';
import { WS_URL } from '../consts/api';
import { APP_NAME } from '../consts/shared';


const _useWebSocketUrl = () => {
    const { userDetailsStore, storeDataStore } =
      useContext(StoreContext);
  const [webScoketURL, setWebSocketUrl] = useState<any>(null);
  const initURL = async () =>{
    setWebSocketUrl(userDetailsStore.userDetails?.customerId ? `${WS_URL}?customerId=${userDetailsStore.isAdmin() ? storeDataStore.storeData?.appName : APP_NAME}${userDetailsStore.isAdmin() ? '__admin' : '' }__${userDetailsStore.userDetails?.customerId}` : null)
  }
  useEffect(()=>{
    initURL()
  });

  return {
    webScoketURL
  }
};

export default _useWebSocketUrl;