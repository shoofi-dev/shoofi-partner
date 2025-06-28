import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import themeStyle from "../../styles/theme.style";
import Icon from "../icon";

const defaultOption = () => ({ id: "", name: "", price: 0 });
const defaultAreaOption = () => ({ id: "", name: "", price: 0 });

type ExtraType = "single" | "multi" | "counter" | "pizza-topping";
type AreaOption = { id: string; name: string; price: number };
type Option = { 
  id: string; 
  name: string; 
  price?: number;
  areaOptions?: AreaOption[];
};
type Extra = {
  id: string;
  type: ExtraType;
  title: string;
  options?: Option[];
  maxCount?: number;
  [key: string]: any;
};

type ExtraEditModalProps = {
  extra?: Extra | null;
  onSave: (extra: Extra) => void;
  onClose: () => void;
  onCreateGlobalExtra?: (extra: Extra) => void;
};

const ExtraEditModal: React.FC<ExtraEditModalProps> = ({
  extra,
  onSave,
  onClose,
  onCreateGlobalExtra,
}) => {
  const { t } = useTranslation();
  const [type, setType] = useState<ExtraType>(extra?.type || "single");
  const [title, setTitle] = useState(extra?.title || "");
  const [options, setOptions] = useState<Option[]>(extra?.options || [defaultOption()]);
  const [maxCount, setMaxCount] = useState<number>(extra?.maxCount || 1);

  const handleOptionChange = (idx: number, field: string, value: string | number) => {
    setOptions((opts) =>
      opts.map((opt, i) => (i === idx ? { ...opt, [field]: field === "price" ? Number(value) : value } : opt))
    );
  };

  const handleAreaOptionChange = (optionIdx: number, areaIdx: number, field: string, value: string | number) => {
    setOptions((opts) =>
      opts.map((opt, i) => {
        if (i === optionIdx && opt.areaOptions) {
          const updatedAreaOptions = opt.areaOptions.map((area, j) => 
            j === areaIdx ? { ...area, [field]: field === "price" ? Number(value) : value } : area
          );
          return { ...opt, areaOptions: updatedAreaOptions };
        }
        return opt;
      })
    );
  };

  const handleAddOption = () => {
    const newOption = { 
      ...defaultOption(), 
      id: Math.random().toString(36).substr(2, 9),
      areaOptions: type === "pizza-topping" ? [
        { id: "full", name: "Full Pizza", price: 0 },
        { id: "half1", name: "First Half", price: 0 },
        { id: "half2", name: "Second Half", price: 0 },
        { id: "quarter1", name: "First Quarter", price: 0 },
        { id: "quarter2", name: "Second Quarter", price: 0 },
        { id: "quarter3", name: "Third Quarter", price: 0 },
        { id: "quarter4", name: "Fourth Quarter", price: 0 }
      ] : undefined
    };
    console.log("newOption", newOption);
    setOptions((opts) => [...opts, newOption]);
  };

  const handleRemoveOption = (idx: number) =>
    setOptions((opts) => opts.filter((_, i) => i !== idx));

  const handleSave = () => {
    const newExtra = {
      id: extra?.id || Math.random().toString(36).substr(2, 9),
      type,
      title,
      options,
      ...(type === "multi" ? { maxCount } : {}),
    };
    onSave(newExtra);
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {extra ? t("edit-extra") : t("add-extra")}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon icon="close" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Extra Type Selection */}
            <View style={styles.section}>
              <Text style={styles.label}>{t("extra-type")}</Text>
              <View style={styles.typeButtons}>
                {["single", "multi", "counter", "pizza-topping"].map((topping) => (
                  <TouchableOpacity
                    key={topping}
                    style={[
                      styles.typeButton,
                      type === topping && styles.typeButtonActive,
                    ]}
                    onPress={() => setType(topping as ExtraType)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        type === topping && styles.typeButtonTextActive,
                      ]}
                    >
                      {topping === "pizza-topping"
                        ? t("pizza-topping")
                        : topping === "single"
                        ? t("single-choice")
                        : topping === "multi"
                        ? t("multi-choice")
                        : t("counter")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Max Count for Multi Type */}
            {type === "multi" && (
              <View style={styles.section}>
                <Text style={styles.label}>{t("max-selections")}</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={maxCount.toString()}
                  onChangeText={(value) => setMaxCount(Number(value) || 1)}
                />
              </View>
            )}

            {/* Extra Title */}
            <View style={styles.section}>
              <Text style={styles.label}>{t("extra-title")}</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder={t("enter-extra-title")}
              />
            </View>

            {/* Options */}
            <View style={styles.section}>
              <Text style={styles.label}>{t("options")}</Text>
              {options.map((opt, idx) => (
                <View key={idx} style={styles.optionCard}>
                  <View style={styles.optionHeader}>
                    <TextInput
                      style={[styles.input, styles.optionNameInput]}
                      placeholder={t("option-name")}
                      value={opt.name}
                      onChangeText={(value) => handleOptionChange(idx, "name", value)}
                    />
                    {type !== "pizza-topping" && (
                      <TextInput
                        style={[styles.input, styles.optionPriceInput]}
                        placeholder={t("price")}
                        keyboardType="numeric"
                        value={opt.price?.toString()}
                        onChangeText={(value) => handleOptionChange(idx, "price", value)}
                      />
                    )}
                    <TouchableOpacity
                      onPress={() => handleRemoveOption(idx)}
                      style={styles.removeOptionButton}
                    >
                      <Icon icon="delete" size={20} />
                    </TouchableOpacity>
                  </View>

                  {/* Area Options for Pizza Toppings */}
                  {type === "pizza-topping" && opt.areaOptions && (
                    <View style={styles.areaOptionsContainer}>
                      <Text style={styles.areaOptionsTitle}>
                        {t("area-prices")}
                      </Text>
                      {opt.areaOptions.map((area, areaIdx) => (
                        <View key={areaIdx} style={styles.areaOptionRow}>
                          <Text style={styles.areaOptionName}>
                            {area.name}
                          </Text>
                          <TextInput
                            style={[styles.input, styles.areaOptionPriceInput]}
                            placeholder={t("price")}
                            keyboardType="numeric"
                            value={area.price.toString()}
                            onChangeText={(value) =>
                              handleAreaOptionChange(idx, areaIdx, "price", value)
                            }
                          />
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
              <TouchableOpacity
                style={styles.addOptionButton}
                onPress={handleAddOption}
              >
                <Icon icon="add" size={20} />
                <Text style={styles.addOptionButtonText}>
                  {t("add-option")}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>{t("save")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: themeStyle.GRAY_200,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: themeStyle.GRAY_200,
    gap: 8,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  input: {
    backgroundColor: themeStyle.GRAY_100,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: themeStyle.GRAY_300,
  },
  typeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: themeStyle.GRAY_200,
  },
  typeButtonActive: {
    backgroundColor: themeStyle.PRIMARY_COLOR,
  },
  typeButtonText: {
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  typeButtonTextActive: {
    color: "white",
  },
  optionCard: {
    backgroundColor: themeStyle.GRAY_100,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionNameInput: {
    flex: 1,
  },
  optionPriceInput: {
    width: 80,
  },
  removeOptionButton: {
    padding: 4,
  },
  areaOptionsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: themeStyle.GRAY_300,
  },
  areaOptionsTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  areaOptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  areaOptionName: {
    flex: 1,
    marginRight: 8,
  },
  areaOptionPriceInput: {
    width: 80,
  },
  addOptionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeStyle.GRAY_200,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  addOptionButtonText: {
    marginLeft: 4,
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: themeStyle.GRAY_200,
  },
  cancelButtonText: {
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: themeStyle.PRIMARY_COLOR,
  },
  saveButtonText: {
    color: "white",
  },
});

export default ExtraEditModal; 