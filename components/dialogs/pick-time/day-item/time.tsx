// import React, { useState } from 'react';
// import { View, Text, StyleSheet, Dimensions } from 'react-native';
// import Carousel from 'react-native-snap-carousel';

// const CustomTimePicker = () => {
//   const [selectedTime, setSelectedTime] = useState('12:00 PM');
//   const timeData = [
//     '12:00 AM',
//     '1:00 AM',
//     // Add more time options here
//     '11:00 PM',
//     '12:00 PM',
//   ];

//   const renderTimeItem = ({ item }) => {
//     return (
//       <View style={styles.timeItem}>
//         <Text style={styles.timeText}>{item}</Text>
//       </View>
//     );
//   };

//   return (
//     <Carousel
//       data={timeData}
//       renderItem={renderTimeItem}
//       sliderHeight={Dimensions.get('window').height}
//       itemHeight={80}
//       vertical={true}
//       onSnapToItem={(index) => setSelectedTime(timeData[index])}
//     />
//   );
// };



// const App = () => {
//   return (
//     <View style={styles.container}>
//       <CustomTimePicker />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   timeItem: {
//     width: 80,
//     height: 80,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#ccc',
//     borderRadius: 40,
//     marginVertical: 10,
//   },
//   timeText: {
//     fontSize: 16,
//   },
// });

// export default App;
