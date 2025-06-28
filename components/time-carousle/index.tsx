import React, { useState, useEffect, useRef } from 'react';
import { View, Text, VirtualizedList, StyleSheet } from 'react-native';

const generateTimeSlots = () => {
  // Generate more time slots than initially visible for infinite scrolling
  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      timeSlots.push({
        label: `${formattedHour}:${formattedMinute}`,
        value: `${formattedHour}:${formattedMinute}`,
      });
    }
  }
  return timeSlots;
};

const TimeCarousel = () => {
  const [data, setData] = useState(generateTimeSlots());
  const [selectedTime, setSelectedTime] = useState('');
  const listRef = useRef(null);

  // Calculate dynamic item height based on data length
  const itemHeight = 60;
  const contentHeight = data.length * itemHeight;

  useEffect(() => {
    // Calculate the initial scroll offset based on the selected time
    if (selectedTime) {
      const selectedIndex = data.findIndex(
        (item) => item.value === selectedTime
      );
      if (selectedIndex !== -1 && listRef.current) {
        const initialOffset = selectedIndex * itemHeight;
        listRef.current.scrollToOffset({ offset: initialOffset });
      }
    }
  }, [selectedTime, data]);

  const getItem = (_, index) => data[index % data.length];
  const getItemCount = () => contentHeight / itemHeight;

  return (
    <View style={styles.container}>
      <VirtualizedList
        ref={listRef}
        data={data}
        renderItem={({ item }) => (
          <Text style={styles.timeSlot}>{item.label}</Text>
        )}
        getItem={getItem}
        getItemCount={getItemCount}
        keyExtractor={(item) => item.value}
        initialNumToRender={3} // Initial number of items to render
        windowSize={5} // Number of items to keep rendered off-screen
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: index * itemHeight,
          index,
        })}
        onMomentumScrollEnd={(event) => {
          const index = Math.floor(
            event.nativeEvent.contentOffset.y / itemHeight
          );
          setSelectedTime(data[index % data.length].value);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  timeSlot: {
    height: 60,
    lineHeight: 60,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default TimeCarousel;
