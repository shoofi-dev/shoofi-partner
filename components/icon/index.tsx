import IcoMoon from "react-icomoon";
import { Svg, Path } from "react-native-svg";
import themeStyle from "../../styles/theme.style";
const iconSet = require("./selection.json");

const Icon = ({ ...props }) => {
  return (
    <IcoMoon
      icon={props.icon}
      native
      iconSet={iconSet}
      SvgComponent={Svg}
      PathComponent={Path}
      {...props}
      color={props.color || themeStyle.GRAY_80}
    />
  );
};

export default Icon;
