import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from "react-native";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import themeStyle from "../../styles/theme.style";
import Icon from "../icon";
import ExtraEditModal from "./ExtraEditModal";
import { useResponsive } from "../../hooks/useResponsive";
export type ExtraType = "single" | "multi" | "counter" | "pizza-topping" | "weight";
export type AreaOption = { id: string; name: string; price: number };
export type Option = { 
  id: string; 
  nameAR: string;
  nameHE: string;
  price?: number;
  areaOptions?: AreaOption[];
};
export type Extra = {
  id: string;
  type: ExtraType;
  nameAR: string;
  nameHE: string;
  order?: number;
  options?: Option[];
  maxCount?: number;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  price?: number;
  groupId?: string;
  isGroupHeader?: boolean;
  freeCount?: number;
  defaultOptionId?: string;
  defaultOptionIds?: string[];
  [key: string]: any;
};

export type ExtraGroup = {
  id: string;
  nameAR: string;
  nameHE: string;
  order: number;
  freeCount?: number;
};

type ExtrasManagerProps = {
  assignedExtras: Extra[];
  onSave: (extras: Extra[]) => void;
  onCreateGlobalExtra?: (extra: Extra) => Promise<Extra>;
  globalExtras: Extra[];
};

const getExtraType = (type: ExtraType) => {
  return type === "pizza-topping"
    ? "إضافة بيتزا"
    : type === "single"
    ? "اختيار واحد"
    : type === "multi"
    ? "اختيار متعدد"
    : type === "weight"
    ? "وزن"
    : "عداد";
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
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ExtraGroup | null>(null);
  const { isTablet } = useResponsive();   
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

  const handleSaveGroup = (group: ExtraGroup) => {
    // If this is a new group, create a new extra with the group info
    if (!editingGroup) {
      const newExtra: Extra = {
        id: group.id,
        type: "single",
        nameAR: group.nameAR,
        nameHE: group.nameHE,
        groupId: group.id,
        order: group.order,
        options: [],
        freeCount: group.freeCount,
        isGroupHeader: true, // Mark this as a group header
      };
      const updated = [...assignedExtras, newExtra];
      onSave(updated);
    } else {
      // If editing existing group, update all extras in the group
      const updated = assignedExtras.map((extra) => {
        if (extra.groupId === group.id && extra.isGroupHeader) {
          return { ...extra, nameAR: group.nameAR, nameHE: group.nameHE, order: group.order };
        }
        return extra;
      });
      onSave(updated);
    }
    setEditingGroup(null);
    setShowGroupModal(false);
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

  const handleDeleteGroup = (groupId: string) => {
    const updated = assignedExtras.filter((e) => e.groupId !== groupId);
    onSave(updated);
  };

  // Helper to assign all extras in a group
  const handleAssignGroup = (groupId: string) => {
    // Find all extras in globalExtras with this groupId (excluding group header and already assigned)
    const groupExtras = globalExtras.filter(
      (e) => e.groupId === groupId && !e.isGroupHeader && !assignedExtras.find((ae) => ae.id === e.id)
    );
    // Also add the group header itself if not already assigned
    const groupHeader = globalExtras.find(
      (e) => e.isGroupHeader && (e.groupId === groupId || e.id === groupId) && !assignedExtras.find((ae) => ae.id === e.id)
    );
    if (groupHeader) {
      handleAssignGlobal(groupHeader);
    }
    groupExtras.forEach((e) => handleAssignGlobal(e));
  };

  const renderOption = (opt: Option, extra?: Extra) => {
    // Default indicator logic
    let isDefault = false;
    if (extra?.type === 'single' && extra.defaultOptionId === opt.id) isDefault = true;
    if (extra?.type === 'multi' && Array.isArray(extra.defaultOptionIds) && extra.defaultOptionIds.includes(opt.id)) isDefault = true;
    
    if (opt.areaOptions) {
      return (
        <View style={styles.areaOptionContainer}>
          <Text style={styles.optionName}>
            {opt.nameAR} {isDefault && <Text style={styles.defaultIndicator}>★ (افتراضي)</Text>}
          </Text>
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
        <Text>{opt.nameAR}</Text>
        {opt.price ? <Text>- ₪{opt.price}</Text> : null}
        {isDefault && <Text style={styles.defaultIndicator}>★ (افتراضي)</Text>}
      </View>
    );
  };

  // Group extras by groupId
  const groupedExtras = assignedExtras?.reduce((acc, extra) => {
    if (extra.groupId) {
      if (!acc[extra.groupId]) {
        acc[extra.groupId] = [];
      }
      acc[extra.groupId].push(extra);
    } else {
      if (!acc.ungrouped) {
        acc.ungrouped = [];
      }
      acc.ungrouped.push(extra);
    }
    return acc;
  }, {} as Record<string, Extra[]>) || {};

  // Get all unique groups from assigned extras
  const groups: ExtraGroup[] = Object.entries(groupedExtras)
    .filter(([groupId]) => groupId !== "ungrouped")
    .map(([groupId, extras]) => ({
      id: groupId,
      nameAR: extras[0]?.nameAR || '',
      nameHE: extras[0]?.nameHE || '',
      order: extras[0]?.order || 0,
      freeCount: extras[0]?.freeCount,
    }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>إضافات المنتج</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.groupButton}
            onPress={() => setShowGroupModal(true)}
          >
            <Icon icon="add" size={20} />
            <Text style={styles.buttonText}>إنشاء مجموعة</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Icon icon="add" size={20} />
            <Text style={styles.addButtonText}>إضافة جديدة</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and assign from global extras */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="البحث عن إضافات موجودة..."
          value={search}
          onChangeText={setSearch}
          textAlign="right"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.globalExtrasContainer}>
          {globalExtras?.filter(
            (e) =>
              (e.nameAR?.includes(search) || e.nameHE?.includes(search)) &&
              !assignedExtras.find((ae) => ae.id === e.id)
          ).map((e) => (
            <TouchableOpacity
              key={e.id}
              style={styles.globalExtraButton}
              onPress={() => e.isGroupHeader ? handleAssignGroup(e.groupId || e.id) : handleAssignGlobal(e)}
            >
              <Text style={styles.globalExtraButtonText}>
                <Text style={styles.extraTypeLabel}>{getExtraType(e.type)}</Text> - {e.nameAR}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List grouped extras */}
      <ScrollView style={styles.extrasList}>
        {Object.entries(groupedExtras || {}).sort((a, b) => (a[1][0]?.order ?? 0) - (b[1][0]?.order ?? 0)).map(([groupId, extras]) => (
          <View key={groupId} style={styles.groupContainer}>
            {groupId !== "ungrouped" ? (
              <View style={styles.groupCard}>
                <View style={styles.groupHeader}>
                  <View>
                    <Text style={styles.groupTitle}>
                      {extras[0]?.order ?? 0} - {extras[0]?.nameAR}
                    </Text>
                    {extras[0]?.freeCount > 0 && (
                      <Text style={styles.freeCountText}>
                        {extras[0].freeCount} إضافات أولى مجانية
                      </Text>
                    )}
                  </View>
                  <View style={styles.groupActions}>
                    <TouchableOpacity
                      style={styles.editGroupButton}
                      onPress={() => setEditingGroup({ 
                        id: groupId, 
                        nameAR: extras[0]?.nameAR ?? '', 
                        nameHE: extras[0]?.nameHE ?? '', 
                        order: extras[0]?.order ?? 0 
                      })}
                    >
                      <Text style={styles.editGroupButtonText}>تعديل المجموعة</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteGroupButton}
                      onPress={() => handleDeleteGroup(groupId)}
                    >
                      <Text style={styles.deleteGroupButtonText}>حذف المجموعة</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.groupContent}>
                  {extras.filter(extra => !extra.isGroupHeader).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((extra) => (
                    <View key={extra.id} style={styles.extraCard}>
                      <View style={styles.extraHeader}>
                        <View>
                          <Text style={styles.extraTitle}>
                            {extra.order ?? 0} - {extra.nameAR}
                          </Text>
                          <Text style={styles.extraType}>
                            ({getExtraType(extra.type)})
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
                              {renderOption(opt, extra)}
                            </View>
                          ))}
                        </View>
                      )}
                      {extra.type === "weight" && (
                        <View style={styles.weightInfo}>
                          <Text style={styles.weightText}>الحد الأدنى للوزن: {extra.min}</Text>
                          <Text style={styles.weightText}>الحد الأقصى للوزن: {extra.max}</Text>
                          <Text style={styles.weightText}>الوزن الافتراضي: {extra.defaultValue}</Text>
                          <Text style={styles.weightText}>الخطوة: {extra.step}</Text>
                          <Text style={styles.weightText}>السعر: {extra.price} ₪</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.ungroupedContainer}>
                {extras.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((extra) => (
                  <View key={extra.id} style={styles.extraCard}>
                    <View style={styles.extraHeader}>
                      <View>
                        <Text style={styles.extraTitle}>
                          {extra.order ?? 0} - {extra.nameAR}
                        </Text>
                        <Text style={styles.extraType}>
                          ({getExtraType(extra.type)})
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
                            {renderOption(opt, extra)}
                          </View>
                        ))}
                      </View>
                    )}
                    {extra.type === "weight" && (
                      <View style={styles.weightInfo}>
                        <Text style={styles.weightText}>الحد الأدنى للوزن: {extra.min}</Text>
                        <Text style={styles.weightText}>الحد الأقصى للوزن: {extra.max}</Text>
                        <Text style={styles.weightText}>الوزن الافتراضي: {extra.defaultValue}</Text>
                        <Text style={styles.weightText}>الخطوة: {extra.step}</Text>
                        <Text style={styles.weightText}>السعر: {extra.price} ₪</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Modals */}
      {(showAddModal || editingExtra) && (
        <ExtraEditModal
          extra={editingExtra}
          onSave={handleSaveExtra}
          onClose={() => {
            setEditingExtra(null);
            setShowAddModal(false);
          }}
          onCreateGlobalExtra={onCreateGlobalExtra}
          groups={groups}
        />
      )}

      {(showGroupModal || editingGroup) && (
        <ExtraEditModal
          extra={editingGroup ? {
            id: editingGroup.id,
            type: "single",
            nameAR: editingGroup.nameAR,
            nameHE: editingGroup.nameHE,
            order: editingGroup.order,
            isGroupHeader: true,
            groupId: editingGroup.id,
          } as Extra : null}
          onSave={(extra) => {
            const group: ExtraGroup = {
              id: extra.id,
              nameAR: extra.nameAR,
              nameHE: extra.nameHE,
              order: extra.order || 0,
              freeCount: extra.freeCount,
            };
            handleSaveGroup(group);
          }}
          onClose={() => {
            setEditingGroup(null);
            setShowGroupModal(false);
          }}
          isGroupModal={true}
          groups={groups}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: themeStyle.GRAY_100,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: themeStyle.FONT_SIZE_MD,
    fontWeight: "bold",
    color: themeStyle.TEXT_PRIMARY_COLOR,
    textAlign: "right",
  },
  headerButtons: {
    flexDirection: "row",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeStyle.PRIMARY_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  groupButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: themeStyle.SECONDARY_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  addButtonText: {
    marginLeft: 4,
    fontSize: themeStyle.FONT_SIZE_SM,
  },
  buttonText: {
    color: "white",
    marginLeft: 4,
    fontSize: themeStyle.FONT_SIZE_SM,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    textAlign: "right",
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
  globalExtraButtonText: {
    fontSize: themeStyle.FONT_SIZE_SM,
    textAlign: "center",
  },
  extraTypeLabel: {
    fontWeight: "bold",
  },
  extrasList: {
    maxHeight: 400,
  },
  groupContainer: {
    marginBottom: 16,
  },
  groupCard: {
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  groupHeader: {
    backgroundColor: themeStyle.GRAY_200,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: themeStyle.GRAY_300,
  },
  groupTitle: {
    fontSize: themeStyle.FONT_SIZE_MD,
    fontWeight: "bold",
    color: themeStyle.TEXT_PRIMARY_COLOR,
    textAlign: "right",
  },
  freeCountText: {
    fontSize: themeStyle.FONT_SIZE_SM,
    color: themeStyle.GRAY_600,
    marginTop: 2,
    textAlign: "right",
  },
  groupActions: {
    flexDirection: "row",
  },
  editGroupButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  editGroupButtonText: {
    color: themeStyle.WARNING_COLOR,
    fontSize: themeStyle.FONT_SIZE_SM,
  },
  deleteGroupButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deleteGroupButtonText: {
    color: themeStyle.ERROR_COLOR,
    fontSize: themeStyle.FONT_SIZE_SM,
  },
  groupContent: {
    padding: 12,
  },
  ungroupedContainer: {
    marginBottom: 8,
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
    fontSize: themeStyle.FONT_SIZE_MD,
    fontWeight: "bold",
    color: themeStyle.TEXT_PRIMARY_COLOR,
    textAlign: "left",
  },
  extraType: {
    fontSize: themeStyle.FONT_SIZE_SM,
    color: themeStyle.TEXT_PRIMARY_COLOR,
    marginTop: 2,
    textAlign: "left",
  },
  extraActions: {
    flexDirection: "row",
  },
  editButton: {
    padding: 4,
    marginRight: 8,
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
    textAlign: "right",
  },
  defaultIndicator: {
    color: themeStyle.PRIMARY_COLOR,
    fontSize: 10,
  },
  areaOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  areaOptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "48%",
    marginRight: 8,
  },
  weightInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: themeStyle.GRAY_300,
  },
  weightText: {
    fontSize: 10,
    color: themeStyle.GRAY_600,
    textAlign: "right",
    marginBottom: 2,
  },
});

export default observer(ExtrasManager); 