import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import CitiesList from '../components/address/CitiesList';

const cities = [
  { name: 'תל אביב', location: { lat: '32.0853', lng: '34.7818' } },
  { name: 'ירושלים', location: { lat: '31.7683', lng: '35.2137' } },
  { name: 'חיפה', location: { lat: '32.7940', lng: '34.9896' } },
  { name: 'באר שבע', location: { lat: '31.2518', lng: '34.7913' } },
];

const CitiesScreen = () => {
  const [selectedCity, setSelectedCity] = useState(null);

  return (
    <View style={styles.container}>
      <CitiesList
        cities={cities}
        selectedCity={selectedCity}
        onCitySelect={setSelectedCity}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CitiesScreen; 