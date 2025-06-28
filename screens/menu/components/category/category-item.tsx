import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import Text from "../../../../components/controls/Text";
import { observer } from "mobx-react";
import themeStyle from "../../../../styles/theme.style";

/* components */
import Icon from "../../../../components/icon";
import { getCurrentLang } from "../../../../translations/i18n";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { StoreContext } from "../../../../stores";
import { cdnUrl } from "../../../../consts/shared";
import { LinearGradient } from "expo-linear-gradient";

export type TProps = {
  item: any;
  onItemSelect: (item: any) => void;
  selectedItem: any;
  isDisabledCatItem?: any;
  onLayout?: (event: any) => void;
};

const CategoryItem = ({
  item,
  onItemSelect,
  selectedItem,
  isDisabledCatItem,
  onLayout,
}: TProps) => {
  const { t } = useTranslation();
  const { languageStore } = useContext(StoreContext);
  const isSelected = selectedItem._id === item._id;
  return (
    <TouchableOpacity
      onLayout={onLayout}
      style={[
        styles.pill,
        isSelected ? styles.pillSelected : styles.pillUnselected,
      ]}
      onPress={() => onItemSelect(item)}
      disabled={isDisabledCatItem}
      activeOpacity={0.8}
    >
      <Text style={ isSelected ? styles.pillTextSelected : styles.pillTextUnselected}>
        {languageStore.selectedLang === "ar" ? item.nameAR : item.nameHE}
      </Text>
    </TouchableOpacity>
  );
};

export default observer(CategoryItem);

const styles = StyleSheet.create({
  pill: {
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 2,
    marginHorizontal: 6,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  pillSelected: {
    backgroundColor: themeStyle.PRIMARY_COLOR,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eee",
  },
  pillUnselected: {
    backgroundColor: "transparent",
    borderWidth: 0,
    elevation: 0,
  },
  pillText: {
    fontSize: themeStyle.FONT_SIZE_MD,
    textAlign: "center",
  },
  pillTextSelected: {
    color: themeStyle.GRAY_80,
    fontSize: themeStyle.FONT_SIZE_MD,

  },
  pillTextUnselected: {
    color: themeStyle.GRAY_80,
    fontSize: themeStyle.FONT_SIZE_MD,

  },
});
