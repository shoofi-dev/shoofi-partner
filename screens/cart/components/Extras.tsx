import React, { useContext } from "react";
import { View } from "react-native";
import Text from "../../../components/controls/Text";
import { extrasStore } from "../../../stores/extras";
import { isEmpty } from "lodash";
import { StoreContext } from "../../../stores";

const CartExtras = ({
  extrasDef,
  selectedExtras,
  fontSize,
  basePrice,
  qty,
}) => {
  const { languageStore } = useContext(StoreContext);
  if (!extrasDef || !selectedExtras || isEmpty(extrasDef)) return null;
  const extrasPrice = extrasStore.calculateExtrasPrice(
    extrasDef,
    selectedExtras
  );
  const totalPrice = (basePrice + extrasPrice) * (qty || 1);

  const getName = (item) => {
    return languageStore.selectedLang === "ar" ? item.nameAR : item.nameHE;
  };
  return (
    <View style={{ marginTop: 5,}}>
      {extrasDef.map((extra) => {
        const value = selectedExtras[extra.id];
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        )
          return null;
        // Single choice
        if (extra.type === "single") {
          const opt = extra.options.find((o) => o.id === value);
          return (
            <View
              key={extra.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <Text style={{ fontSize: fontSize(14), color: "black" }}>
                {getName(extra)}
              </Text>
              <Text style={{ fontSize: fontSize(14), color: "black" }}>
                {getName(opt)}
                {opt?.price ? ` (+₪${opt.price})` : ""}
              </Text>
            </View>
          );
        }
        // Multi select
        if (extra.type === "multi") {
          const opts = extra.options.filter((o) => value.includes(o.id));
          return (
            <View
              key={extra.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <Text style={{ fontSize: fontSize(14), color: "#888" }}>
                {getName(extra)}
              </Text>
              <Text style={{ fontSize: fontSize(14), color: "#333" }}>
                {opts.map((o) => (
                  <View>
                    <Text>
                    {getName(o)}{o.price ? ` (+₪${o.price})` : ""}
                    </Text>
                  </View>
                ))}
              </Text>
            </View>
          );
        }
        // Counter
        if (extra.type === "counter") {
          console.log("extra", extra);
          return (
            <View
              key={extra.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <Text style={{ fontSize: fontSize(14), color: "#888" }}>
                {getName(extra)}
              </Text>
              <Text style={{ fontSize: fontSize(14), color: "#333" }}>
                {value}x{extra.price ? ` (+₪${extra.price})` : ""}
              </Text>
            </View>
          );
        }
        // Weight
        if (extra.type === "weight") {
          return (
            <View
              key={extra.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              <Text style={{ fontSize: fontSize(14), color: "#333" }}>
                {getName(extra)}
              </Text>
              <Text style={{ fontSize: fontSize(14), color: "#333" }}>
                {value}x{extra.price ? ` (+₪${extra.price})` : ""}
              </Text>
            </View>
          );
        }
        // Pizza Topping (area selection)
        if (extra.type === "pizza-topping") {
          const toppingSelections = Object.entries(value || {});
          if (toppingSelections.length === 0) return null;
          return (
            <View key={extra.id} style={{ marginBottom: 2 }}>
              {/* <Text style={{ fontSize: fontSize(14), color: "#888" }}>
                {getName(extra)}
              </Text> */}
              {toppingSelections.map(([toppingId, areaData]) => {
                const topping = extra.options.find((o) => o.id === toppingId);
                if (!topping) return null;
                const area = topping.areaOptions?.find((a) => a.id === areaData.areaId);
                console.log("area", area);
                return (
                  <View
                    key={toppingId}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: fontSize(14), color: "#333" }}>
                      {getName(topping)}
                      {area
                        ? ` (${area.name}${
                            area.price && areaData.isFree ? ` +₪${area.price}` : ""
                          })`
                        : ""}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        }
        return null;
      })}
      {/* Show extras price if any */}
      {/* {extrasPrice > 0 && (
        <Text
          style={{ fontSize: fontSize(14), color: "#007aff", marginTop: 2 }}
        >
          {`Extras: +₪${extrasPrice}`}
        </Text>
      )} */}
      {/* Show total price if basePrice is provided */}
      {/* {basePrice !== undefined && (
        <Text
          style={{
            fontSize: fontSize(14),
            color: "white",
            fontWeight: "bold",
            marginTop: 2,
          }}
        >
          {`Total: ₪${totalPrice}`}
        </Text>
      )} */}
    </View>
  );
};

export default CartExtras;
