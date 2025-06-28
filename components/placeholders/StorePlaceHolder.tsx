import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import themeStyle from '../../styles/theme.style';

const { width } = Dimensions.get('window');

const Placeholder = ({ style }) => <View style={[styles.placeholder, style]} />;

const StorePlaceHolder = () => {
  return (
    <View style={styles.container}>
      <Placeholder style={styles.headerImage} />

      <View style={styles.content}>
        <View style={styles.storeCard}>
          <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center', marginRight: 15 }}>
            <Placeholder style={{ width: '60%', height: 20, borderRadius: 4, marginBottom: 10 }} />
            <Placeholder style={{ width: '40%', height: 15, borderRadius: 4 }} />
          </View>
          <Placeholder style={styles.logo} />
        </View>

        <View style={styles.shippingContainer}>
          <Placeholder style={styles.shippingButton} />
          <Placeholder style={styles.shippingButton} />
        </View>

        <Placeholder style={styles.categoryTitle} />

        {[1, 2, 3, 4, 5].map((item) => (
          <View style={styles.productItem} key={item}>
            <View style={{ flex: 1, alignItems: 'flex-start' }}>
              <Placeholder style={{ width: '70%', height: 20, marginBottom: 10, borderRadius: 4 }} />
              <Placeholder style={{ width: '30%', height: 15, borderRadius: 4 }} />
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Placeholder style={styles.addButton} />
                <Placeholder style={styles.productImage} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  placeholder: {
    backgroundColor: '#E1E9EE',
  },
  headerImage: {
    width: '100%',
    height: 160,
  },
  content: {
    paddingHorizontal: 15,
  },
  storeCard: {
    flexDirection: 'row-reverse',
    backgroundColor: themeStyle.WHITE_COLOR,
    borderRadius: 15,
    padding: 15,
    height: 90,
    marginTop: -45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  shippingContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  shippingButton: {
    width: width / 2 - 25,
    height: 45,
    borderRadius: 25,
  },
  categoryTitle: {
    width: '50%',
    height: 25,
    marginBottom: 20,
    alignSelf: 'flex-end',
    borderRadius: 4
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  addButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      marginRight: 10
  }
});

export default StorePlaceHolder; 