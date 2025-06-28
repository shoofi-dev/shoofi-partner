import LottieView from "lottie-react-native";
const scrollHandAnimation = require("../../assets/lottie/scroll-hand.json");

export const ScrollHandLottie= () => (
    <LottieView
    source={scrollHandAnimation}
    autoPlay
    style={{
      width: 150,
      height: 300,
    }}
    loop={true}
  />
)