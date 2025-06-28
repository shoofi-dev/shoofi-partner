import React, { useContext } from "react";
import { observer } from "mobx-react";
import ExtrasSection, {
  Extra,
} from "../../../components/extras-controls/ExtrasSection";
import { StoreContext } from "../../../stores";

export type MealExtrasProps = {
  extras: Extra[];
};

const MealExtras = ({ extras }: MealExtrasProps) => {
  let { extrasStore } = useContext(StoreContext);
  return (
    <ExtrasSection
      extras={extras}
      selections={extrasStore.selections}
      onChange={(extraId, value) => extrasStore.setSelection(extraId, value)}
    />
  );
};

export default observer(MealExtras);
