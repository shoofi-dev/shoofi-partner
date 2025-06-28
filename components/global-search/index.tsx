import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const GlobalSearch = ({ value, onChangeText, placeholder = 'חפש מסעדות, חנויות, מוצרים' }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        textAlign="right"
      />
      <Icon name="search" size={22} color="#999" style={styles.icon} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#f5f6f7',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
    margin: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  icon: {
    marginLeft: 6,
  },
});

export default GlobalSearch; 