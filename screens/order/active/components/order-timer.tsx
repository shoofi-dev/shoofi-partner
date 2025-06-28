import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { G, Circle, Path } from "react-native-svg";
import Text from "../../../../components/controls/Text";
import themeStyle from "../../../../styles/theme.style";
import { useTranslation } from "react-i18next";
import {
  DELIVERY_STATUS,
  DELIVERY_STATUS_TEXT,
  ORDER_STATUS,
  ORDER_STATUS_TEXT,
  SHIPPING_METHODS,
} from "../../../../consts/shared";
import { StoreContext } from "../../../../stores";
import Icon from "../../../../components/icon";

interface OrderTimerProps {
  order?: any;
  mockData?: {
    status: string;
    totalMinutes: number;
    remainingMinutes: number;
    isActive: boolean;
  };
}

const SEGMENTS = 5;
const RADIUS = 40;
const STROKE = 8;
const GAP_DEG = 18;
const SIZE = (RADIUS + STROKE) * 2;

async function getTotalAndRemainingMinutes(
  order?: any,
  mockData?: any,
  ordersStore?: any
) {
  const now = Date.now();
  const oOrder = order?.order;
  if (order && order.status) {
    switch (order.status) {
      case "6": // PENDING
        if (order.created && order.storeData?.maxReady) {
          const created = new Date(order.created).getTime();
          const maxReady = parseInt(order.storeData.maxReady, 10) || 50;
          const totalMinutes = maxReady;
          const minutesPassed = Math.floor((now - created) / 60000);
          const remainingMinutes = Math.max(0, totalMinutes - minutesPassed);
          return {
            status: "pending",
            totalMinutes,
            remainingMinutes,
            isActive: true,
            order,
          };
        }
      // If orderDate is set, fall through to default logic
      // no break
      case "1": // IN_PROGRESS
        if (
          order.created &&
          order.orderDate &&
          !isNaN(Date.parse(order.created)) &&
          !isNaN(Date.parse(order.orderDate))
        ) {
          if (oOrder.receipt_method == SHIPPING_METHODS.shipping) {
            const delivery = await ordersStore.getDeliveryByBookId(
              order.orderId
            );
            if (delivery?.expectedDeliveryAt) {
              // Parse deliveryDeltaMinutes as "HH:mm"
              const created = new Date(order.created).getTime();
              const nowDate = new Date();
              let deliveryTime = new Date(delivery.expectedDeliveryAt);
              // If delivery time is before now, assume it's for the next day
              if (deliveryTime.getTime() < nowDate.getTime()) {
                deliveryTime.setDate(deliveryTime.getDate() + 1);
              }

              const totalMinutes = Math.max(
                1,
                Math.round((deliveryTime.getTime() - created) / 60000)
              );
              const remainingMinutes = Math.max(
                0,
                Math.ceil((deliveryTime.getTime() - nowDate.getTime()) / 60000)
              );
              console.log("totalMinutes",deliveryTime)
              console.log("created",new Date(order.created))
              console.log("delivery.expectedDeliveryAt",delivery.expectedDeliveryAt)
              return {
                status: "preparing",
                totalMinutes,
                remainingMinutes,
                isActive: true,
                order,
              };
            }
          }
          const created = new Date(order.created).getTime();
          const orderDate = new Date(order.orderDate).getTime();
          const totalMinutes = Math.max(
            1,
            Math.round((orderDate - created) / 60000)
          );
          const remainingMinutes = Math.max(
            0,
            Math.ceil((orderDate - now) / 60000)
          );
          console.log("totalMinutes2",totalMinutes)

          return {
            status: "preparing",
            totalMinutes,
            remainingMinutes,
            isActive: true,
            order,
          };
        }
        break;
      case "3":
      case "11":
        if (
          order.created &&
          order.orderDate &&
          !isNaN(Date.parse(order.created)) &&
          !isNaN(Date.parse(order.orderDate))
        ) {
          const oOrder = order?.order;
          const delivery = await ordersStore.getDeliveryByBookId(order.orderId);
          if (delivery?.expectedDeliveryAt) {
            // Parse deliveryDeltaMinutes as "HH:mm"
            const created = new Date(order.created).getTime();
            const nowDate = new Date();
            let deliveryTime = new Date(delivery.expectedDeliveryAt);
            // If delivery time is before now, assume it's for the next day
            if (deliveryTime.getTime() < nowDate.getTime()) {
              deliveryTime.setDate(deliveryTime.getDate() + 1);
            }

            const totalMinutes = Math.max(
              1,
              Math.round((deliveryTime.getTime() - created) / 60000)
            );
            const remainingMinutes = Math.max(
              0,
              Math.ceil((deliveryTime.getTime() - nowDate.getTime()) / 60000)
            );
            console.log("elivery.status", delivery.status);
            let status = "";
            if (
              DELIVERY_STATUS.COLLECTED_FROM_RESTAURANT === delivery.status
                ? DELIVERY_STATUS_TEXT[
                    DELIVERY_STATUS.COLLECTED_FROM_RESTAURANT
                  ]
                : ORDER_STATUS_TEXT[order.status]
            )
              switch (delivery.status) {
                case DELIVERY_STATUS.COLLECTED_FROM_RESTAURANT:
                  status =
                    DELIVERY_STATUS_TEXT[
                      DELIVERY_STATUS.COLLECTED_FROM_RESTAURANT
                    ];
                  break;
                case DELIVERY_STATUS.DELIVERED:
                  status = DELIVERY_STATUS_TEXT[DELIVERY_STATUS.DELIVERED];
                  break;
                default:
                  status = ORDER_STATUS_TEXT[order.status];
                  break;
              }
            return {
              status,
              totalMinutes,
              remainingMinutes,
              isActive: true,
              order,
            };
          }
          const created = new Date(order.created).getTime();
          const orderDate = new Date(order.orderDate).getTime();
          const totalMinutes = Math.max(
            1,
            Math.round((orderDate - created) / 60000)
          );
          const remainingMinutes = Math.max(
            0,
            Math.ceil((orderDate - now) / 60000)
          );

          return {
            status: "waiting-for-pickup",
            totalMinutes,
            remainingMinutes,
            isActive: true,
            order,
          };
        }
        break; // WAITING_FOR_DRIVER
      case "2": // COMPLETED/READY
        if (
          order.created &&
          order.orderDate &&
          !isNaN(Date.parse(order.created)) &&
          !isNaN(Date.parse(order.orderDate))
        ) {
          const created = new Date(order.created).getTime();
          const orderDate = new Date(order.orderDate).getTime();
          const totalMinutes = Math.max(
            1,
            Math.round((orderDate - created) / 60000)
          );
          const remainingMinutes = Math.max(
            0,
            Math.ceil((orderDate - now) / 60000)
          );
          let status: string = "ready";

          return {
            status,
            totalMinutes,
            remainingMinutes,
            isActive: true,
            order,
          };
        }
        break;
      default:
        break;
    }
  }
  // Fallback: use mockData or default
  if (mockData) {
    return {
      status: mockData.status || "preparing",
      totalMinutes: mockData.totalMinutes,
      remainingMinutes: mockData.remainingMinutes,
      isActive: mockData.isActive ?? false,
    };
  }
  return {
    status: "preparing",
    totalMinutes: 10,
    remainingMinutes: 7,
    isActive: false,
    order: null,
  };
}

const OrderTimer: React.FC<OrderTimerProps> = ({ mockData, order }) => {
  const { t } = useTranslation();
  const { ordersStore } = useContext(StoreContext);
  const [timerData, setTimerData] = useState(null);
  const [timeText, setTimeText] = useState(null);
  const [showCartIcon, setShowCartIcon] = useState(false);
  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;

    async function updateTimer() {
      const data = await getTotalAndRemainingMinutes(
        order,
        mockData,
        ordersStore
      );
      if (isMounted) setTimerData(data);
    }

    updateTimer(); // initial call

    interval = setInterval(updateTimer, 1000 * 30); // update every 30 seconds (or 60 for every minute)

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [order, mockData, ordersStore]);
  const [progress, setProgress] = useState(0);
  const [filledSegments, setFilledSegments] = useState(0);
  const [timeValue, setTimeValue] = useState(0);
  const [timeUnit, setTimeUnit] = useState("");
  const [statusText, setStatusText] = useState("");

  // Conditional display logic (from old getTimeText)

  // Helper to get arc for each segment
  const getSegment = (index: number, color: string) => {
    const startAngle = (360 / SEGMENTS) * index + GAP_DEG / 2;
    const endAngle = (360 / SEGMENTS) * (index + 1) - GAP_DEG / 2;
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    const start = polarToCartesian(
      RADIUS + STROKE,
      RADIUS + STROKE,
      RADIUS,
      endAngle
    );
    const end = polarToCartesian(
      RADIUS + STROKE,
      RADIUS + STROKE,
      RADIUS,
      startAngle
    );
    const d = [
      `M ${start.x} ${start.y}`,
      `A ${RADIUS} ${RADIUS} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    ].join(" ");
    return (
      <Path
        key={index}
        d={d}
        stroke={color}
        strokeWidth={STROKE}
        fill="none"
        strokeLinecap="round"
      />
    );
  };

  // Helper: polar to cartesian
  function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const a = ((angle - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a),
    };
  }
  const handleDelivery = async () => {
    const delivery = await ordersStore.getDeliveryByBookId(
      timerData?.order?.orderId
    );
    console.log("deliveryxxx", delivery.status);
    if (delivery?.status == DELIVERY_STATUS.COLLECTED_FROM_RESTAURANT) {
      setShowCartIcon(false);
      return;
    }
    if (delivery?.status == DELIVERY_STATUS.DELIVERED) {
      setShowCartIcon(true);
      updateTimerData(true);
      return;
    }
    updateTimerData();
    // Progress: how many segments should be green
  };

  const updateTimerData = (isfull = false) => {
    let remaining = timerData?.remainingMinutes;
    if (remaining <= 1) {
      remaining += 5;
    }
    const progress = Math.max(
      0,
      Math.min(
        1,
        (timerData?.totalMinutes - remaining) /
          timerData?.totalMinutes
      )
    );
    const filledSegments = Math.round(progress * SEGMENTS);
    console.log("remaining", remaining);
    // For Hebrew/RTL: time first, then "דק'"
    const timeValue = remaining?.toString().padStart(2, "0") || "00";
    const timeUnit = t("דק"); // e.g. דק'
    const statusText = t(timerData?.status);
    setProgress(progress);
    setFilledSegments(isfull ? SEGMENTS : filledSegments);
    setTimeValue(timeValue);
    setTimeUnit(timeUnit);
    setStatusText(statusText);
  };
  useEffect(() => {
    if (
      timerData?.order?.status === ORDER_STATUS.COMPLETED ||
      timerData?.order?.status === ORDER_STATUS.WAITING_FOR_DRIVER ||
      timerData?.order?.status === ORDER_STATUS.PICKED_UP_BY_DRIVER
    ) {
      if (
        timerData?.order?.order?.receipt_method === SHIPPING_METHODS.shipping
      ) {
        handleDelivery();
      } else {
        setShowCartIcon(true);
        updateTimerData(true);
      }
    } else {
      updateTimerData();
    }
  }, [timerData]);

  if (!timerData) return null;
  return (
    <View style={styles.centered}>
      <View style={styles.ringContainer}>
        <Svg width={SIZE} height={SIZE}>
          <G>
            {[...Array(SEGMENTS)].map((_, i) =>
              getSegment(
                i,
                i < filledSegments
                  ? themeStyle.SUCCESS_COLOR
                  : themeStyle.GRAY_30
              )
            )}
          </G>
        </Svg>
        <View style={styles.timeCenter}>
          {showCartIcon ? (
            <Icon icon="cart" size={60} color={themeStyle.SUCCESS_COLOR} />
          ) : (
            <Text style={styles.timeText}>
              <Text style={styles.timeValue}>{timeValue}</Text>
              <Text style={styles.timeUnit}> {timeUnit}</Text>
            </Text>
          )}
        </View>
      </View>
      <Text style={styles.statusText}>{statusText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringContainer: {
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  timeCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SIZE,
    height: SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  timeText: {
    flexDirection: "row-reverse",
    alignItems: "center",
    fontWeight: "bold",
    color: themeStyle.SUCCESS_COLOR,
    fontSize: 28,
  },
  timeValue: {
    color: themeStyle.SUCCESS_COLOR,
    fontWeight: "bold",
    fontSize: themeStyle.FONT_SIZE_XL,
  },
  timeUnit: {
    color: themeStyle.SUCCESS_COLOR,
    fontWeight: "bold",
    fontSize: themeStyle.FONT_SIZE_XL,
  },
  statusText: {
    bottom: -30,
    fontSize: themeStyle.FONT_SIZE_SM,
    textAlign: "center",
    fontWeight: "500",
    position: "absolute",
  },
});

export default OrderTimer;
