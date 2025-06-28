import { StyleSheet, View, Image, Dimensions } from "react-native";
import { useContext, useEffect } from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import Text from "../../../components/controls/Text";
import StoresCategoryItem from "./item";
import Carousel from "react-native-reanimated-carousel";

export type TProps = {
  storesList: any;
}

const StoresCategoryList = ({storesList}: TProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
  
          <Carousel
          // loop
          // width={Dimensions.get("window").width}
          // height={Dimensions.get("window").height}
          // autoPlay={false}
           data={storesList}
          // scrollAnimationDuration={3000}
          // autoPlayInterval={3000}
          // customAnimation={animationStyle}
          scrollAnimationDuration={500}

          loop
          style={{
            alignItems:'center',
            borderWidth:1,
            width:Dimensions.get("window").width,
            justifyContent:'center'
          }}
          width={Dimensions.get("window").width}
          mode="parallax"
          vertical={false}
          modeConfig={{
            parallaxScrollingScale: 1,
            parallaxScrollingOffset: Dimensions.get("window").width*0.8,
          }}
          // mode="parallax"
          renderItem={({ index }) => (
            <View style={{width:50, height:50}}>
                        <StoresCategoryItem storeItem={storesList[index]}/>

              {/* <ImageBackground
                 source={{ uri: `${homeSlides[index]}` }}
                // source={require("../../assets/home/mock-slider/bg6.png")}
                style={styles.image}
              />
              <Text>{index}</Text> */}
            </View>
          )}
        />
    </View>
  );
};
export default observer(StoresCategoryList);

const styles = StyleSheet.create({
  container: {},
  subContainer: {
    width: "100%",
    height: "100%",
    alignItems: "center",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
