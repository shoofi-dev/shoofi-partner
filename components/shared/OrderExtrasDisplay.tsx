import React from "react";
import { View } from "react-native";
import Text from "../controls/Text";

const OrderExtrasDisplay = ({ extrasDef, selectedExtras, fontSize }) => {
  console.log("extrasDef", extrasDef);
  console.log("selectedExtras", selectedExtras);
  if (!extrasDef || !selectedExtras || extrasDef.length === 0) return null;
  return (
    <View style={{ marginTop: 5 }}>
      {extrasDef.map((extra) => {
        const value = selectedExtras?.[extra.id];
        if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) return null;
        // Single choice
        if (extra.type === "single") {
          const opt = extra.options.find(o => o.id === value);
          return (
            <View key={extra.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
              <Text style={{ fontSize: fontSize(14), color: "#888" }}>{extra.title}: </Text>
              <Text style={{ fontSize: fontSize(14), color: "#333" }}>{opt?.name}{opt?.price ? ` (+₪${opt.price})` : ""}</Text>
            </View>
          );
        }
        // Multi select
        if (extra.type === "multi") {
          const opts = extra.options.filter(o => value.includes(o.id));
          return (
            <View key={extra.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
              <Text style={{ fontSize: fontSize(14), color: "#888" }}>{extra.title}: </Text>
              <Text style={{ fontSize: fontSize(14), color: "#333" }}>{opts.map(o => `${o.name}${o.price ? ` (+₪${o.price})` : ""}`).join(", ")}</Text>
            </View>
          );
        }
        // Counter
        if (extra.type === "counter") {
          return (
            <View key={extra.id} style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
              <Text style={{ fontSize: fontSize(14), color: "#888" }}>{extra.title}: </Text>
              <Text style={{ fontSize: fontSize(14), color: "#333" }}>{value}x{extra.price ? ` (+₪${extra.price})` : ""}</Text>
            </View>
          );
        }
        // Pizza Topping (area selection)
        if (extra.type === "pizza-topping") {
          const toppingSelections = Object.entries(value || {});
          if (toppingSelections.length === 0) return null;
          return (
            <View key={extra.id} style={{ marginBottom: 2 }}>
              <Text style={{ fontSize: fontSize(14), color: "#888" }}>{extra.title}:</Text>
              {toppingSelections.map(([toppingId, areaData]) => {
                const topping = extra.options.find(o => o.id === toppingId);
                if (!topping) return null;
                const area = topping.areaOptions?.find(a => a.id === areaData.areaId);
                return (
                  <View key={toppingId} style={{ flexDirection: "row", alignItems: "center", marginLeft: 10 }}>
                    <Text style={{ fontSize: fontSize(14), color: "#333" }}>
                      {topping.name}
                      {area ? ` (${area.name}${area.price && !areaData.isFree ? ` +₪${area.price}` : ""})` : ""}
                    </Text>
                  </View>
                );
              })}
            </View>
          );
        }
        return null;
      })}
    </View>
  );
};

export default OrderExtrasDisplay; 