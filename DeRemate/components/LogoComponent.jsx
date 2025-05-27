import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LogoComponent({ size = 'large' }) {
  const logoSize = size === 'large' ? 150 : size === 'medium' ? 120 : 80;
  const iconSize = size === 'large' ? 80 : size === 'medium' ? 60 : 40;
  const textSize = size === 'large' ? 24 : size === 'medium' ? 20 : 16;

  return (
    <View style={styles.logoContainer}>
      <View style={[styles.logoPlaceholder, { width: logoSize, height: logoSize, borderRadius: logoSize / 2 }]}>
        <Ionicons name="cube-outline" size={iconSize} color="#FFC107" />
      </View>
      <Text style={[styles.logoText, { fontSize: textSize }]}>DeRemate</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
  },
  logoPlaceholder: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontWeight: 'bold',
    color: '#000',
  },
}); 