import { View, StyleSheet } from "react-native";
import theme from "../../../styles/theme.style";
import MapView, { Marker } from "react-native-maps";
import { SHIPPING_METHODS } from "../../../consts/shared";

export type TProps = {
  region: any;
  location: any;
};

export const MapViewAddress = ({ region, location }: TProps) => {
  console.log("location", location);
  return (
    <View
      pointerEvents="none"
      style={{
        alignItems: "center",
        paddingHorizontal: 1,
        width: "100%",
      }}
    >
      {location ? (
        <View style={styles.mapViewContainer}>
          <MapView
            style={styles.mapContainer}
            region={{
              latitude: location.lat,
              longitude: location.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            {location && (
              <Marker
                coordinate={{
                  latitude: location.lat,
                  longitude: location.lng,
                }}
              />
            )}
          </MapView>
        </View>
      ) : (
        <MapView
          style={styles.mapContainerDefault}
          initialRegion={{
            latitude: location.lat,
            latitudeDelta: 0.01,
            longitude: location.lng,
            longitudeDelta: 0.01,
          }}
        ></MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainerDefault: {
    height: 120,
    borderRadius: 10,
    minHeight: 120,
  },
  mapContainer: {
    width: "100%",
    height: 120,
    borderRadius: 10,
    minHeight: 120,
  },
  mapViewContainer: {
    width: "100%",
    height: 130,
    borderRadius: 4,
    minHeight: 140,
    alignSelf: "center",
    backgroundColor: theme.GRAY_10,  
    padding: 10,
  },
});
