import { makeAutoObservable } from "mobx";
import { isEmpty } from "lodash";
import { AreaOption } from "../../components/extras-controls/ExtrasSection";

class ExtrasStore {
  selections = {};
  constructor() {
    makeAutoObservable(this);
  }
  setSelection(extraId, value) {
    if (this.selections[extraId] === value) {
      delete this.selections[extraId];
    } else {
      this.selections[extraId] = value;
    }
    this.selections = {...this.selections};
  }
  getSelection(extraId) {
    return this.selections[extraId];
  }
  reset() {
    this.selections = {};
  }
  validate(extras) {
    if(!extras){
        return true;
    }
    for (const extra of extras) {
      const val = this.selections[extra.id];
      if (extra.required) {
        if (extra.type === "single" && !val) return false;
        if (extra.type === "multi" && (!val || val.length < (extra.min || 1))) return false;
        if (extra.type === "counter" && (val === undefined || val < (extra.min || 0))) return false;
        if (extra.type === "pizza-topping") {
          // At least one topping must be selected
          if (!val || Object.keys(val).length === 0) return false;
        }
      }
      if (extra.type === "multi" && extra.max && val && val.length > extra.max) return false;
      if (extra.type === "counter" && extra.max && val > extra.max) return false;
    }
    return true;
  }

  // Helper function to get group header for an extra
  getGroupHeader(extras, groupId) {
    return extras.find(e => e.groupId === groupId && e.isGroupHeader);
  }

  calculateExtrasPrice(extras, selected = this.selections) {
    let total = 0;
    if(!extras || extras.length === 0 || isEmpty(extras)){
        return total;
    }

    // Track free toppings per group
    const groupFreeCounts = new Map();
    const groupUsedFreeCounts = new Map();

    // First pass: collect all group free counts
    for (const extra of extras) {
      if (extra.isGroupHeader && extra.freeCount) {
        groupFreeCounts.set(extra.groupId, extra.freeCount);
        groupUsedFreeCounts.set(extra.groupId, 0);
      }
    }

    // Second pass: calculate prices
    for (const extra of extras) {
      const val = selected[extra.id];
      if (extra.type === "single" && extra.options) {
        const opt = extra.options.find(o => o.id === val);
        if (opt && opt.price) total += opt.price;
      }
      if (extra.type === "multi" && extra.options && Array.isArray(val)) {
        for (const id of val) {
          const opt = extra.options.find(o => o.id === id);
          if (opt && opt.price) total += opt.price;
        }
      }
      if (extra.type === "counter" && extra.price && val) {
        total += extra.price * val;
      }
      if (extra.type === "weight" && extra.price && val && extra.step) {
        const currentCount = val/extra.step;
        total += extra.price * (currentCount -1);
      }
      if (extra.type === "pizza-topping" && extra.options) {
        // val is { [toppingId]: areaId }
        const groupHeader = extra.groupId ? this.getGroupHeader(extras, extra.groupId) : null;
        const freeCount = groupHeader?.freeCount || 0;
        const usedFreeCount = groupUsedFreeCounts.get(extra.groupId) || 0;
        let remainingFreeCount = freeCount - usedFreeCount;

        for (const toppingId in val) {
          const areaId = val[toppingId];
          const topping = extra.options.find(o => o.id === toppingId);
          if (topping && topping.areaOptions) {
            const area = topping.areaOptions.find(a => a.id === areaId);
            if (area && area.price) {
              if (remainingFreeCount > 0) {
                remainingFreeCount--;
                groupUsedFreeCounts.set(extra.groupId, usedFreeCount + 1);
              } else {
                total += area.price;
              }
            } else if (topping.price) {
              if (remainingFreeCount > 0) {
                remainingFreeCount--;
                groupUsedFreeCounts.set(extra.groupId, usedFreeCount + 1);
              } else {
                total += topping.price;
              }
            }
          } else if (topping && topping.price) {
            if (remainingFreeCount > 0) {
              remainingFreeCount--;
              groupUsedFreeCounts.set(extra.groupId, usedFreeCount + 1);
            } else {
              total += topping.price;
            }
          }
        }
      }
    }
    return total;
  }
}

export const extrasStore = new ExtrasStore();
export { ExtrasStore };
