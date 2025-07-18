import React, { useState, useMemo, useContext, useCallback } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { cdnUrl } from '../../consts/shared';
import CustomFastImage from '../custom-fast-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StoreContext } from '../../stores';
import { useNavigation } from '@react-navigation/native';
import { SHIPPING_METHODS } from '../../consts/shared';

const { width } = Dimensions.get('window');
const CARD_HEIGHT = 185;
const CARD_RADIUS = 16;

export type Ad = {
  id: string;
  background: string; // background image uri
  products: string[]; // array of product image uris
  title: string;
  subtitle: string;
  appName?: string; // Store appName for navigation
};

type AdsCarouselProps = {
  ads: Ad[];
};

const AdsCarousel: React.FC<AdsCarouselProps> = ({ ads }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigation = useNavigation();
  const { cartStore, menuStore, shoofiAdminStore } = useContext(StoreContext);

  // Handle ad press - navigate to store if appName is provided
  const handleAdPress = useCallback(async (ad: Ad) => {
    if (ad.appName) {
      try {
        // Set shipping method to take away
        await cartStore.setShippingMethod(SHIPPING_METHODS.takAway);
        
        // Clear current menu
        menuStore.clearMenu();
        
        // Set the store database name
        await shoofiAdminStore.setStoreDBName(ad.appName);
        
        // Navigate to menu screen
        (navigation as any).navigate("menuScreen", { 
          fromStoresList: Date.now(),
          fromAd: true 
        });
      } catch (error) {
        console.error("Error navigating to store from ad:", error);
        Alert.alert("שגיאה", "שגיאה בניווט לחנות");
      }
    }
    // If no appName, the ad is just informational and doesn't navigate anywhere
  }, [cartStore, menuStore, shoofiAdminStore, navigation]);

  return (
    <View style={styles.carouselContainer}>
      <Carousel
        width={width - 32}
        height={CARD_HEIGHT}
        data={ads}
        autoPlay={true}
        scrollAnimationDuration={1000}
        autoPlayInterval={3000}
        onSnapToItem={setActiveIndex}
        style={{ borderRadius: CARD_RADIUS }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleAdPress(item)}
            activeOpacity={0.9}
            style={styles.cardContainer}
          >
            <ImageBackground
              source={{ uri: cdnUrl + item.background }}
              style={styles.card}
              imageStyle={{ borderRadius: CARD_RADIUS }}
              resizeMode="cover"
            >
              {/* Floating product images */}
              <View style={styles.productsRow}>
                {item.products.map((img, idx) => (
                  <CustomFastImage
                    key={img + idx}
                    source={{ uri: cdnUrl + img }}
                    style={styles.productImg}
                    resizeMode="cover"
                    cacheKey={img.split(/[\\/]/).pop()}
                  />
                ))}
              </View>
              {/* Text overlay with gradient */}
              <LinearGradient
                colors={["#00000000", "#232323"]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.gradientOverlay}
              >
                <View style={styles.textOverlay}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.subtitle}>{item.subtitle}</Text>
                  {item.appName && (
                    <Text style={styles.storeIndicator}>לחץ לבקר בחנות</Text>
                  )}
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        )}
      />
      {/* Pagination dots */}
      <View style={styles.dotsRow}>
        {ads.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              activeIndex === idx && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    width: width,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  cardContainer: {
    width: width - 32,
    height: CARD_HEIGHT,
    borderRadius: CARD_RADIUS,
  },
  card: {
    width: width - 32,
    height: CARD_HEIGHT,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 16,
  },
  productsRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT - 40,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  productImg: {
    width: 40,
    height: 40,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: 'transparent',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    borderBottomLeftRadius: CARD_RADIUS,
    borderBottomRightRadius: CARD_RADIUS,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 2,
  },
  textOverlay: {
    zIndex: 3,
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: 'left',
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: 'left',
  },
  storeIndicator: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: 'left',
    marginTop: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: '#a78bfa',
    width: 10,
    height: 10,
  },
});

export default AdsCarousel; 