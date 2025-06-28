import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { axiosInstance } from '../../utils/http-interceptor';
import { useTranslation } from 'react-i18next';

interface City {
  name: string;
  location: {
    lat: string;
    lng: string;
  };
}

interface CitiesListProps {
  onCitySelect?: (city: any) => void;
  selectedCity?: any | null;
}

const CitiesList: React.FC<CitiesListProps> = ({ onCitySelect, selectedCity }) => {
  const { t } = useTranslation();
  const [cities, setCities] = useState<Array<{ _id: string; nameAR: string; nameHE: string, geometry: any }>>([]);

  const fetchCities = async () => {
    const res: any = await axiosInstance.get("/delivery/cities");
    setCities(res);
  };
  useEffect(() => { fetchCities(); }, []);

  
  const isSelected = (city: any) => {

    if (!selectedCity) return false;
    return (
      city._id === selectedCity._id
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('cities')}</Text> 
      <FlatList
        data={cities}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={({ item }:any) => {
          const selected = isSelected(item);
          return (
            <TouchableOpacity
              style={[styles.cityItem, selected && styles.selectedCityItem]}
              onPress={() => onCitySelect && onCitySelect(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.cityName, selected && styles.selectedCityName]}>{item.nameAR}</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No cities available.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  cityItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 4,
  },
  selectedCityItem: {
    backgroundColor: '#e0f7fa',
  },
  cityName: {
    fontSize: 16,
    color: '#222',
  },
  selectedCityName: {
    fontWeight: 'bold',
    color: '#00796b',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});

export default CitiesList; 