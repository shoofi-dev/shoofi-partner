import { View, StyleSheet, ScrollView, Dimensions, I18nManager } from "react-native";
import MenuItem from "../menu-item";
import CategoryItem from "./category-item";
import { useEffect, useRef, useState } from "react";

export type TCategoryList = {
  categoryList: any;
  selectedCategory: any;
  onCategorySelect: (category: any) => void;
  isDisabledCatItem: boolean;
  style?: any;
};

const { width: screenWidth } = Dimensions.get("window");

const CategoryList = ({
  categoryList,
  selectedCategory,
  onCategorySelect,
  isDisabledCatItem,
  style,
}: TCategoryList) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const itemsLayoutRef = useRef<{ [key: string]: { x: number; width: number } }>(
    {}
  );
  const [contentWidth, setContentWidth] = useState(0);

  const scrollIfNeeded = (categoryId: string) => {
    if (
      categoryId &&
      scrollViewRef.current &&
      itemsLayoutRef.current[categoryId]
    ) {
      const { x, width } = itemsLayoutRef.current[categoryId];
      let scrollX = x - (screenWidth - width) / 2;

      if (I18nManager.isRTL) {
        const rtlX = contentWidth - x - width;
        scrollX = rtlX - (screenWidth - width) / 2;
      }

      if (contentWidth > screenWidth) {
        scrollViewRef.current.scrollTo({ x: scrollX, animated: true });
      }
    }
  };

  useEffect(() => {
    scrollIfNeeded(selectedCategory?._id);
  }, [selectedCategory]);

  const handleLayout = (event: any, categoryId: string) => {
    itemsLayoutRef.current[categoryId] = event.nativeEvent.layout;
    if (selectedCategory?._id === categoryId) {
      scrollIfNeeded(categoryId);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        ref={scrollViewRef}
        style={{ height: "100%", width: "100%" }}
        showsHorizontalScrollIndicator={false}
        decelerationRate={0.5}
        horizontal={true}
        contentContainerStyle={styles.scrollContent}
        onContentSizeChange={(width) => setContentWidth(width)}
      >
        {categoryList.map((category) => {
          if (!category.products || category.products.length === 0) {
            return null;
          }
          return (
            <CategoryItem
              key={category._id}
              item={category}
              onItemSelect={onCategorySelect}
              selectedItem={selectedCategory}
              isDisabledCatItem={isDisabledCatItem}
              onLayout={(event) => {
                handleLayout(event, category._id);
              }}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};
export default CategoryList;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    height: 56,
    width: "100%",
    marginTop: 5,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  categoryItem: {},
  iconContainer: {},
  itemsListConainer: {
    top: 120,
    position: "absolute",
    alignSelf: "center",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 10,
    bottom: 0,
    zIndex: -1,
  },
});
