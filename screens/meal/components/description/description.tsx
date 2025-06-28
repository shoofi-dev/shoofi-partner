import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { observer } from "mobx-react";
import { useContext } from "react";
import { StoreContext } from "../../../../stores";
import Text from "../../../../components/controls/Text";
import themeStyle from "../../../../styles/theme.style";

export type TProps = {
  product: any;
};
const ProductDescription = ({ product }: TProps) => {
  const { t } = useTranslation();
  let { languageStore } = useContext(StoreContext);

  return (
    <View
      style={{
        alignItems: "flex-start",
      }}
    >
      {(product.descriptionAR ||
        product.descriptionHE) && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ fontSize: themeStyle.FONT_SIZE_SM, textAlign: "right", color: themeStyle.GRAY_60 }}>
              {languageStore.selectedLang === "ar"
                ? product.descriptionAR
                : product.descriptionHE}
            </Text>
          </View>
        )}
    </View>
  );
};

export default observer(ProductDescription);
