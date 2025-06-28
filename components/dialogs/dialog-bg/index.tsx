

// import { LinearGradient } from "expo-linear-gradient";
import { ImageBackground, View } from "react-native";
import themeStyle from "../../../styles/theme.style";


export default function DialogBG({children}) {
 
  return (
  //   <ImageBackground
  //   source={require("../../../assets/bg/bg.jpg")}
  //   resizeMode="cover"
  //   style={{         alignItems: "center",
  //   justifyContent: "center",
  //   paddingVertical: 30,
  //    }}
  // >
  <View style={{backgroundColor:themeStyle.WHITE,  alignItems: "center",justifyContent: "center",paddingVertical: 30,}}>
    {children}
    </View>
    // </ImageBackground>

        //   <LinearGradient
        //     colors={[
        //       "rgba(207, 207, 207, 1)",
        //       "rgba(232, 232, 230, 1)",
        //       "rgba(232, 232, 230, 1)",
        //       "rgba(232, 232, 230, 1)",
        //       "rgba(207, 207, 207, 1)",
        //     ]}
        //     start={{ x: 1, y: 0 }}
        //     end={{ x: 1, y: 1 }}
        //     style={{
        //       position: "absolute",
        //       left: 0,
        //       right: 0,
        //       top: 0,
        //       bottom: 0,
        //       borderRadius: 10,
        //     }}
        //   />
  );
}
