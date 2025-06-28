import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from "react-native";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import themeStyle from "../../styles/theme.style";
import Icon from "../icon";
import ExtraEditModal from "./ExtraEditModal";

export type ExtraType = "single" | "multi" | "counter" | "pizza-topping";
export type AreaOption = { id: string; name: string; price: number };
export type Option = { 
  id: string; 
  name: string; 
  price?: number;
  areaOptions?: AreaOption[];
};
export type Extra = {
  id: string;
  type: ExtraType;
  title: string;
  options?: Option[];
  maxCount?: number;
  [key: string]: any;
};

type ExtrasManagerProps = {
  assignedExtras: Extra[];
  onSave: (extras: Extra[]) => void;
  onCreateGlobalExtra?: (extra: Extra) => Promise<Extra>;
  globalExtras: Extra[];
};

const ExtrasManager: React.FC<ExtrasManagerProps> = ({
  assignedExtras,
  onSave,
  onCreateGlobalExtra,
  globalExtras,
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExtra, setEditingExtra] = useState<Extra | null>(null);

  // Add or update an extra for this product
  const handleSaveExtra = (extra: Extra) => {
    const exists = assignedExtras.find((e) => e.id === extra.id);
    let updated;
    if (exists) {
      updated = assignedExtras.map((e) => (e.id === extra.id ? extra : e));
    } else {
      updated = [...assignedExtras, extra];
    }
    onSave(updated);
    setEditingExtra(null);
    setShowAddModal(false);
  };

  // Remove an extra from this product
  const handleRemoveExtra = (id: string) => {
    const updated = assignedExtras.filter((e) => e.id !== id);
    onSave(updated);
  };

  // Assign a global extra to this product
  const handleAssignGlobal = (extra: Extra) => {
    if (!assignedExtras.find((e) => e.id === extra.id)) {
      handleSaveExtra({ ...extra });
    }
  };

  const renderOption = (opt: Option) => {
    if (opt.areaOptions) {
      return (
        <View style={styles.areaOptionContainer}>
          <Text style={styles.optionName}>{opt.name}</Text>
          <View style={styles.areaOptionsGrid}>
            {opt.areaOptions.map((area) => (
              <View key={area.id} style={styles.areaOptionRow}>
                <Text>{area.name}</Text>
                <Text>₪{area.price}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    }
    return (
      <View style={styles.optionRow}>
        <Text>{opt.name}</Text>
        {opt.price ? <Text>- ₪{opt.price}</Text> : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("product-extras")}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Icon icon="add" size={20} />
          <Text style={styles.addButtonText}>{t("add-new-extra")}</Text>
        </TouchableOpacity>
      </View>

      {/* Search and assign from global extras */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t("search-existing-extras")}
          value={search}
          onChangeText={setSearch}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.globalExtrasContainer}>
          {globalExtras?.filter(
            (e) =>
              e.title.includes(search) &&
              !assignedExtras.find((ae) => ae.id === e.id)
          ).map((e) => (
            <TouchableOpacity
              key={e.id}
              style={styles.globalExtraButton}
              onPress={() => handleAssignGlobal(e)}
            >
              <Text>{e.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List assigned extras */}
      <ScrollView style={styles.extrasList}>
        {assignedExtras.map((extra) => (
          <View key={extra.id} style={styles.extraCard}>
            <View style={styles.extraHeader}>
              <View>
                <Text style={styles.extraTitle}>{extra.title}</Text>
                <Text style={styles.extraType}>
                  {extra.type === "pizza-topping" ? t("pizza-topping") :
                   extra.type === "single" ? t("single-choice") :
                   extra.type === "multi" ? t("multi-choice") : t("counter")}
                </Text>
              </View>
              <View style={styles.extraActions}>
                <TouchableOpacity
                  onPress={() => setEditingExtra(extra)}
                  style={styles.editButton}
                >
                  <Icon icon="edit" size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRemoveExtra(extra.id)}
                  style={styles.removeButton}
                >
                  <Icon icon="delete" size={20} />
                </TouchableOpacity>
              </View>
            </View>
            {extra.options && (
              <View style={styles.optionsList}>
                {extra.options.map((opt) => (
                  <View key={opt.id} style={styles.optionItem}>
                    {renderOption(opt)}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Modal for add/edit extra */}
      {(showAddModal || editingExtra) && (
        <ExtraEditModal
          extra={editingExtra}
          onSave={handleSaveExtra}
          onClose={() => {
            setEditingExtra(null);
            setShowAddModal(false);
          }}
          onCreateGlobalExtra={onCreateGlobalExtra}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: themeStyle.GRAY_100,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeStyle.PRIMARY_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    marginLeft: 4,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  globalExtrasContainer: {
    flexDirection: "row",
  },
  globalExtraButton: {
    backgroundColor: themeStyle.GRAY_200,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  extrasList: {
    maxHeight: 400,
  },
  extraCard: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  extraHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  extraTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: themeStyle.TEXT_PRIMARY_COLOR,
  },
  extraType: {
    fontSize: 12,
    color: themeStyle.GRAY_600,
    marginTop: 2,
  },
  extraActions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  removeButton: {
    padding: 4,
  },
  optionsList: {
    marginTop: 8,
  },
  optionItem: {
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  areaOptionContainer: {
    paddingRight: 16,
  },
  optionName: {
    fontWeight: "500",
    marginBottom: 4,
  },
  areaOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  areaOptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "48%",
  },
});

export default observer(ExtrasManager); 