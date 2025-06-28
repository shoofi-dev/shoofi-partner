import React, { forwardRef, useImperativeHandle, useRef, useCallback, useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../../stores";
import themeStyle from "../../../styles/theme.style";
import { useNavigation } from "@react-navigation/native";
import ProductItem from "./product-item/index";
import * as Haptics from "expo-haptics";
import Modal from "react-native-modal";
import MealScreen from "../../meal/index2";
import GlassBG from "../../../components/glass-background";
import MealModal from './../../../components/MealModal';
const categoryHeaderHeight = 40;
const productHeight = 140;
const sectionMargin = 24;

interface AllCategoriesListProps {
  categoryList: any[];
  ListHeaderComponent?: React.ReactElement;
}

export interface AllCategoriesListRef {
  scrollToCategory: (categoryId: string) => void;
}

const screenHeight = Dimensions.get('window').height;

// Memoized ProductItem for better performance
const MemoizedProductItem = ProductItem;

// Memoized category section component
const CategorySection = ({ category, languageStore, onItemSelect }: {
  category: any;
  languageStore: any;
  onItemSelect: (item: any, category: any) => void;
}) => {
  if (!category.products || category.products.length === 0) {
    return null;
  }

  const categoryName = languageStore.selectedLang === "ar" 
    ? category.nameAR 
    : category.nameHE;

  const renderProduct = useCallback(({ item: product }) => (
    <ProductItem
      key={product._id}
      item={product}
      onItemSelect={(item) => onItemSelect(item, category)}
      onDeleteProduct={() => {}}
      onEditProduct={() => {}}
    />
  ), [category, onItemSelect]);

  const keyExtractor = useCallback((item) => item._id, []);

  return (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{categoryName}</Text>
      </View>
      <View style={styles.productsContainer}>
        <FlatList
          data={category.products}
          keyExtractor={keyExtractor}
          renderItem={renderProduct}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={5}
          initialNumToRender={5}
          updateCellsBatchingPeriod={50}
          disableVirtualization={false}
        />
      </View>
    </View>
  );
};

const AllCategoriesList = forwardRef<AllCategoriesListRef, AllCategoriesListProps>(
  ({ categoryList, ListHeaderComponent }, ref) => {
    const navigation = useNavigation<any>();
    const { languageStore } = useContext(StoreContext);
    const flatListRef = useRef<FlatList>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    
    // Memoize category offsets calculation
    const categoryOffsets = useMemo(() => {
      const offsets = [];
      let currentOffset = 0;
      
      for (let i = 0; i < categoryList.length; i++) {
        offsets.push(currentOffset);
        const category = categoryList[i];
        if (category && category.products && category.products.length > 0) {
          const productsHeight = category.products.length * productHeight;
          currentOffset += categoryHeaderHeight + productsHeight + sectionMargin;
        }
      }
      
      return offsets;
    }, [categoryList]);

    // Calculate estimated heights for each category
    const getCategoryOffset = useCallback((categoryIndex: number) => {
      return categoryOffsets[categoryIndex] || 0;
    }, [categoryOffsets]);

    useImperativeHandle(ref, () => ({
      scrollToCategory: (categoryId: string) => {
        const categoryIndex = categoryList.findIndex(cat => cat._id === categoryId);
        if (categoryIndex !== -1) {
          console.log("categoryIndex", categoryIndex);
          
          // Calculate the offset for this category
          const offset = getCategoryOffset(categoryIndex);
          console.log("scrollToOffset", offset);
          
          flatListRef.current?.scrollToOffset({
            offset: offset,
            animated: true,
          });
        }
      },
    }), [categoryList, getCategoryOffset]);

    const onItemSelect = useCallback((item, category) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelectedProduct(item);
      setSelectedCategory(category);
      setIsModalOpen(true);
    }, []);

    const renderCategorySection = useCallback(({ item: category }) => {
      return (
        <CategorySection
          category={category}
          languageStore={languageStore}
          onItemSelect={onItemSelect}
        />
      );
    }, [languageStore, onItemSelect]);

    const keyExtractor = useCallback((item) => item._id, []);

    const getItemLayout = useCallback((data, index) => {
      const category = data[index];
      if (!category || !category.products || category.products.length === 0) {
        return { length: 0, offset: 0, index };
      }
      
      const productsHeight = category.products.length * productHeight;
      const length = categoryHeaderHeight + productsHeight + sectionMargin;
      
      return { length, offset: categoryOffsets[index] || 0, index };
    }, [categoryOffsets]);
    return (
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={categoryList}
          keyExtractor={keyExtractor}
          renderItem={renderCategorySection}
          ListHeaderComponent={ListHeaderComponent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          scrollEventThrottle={16}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={10}
          // initialNumToRender={3}
          getItemLayout={getItemLayout}
          updateCellsBatchingPeriod={50}
          disableVirtualization={false}
        />
        <Modal 
          isVisible={isModalOpen} 
          onBackdropPress={() => setIsModalOpen(false)}
          style={styles.modal}
          animationIn="slideInUp"
          animationOut="slideOutDown"
          backdropOpacity={0.5}
        >
          <MealModal 
            product={selectedProduct} 
            category={selectedCategory} 
            onClose={() => setIsModalOpen(false)} 
          />
        </Modal>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContainer: {
    paddingBottom: 20,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    paddingHorizontal: 16,
    height: 40,
    justifyContent: "center",
  },
  categoryTitle: {
    fontSize: themeStyle.FONT_SIZE_XL,
    fontWeight: "bold",
    color: themeStyle.GRAY_900,
    textAlign: "left",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: themeStyle.GRAY_600,
    textAlign: "right",
  },
  productsContainer: {
  },
  modalContainer: {
    maxHeight: screenHeight * 0.9,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    backgroundColor: "#fff",
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 1000,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButtonInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default observer(AllCategoriesList); 