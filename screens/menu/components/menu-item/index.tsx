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
import { APP_NAME, cdnUrl } from "../../../../consts/shared";
import { LinearGradient } from "expo-linear-gradient";
import CustomFastImage from "../../../../components/custom-fast-image";

export type TProps = {
  item: any;
  onItemSelect: (item: any) => void;
  selectedItem: any;
  isDisabledCatItem?: any;
};

const MenuItem = ({
  item,
  onItemSelect,
  selectedItem,
  isDisabledCatItem,
}: TProps) => {
  const { t } = useTranslation();
  const { languageStore } = useContext(StoreContext);
  return (
    <View style={styles.categoryItem}>
      <TouchableOpacity
        style={{
          shadowColor:
            selectedItem._id === item._id
              ? themeStyle.SECONDARY_COLOR
              : "rgba(0, 0, 0,0)",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          borderWidth: selectedItem._id === item._id ? 2 : 0,
          zIndex: 1,  
          shadowOpacity: selectedItem._id === item._id ? 0.5 : 0,
          shadowRadius: 6.84,
          elevation: 9,
          borderRadius:10,

          // shadowColor: themeStyle.SECONDARY_COLOR,
          // shadowOffset: {
          //   width: 0,
          //   height: 2,
          // },
          // shadowOpacity: 1,
          // shadowRadius: 6,
          // elevation: 0,
          // borderWidth:0,
  
          // marginTop: selectedItem._id === item._id ? 35 : 0,
          backgroundColor: 'rgba(0, 0, 0,0.5)',
            borderColor: themeStyle.PRIMARY_COLOR,
            
            alignItems:'center',
            justifyContent:'center',
            padding:5,
            overflow: 'visible'

        }}
        onPress={() => {
          onItemSelect(item);
        }}
        disabled={isDisabledCatItem}
      >
             {/* {selectedItem._id === item._id && <LinearGradient
            colors={ ["#eaaa5c", "#a77948"]}
            start={{ x: 1, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.background]}
          />} */}
        <View
          style={[
            styles.iconContainer,

            {
        shadowColor: 'black',
           shadowOffset: {
             width: 0,
             height: 2,
           },
           shadowOpacity: 0.9,
           shadowRadius: 6,
           elevation: 0,
           borderWidth: 0,
            },
          ]}
        >

<CustomFastImage
          style={{
            width: "100%",
            height: "100%",
          }}
          source={{ uri: `${cdnUrl}${item?.img[0]?.uri}` }}
          cacheKey={`${APP_NAME}_${item?.img[0]?.uri?.split(/[\\/]/).pop()}`}
        />

            {/* <Image
              style={{
                width: selectedItem._id === item._id ? "140%" : "90%",
                height: selectedItem._id === item._id ? "100%" : "90%",
                position:'absolute',
                right:10,
                top:-10

              }}
              source={
                menuIcons[
                  item[
                    `icon-${
                      selectedItem._id === item._id ? "active" : "inactive"
                    }`
                  ]
                ]
              }
            /> */}
    
        </View>
      </TouchableOpacity>
        <View style={{ marginTop: 10, width: "140%", alignItems: "center", 
    
 }}>
          <Text
            style={{
                marginTop: 0,
                color: themeStyle.SECONDARY_COLOR,
                fontSize:18,

                
              }}
          >
            {languageStore.selectedLang === "ar" ? item.nameAR : item.nameHE}
          </Text>
        </View>
    </View>
  );
};

export default observer(MenuItem);

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "#F1F1F1",
  },
  categoryItem: {
    alignItems: "center",
    // justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
    // width: 120
    paddingTop: 5,

    backgroundColor:'transparent'
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    height: 80,
    width: 80,
    overflow: 'visible'
    // padding: 15,
  },
  itemsListConainer: {},
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
