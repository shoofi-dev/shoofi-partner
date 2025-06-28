import { useTranslation } from "react-i18next";
import { Animated, View } from "react-native";
import { observer } from "mobx-react";
import { useContext, useEffect } from "react";
import { StoreContext } from "../../../../stores";
import Text from "../../../../components/controls/Text";
import Counter from "../../../../components/controls/counter";
import { getCurrentLang } from "../../../../translations/i18n";
import themeStyle from "../../../../styles/theme.style";
import ProductDescription from "../description/description";
import { cdnUrl } from "../../../../consts/shared";
import CustomFastImage from "../../../../components/custom-fast-image";

export type TProps = {
  product: any;
  updateOthers: (value: number, key: string, type: string) => void;
};
const ProductHeader = ({ product, updateOthers }: TProps) => {
  const { t } = useTranslation();
  let { languageStore } = useContext(StoreContext);
  const imageHeight = 280;
  return (
    <View style={{ paddingBottom: 15 }}>
      <Animated.View
        style={{
          maxHeight: imageHeight,
          width: "100%",
        }}
      >
        <CustomFastImage
          style={{
            width: "100%",
            height: "100%",
          }}
          source={{ uri: `${cdnUrl}${product.data?.img?.[0]?.uri}` }}
   
        />
      </Animated.View>
      <View
        style={{
          flexDirection: "column",
          alignItems: "flex-start",
          paddingHorizontal: 10,
          marginTop: 10,
        }}
      >
        <Text
          style={{
            fontSize: themeStyle.FONT_SIZE_2XL,
            fontWeight: "600",
            fontFamily: `${getCurrentLang()}-Bold`,
          }}
        >
          {languageStore.selectedLang === "ar"
            ? product.data.nameAR
            : product.data.nameHE}
        </Text>
        <View style={{ marginTop: 5 }}>
          <Text
            style={{
              fontSize: themeStyle.FONT_SIZE_LG,
              fontFamily: `${getCurrentLang()}-Bold`,
            }}
          >
            ₪ {product.data.price}
          </Text>
        </View>
        <View style={{}}>
          <ProductDescription product={product.data} />
        </View>
      </View>
    </View>
  );
};

export default observer(ProductHeader);
