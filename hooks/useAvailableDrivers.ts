import { useContext, useEffect, useState } from "react";
import { StoreContext } from "../stores";

/**
 * useAvailableDrivers
 * @param {object} params
 * @param {object} params.addressStore - MobX address store (must have defaultAddress)
 * @param {object} params.storeDataStore - MobX store data store (must have storeData)
 * @param {object} params.shoofiAdminStore - MobX admin store (must have getAvailableDrivers)
 * @returns {object} { availableDrivers, loading, error }
 */
export function useAvailableDrivers({ isEnabled = true }: { isEnabled?: boolean } = {}) {
  const { storeDataStore, shoofiAdminStore, addressStore } =
    useContext(StoreContext);
  const [availableDrivers, setAvailableDrivers] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  console.log("storeDataStore.storeData", storeDataStore.storeData);
  useEffect(() => {
    if (!storeDataStore.storeData || !isEnabled) return;
    const defaultAddress = addressStore.defaultAddress;
    if (
      defaultAddress &&
      defaultAddress.location &&
      defaultAddress.location.coordinates
    ) {
      const [lng, lat] = defaultAddress.location.coordinates;
      console.log("defaultAddress222@@", defaultAddress.location.coordinates);
      setCustomerLocation({ lat, lng });
      let storeLocation = undefined;
      if (storeDataStore.storeData?.location) {
        const { lat: storeLat, lng: storeLng } =
          storeDataStore.storeData.location;
        storeLocation = { lat: storeLat, lng: storeLng };
      }
      setLoading(true);
      setError(null);
      shoofiAdminStore
        .getAvailableDrivers({ lat, lng }, storeLocation)
        .then((res) => {
          setAvailableDrivers(res);
        })
        .catch((err) => {
          setError(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [addressStore.defaultAddress, storeDataStore.storeData?.location, isEnabled]);

  return { availableDrivers, loading, error, customerLocation, defaultAddress: addressStore.defaultAddress };
}
