import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export const Loading = ({ size = "large", color = "#FFC107", backgroundColor = "#ffffff" }) => {
  return (
    <View style={[styles.loadingContainer, { backgroundColor }]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});