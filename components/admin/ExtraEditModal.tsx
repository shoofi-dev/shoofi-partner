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
import { Extra, ExtraType, AreaOption, Option, ExtraGroup } from "./ExtrasManager";

const defaultPizzaOptions = [
  { id: "full", name: "بيتزا كاملة", price: 0 },
  { id: "half1", name: "النصف الأول", price: 0 },
  { id: "half2", name: "النصف الثاني", price: 0 },
];

const defaultOption = (type: ExtraType) => ({
  id: Math.random().toString(36).substr(2, 9),
  nameAR: "",
  nameHE: "",
  price: 0,
  areaOptions: type === "pizza-topping" ? defaultPizzaOptions : undefined,
});

type ExtraEditModalProps = {
  extra?: Extra | null;
  onSave: (extra: Extra) => void;
  onClose: () => void;
  onCreateGlobalExtra?: (extra: Extra) => void;
  groups?: ExtraGroup[];
  isGroupModal?: boolean;
};

const ExtraEditModal: React.FC<ExtraEditModalProps> = ({
  extra,
  onSave,
  onClose,
  onCreateGlobalExtra,
  groups = [],
  isGroupModal = false,
}) => {
  const { t } = useTranslation();
  const [type, setType] = useState<ExtraType>(extra?.type || "single");
  const [nameAR, setNameAR] = useState(extra?.nameAR || "");
  const [nameHE, setNameHE] = useState(extra?.nameHE || "");
  const [order, setOrder] = useState(extra?.order || 0);
  const [options, setOptions] = useState<Option[]>(
    extra?.options || [defaultOption(type)]
  );
  const [maxCount, setMaxCount] = useState<number>(extra?.maxCount || 1);
  const [min, setMin] = useState<number>(extra?.min ?? 0);
  const [max, setMax] = useState<number>(extra?.max ?? 10);
  const [step, setStep] = useState<number>(extra?.step ?? 1);
  const [defaultValue, setDefaultValue] = useState<number>(
    extra?.defaultValue ?? min
  );
  const [price, setPrice] = useState<number>(extra?.price ?? 0);
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(
    extra?.groupId
  );
  const [defaultOptionId, setDefaultOptionId] = useState<string | undefined>(
    extra?.defaultOptionId
  );
  const [defaultOptionIds, setDefaultOptionIds] = useState<string[]>(
    extra?.defaultOptionIds || []
  );

  // Update options when type changes
  React.useEffect(() => {
    if (
      type === "pizza-topping" &&
      (!options.length || !options[0].areaOptions)
    ) {
      setOptions([defaultOption(type)]);
    }
  }, [type]);

  // When options change, ensure defaultOptionId(s) are valid
  React.useEffect(() => {
    if (type === "single" && options.length > 0) {
      if (defaultOptionId && !options.find(opt => opt.id === defaultOptionId)) {
        setDefaultOptionId(undefined);
      }
    }
    if (type === "multi" && options.length > 0) {
      setDefaultOptionIds(ids => ids.filter(id => options.some(opt => opt.id === id)));
    }
  }, [options, type]);

  const handleOptionChange = (
    idx: number,
    field: string,
    value: string | number
  ) => {
    setOptions((opts) =>
      opts.map((opt, i) =>
        i === idx
          ? { ...opt, [field]: field === "price" ? Number(value) : value }
          : opt
      )
    );
  };

  const handleAreaOptionChange = (
    optionIdx: number,
    areaIdx: number,
    field: string,
    value: string | number,
    areaId: string
  ) => {
    setOptions((opts) =>
      opts.map((opt, i) => {
        if (i === optionIdx && opt.areaOptions) {
          const updatedAreaOptions = opt.areaOptions.map((area, j) => {
            if (j === areaIdx) {
              return { ...area, [field]: field === "price" ? Number(value) : value };
            }
            if (areaId === "full" && (area.id === "half1" || area.id === "half2")) {
              return { ...area, [field]: field === "price" ? Number(value) / 2 : value };
            }
            return area;
          });
          return { ...opt, areaOptions: updatedAreaOptions };
        }
        return opt;
      })
    );
  };

  const handleAddOption = () => {
    const newOption = {
      ...defaultOption(type),
      id: Math.random().toString(36).substr(2, 9),
    };
    setOptions((opts) => [...opts, newOption]);
  };

  const handleRemoveOption = (idx: number) =>
    setOptions((opts) => opts.filter((_, i) => i !== idx));

  const handleSave = () => {
    const newExtra = {
      id: extra?.id || Math.random().toString(36).substr(2, 9),
      type,
      nameAR,
      nameHE,
      order,
      options,
      ...(type === "multi" ? { maxCount, defaultOptionIds } : {}),
      ...(type === "single" ? { defaultOptionId } : {}),
      ...(type === "counter" ? { min, max, step, defaultValue, price } : {}),
      ...(type === "weight" ? { min, max, step, defaultValue, price } : {}),
      ...(selectedGroupId ? { groupId: selectedGroupId } : {}),
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
              {extra ? "تعديل الإضافة" : isGroupModal ? "إنشاء مجموعة" : "إضافة إضافة"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon icon="close" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Group Selection */}
            {!isGroupModal && (
              <View style={styles.section}>
                <Text style={styles.label}>المجموعة</Text>
                <View style={styles.selectContainer}>
                  <TouchableOpacity
                    style={[
                      styles.selectOption,
                      !selectedGroupId && styles.selectOptionActive,
                    ]}
                    onPress={() => setSelectedGroupId(undefined)}
                  >
                    <Text style={[
                      styles.selectOptionText,
                      !selectedGroupId && styles.selectOptionTextActive,
                    ]}>
                      بدون مجموعة
                    </Text>
                  </TouchableOpacity>
                  {groups.map((group) => (
                    <TouchableOpacity
                      key={group.id}
                      style={[
                        styles.selectOption,
                        selectedGroupId === group.id && styles.selectOptionActive,
                      ]}
                      onPress={() => setSelectedGroupId(group.id)}
                    >
                      <Text style={[
                        styles.selectOptionText,
                        selectedGroupId === group.id && styles.selectOptionTextActive,
                      ]}>
                        {group.nameAR}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Extra Type Selection */}
            {!isGroupModal && (
              <View style={styles.section}>
                <Text style={styles.label}>نوع الإضافة</Text>
                <View style={styles.typeButtons}>
                  {["single", "multi", "counter", "weight", "pizza-topping"].map((extraType) => (
                    <TouchableOpacity
                      key={extraType}
                      style={[
                        styles.typeButton,
                        type === extraType && styles.typeButtonActive,
                      ]}
                      onPress={() => setType(extraType as ExtraType)}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          type === extraType && styles.typeButtonTextActive,
                        ]}
                      >
                        {extraType === "pizza-topping"
                          ? "إضافة بيتزا"
                          : extraType === "single"
                          ? "اختيار واحد"
                          : extraType === "multi"
                          ? "اختيار متعدد"
                          : extraType === "weight"
                          ? "وزن"
                          : "عداد"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Max Count for Multi Type */}
            {!isGroupModal && type === "multi" && (
              <View style={styles.section}>
                <Text style={styles.label}>الحد الأقصى للاختيارات</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={maxCount.toString()}
                  onChangeText={(value) => setMaxCount(Number(value) || 1)}
                  textAlign="right"
                />
              </View>
            )}

            {/* Extra Name */}
            <View style={styles.section}>
              <Text style={styles.label}>اسم الإضافة (عربي)</Text>
              <TextInput
                style={styles.input}
                value={nameAR}
                onChangeText={setNameAR}
                placeholder="أدخل اسم الإضافة"
                textAlign="right"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>اسم الإضافة (عبراني)</Text>
              <TextInput
                style={styles.input}
                value={nameHE}
                onChangeText={setNameHE}
                placeholder="أدخل اسم الإضافة"
                textAlign="right"
              />
            </View>

            {/* Counter/Weight specific fields */}
            {!isGroupModal && (type === "counter" || type === "weight") && (
              <>
                <View style={styles.section}>
                  <Text style={styles.label}>
                    {type === "weight" ? "الحد الأدنى للوزن" : "القيمة الدنيا"}
                  </Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={min.toString()}
                    onChangeText={(value) => setMin(Number(value) || 0)}
                    textAlign="right"
                  />
                </View>
                <View style={styles.section}>
                  <Text style={styles.label}>
                    {type === "weight" ? "الحد الأقصى للوزن" : "القيمة القصوى"}
                  </Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={max.toString()}
                    onChangeText={(value) => setMax(Number(value) || 10)}
                    textAlign="right"
                  />
                </View>
                <View style={styles.section}>
                  <Text style={styles.label}>الخطوة</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={step.toString()}
                    onChangeText={(value) => setStep(Number(value) || 1)}
                    textAlign="right"
                  />
                </View>
                <View style={styles.section}>
                  <Text style={styles.label}>
                    {type === "weight" ? "الوزن الافتراضي" : "القيمة الافتراضية"}
                  </Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={defaultValue.toString()}
                    onChangeText={(value) => setDefaultValue(Number(value) || min)}
                    textAlign="right"
                  />
                </View>
                {type === "weight" && (
                  <View style={styles.section}>
                    <Text style={styles.label}>السعر</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={price.toString()}
                      onChangeText={(value) => setPrice(Number(value) || 0)}
                      textAlign="right"
                    />
                  </View>
                )}
              </>
            )}

            {/* Order */}
            <View style={styles.section}>
              <Text style={styles.label}>الترتيب</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={order.toString()}
                onChangeText={(value) => setOrder(Number(value) || 0)}
                textAlign="right"
              />
            </View>

            {/* Options - only show if not counter/weight type */}
            {!isGroupModal && type !== "counter" && type !== "weight" && (
              <View style={styles.section}>
                <Text style={styles.label}>الخيارات</Text>
                {options.map((opt, idx) => (
                  <View key={idx} style={styles.optionCard}>
                    <View style={styles.optionHeader}>
                      {/* Default selector */}
                      {type === "single" && (
                        <TouchableOpacity
                          style={[
                            styles.defaultSelector,
                            defaultOptionId === opt.id && styles.defaultSelectorActive,
                          ]}
                          onPress={() =>
                            setDefaultOptionId(defaultOptionId === opt.id ? undefined : opt.id)
                          }
                        >
                          <Icon 
                            icon={defaultOptionId === opt.id ? "check" : "circle"} 
                            size={16} 
                            style={{ color: defaultOptionId === opt.id ? "white" : themeStyle.GRAY_600 }}
                          />
                        </TouchableOpacity>
                      )}
                      {type === "multi" && (
                        <TouchableOpacity
                          style={[
                            styles.defaultSelector,
                            defaultOptionIds.includes(opt.id) && styles.defaultSelectorActive,
                          ]}
                          onPress={() => {
                            if (defaultOptionIds.includes(opt.id)) {
                              setDefaultOptionIds(ids => ids.filter(id => id !== opt.id));
                            } else {
                              setDefaultOptionIds(ids => [...ids, opt.id]);
                            }
                          }}
                        >
                          <Icon 
                            icon={defaultOptionIds.includes(opt.id) ? "check" : "square"} 
                            size={16} 
                            style={{ color: defaultOptionIds.includes(opt.id) ? "white" : themeStyle.GRAY_600 }}
                          />
                        </TouchableOpacity>
                      )}
                      
                      <TextInput
                        style={[styles.input, styles.optionNameInput]}
                        placeholder="الاسم (عربي)"
                        value={opt.nameAR}
                        onChangeText={(value) =>
                          handleOptionChange(idx, "nameAR", value)
                        }
                        textAlign="right"
                      />
                      <TextInput
                        style={[styles.input, styles.optionNameInput]}
                        placeholder="الاسم (عبراني)"
                        value={opt.nameHE}
                        onChangeText={(value) =>
                          handleOptionChange(idx, "nameHE", value)
                        }
                        textAlign="right"
                      />
                      {type !== "pizza-topping" && (
                        <TextInput
                          style={[styles.input, styles.optionPriceInput]}
                          placeholder="السعر"
                          keyboardType="numeric"
                          value={opt.price?.toString()}
                          onChangeText={(value) =>
                            handleOptionChange(idx, "price", value)
                          }
                          textAlign="right"
                        />
                      )}
                      {type !== "pizza-topping" && (
                        <TouchableOpacity
                          onPress={() => handleRemoveOption(idx)}
                          style={styles.removeOptionButton}
                        >
                          <Icon icon="delete" size={20} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Area Options for Pizza Toppings */}
                    {type === "pizza-topping" && opt.areaOptions && (
                      <View style={styles.areaOptionsContainer}>
                        <Text style={styles.areaOptionsTitle}>
                          الأسعار حسب المناطق
                        </Text>
                        {opt.areaOptions.map((area, areaIdx) => (
                          <View key={areaIdx} style={styles.areaOptionRow}>
                            <Text style={styles.areaOptionName}>
                              {area.name}
                            </Text>
                            <TextInput
                              style={[styles.input, styles.areaOptionPriceInput]}
                              placeholder="السعر"
                              keyboardType="numeric"
                              value={area.price.toString()}
                              onChangeText={(value) =>
                                handleAreaOptionChange(
                                  idx,
                                  areaIdx,
                                  "price",
                                  value,
                                  area.id
                                )
                              }
                              textAlign="right"
                            />
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
                {type !== "pizza-topping" && (
                  <TouchableOpacity
                    style={styles.addOptionButton}
                    onPress={handleAddOption}
                  >
                    <Icon icon="add" size={20} />
                    <Text style={styles.addOptionButtonText}>
                      إضافة خيار
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>حفظ</Text>
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
    fontSize: themeStyle.FONT_SIZE_XL,
    fontWeight: "bold",
    color: themeStyle.TEXT_PRIMARY_COLOR,
    textAlign: "right",
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
    fontSize: themeStyle.FONT_SIZE_LG,
    fontWeight: "bold",
    marginBottom: 8,
    color: themeStyle.TEXT_PRIMARY_COLOR,
    textAlign: "left",
  },
  input: {
    backgroundColor: themeStyle.GRAY_100,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: themeStyle.GRAY_300,
    textAlign: "right",
  },
  selectContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: themeStyle.GRAY_200,
  },
  selectOptionActive: {
    backgroundColor: themeStyle.PRIMARY_COLOR,
  },
  selectOptionText: {
    color: themeStyle.TEXT_PRIMARY_COLOR,
    fontSize: themeStyle.FONT_SIZE_MD,
  },
  selectOptionTextActive: {
    color: "white",
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
    fontSize: themeStyle.FONT_SIZE_MD,
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
  defaultSelector: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: themeStyle.GRAY_200,
    justifyContent: "center",
    alignItems: "center",
  },
  defaultSelectorActive: {
    backgroundColor: themeStyle.PRIMARY_COLOR,
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
    fontSize: themeStyle.FONT_SIZE_MD,
    fontWeight: "500",
    marginBottom: 8,
    color: themeStyle.TEXT_PRIMARY_COLOR,
    textAlign: "right",
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
    textAlign: "right",
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