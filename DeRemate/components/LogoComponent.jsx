import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function LogoComponent({ size = 'large' }) {
  const logoSize = size === 'large' ? 150 : size === 'medium' ? 120 : 80;
  const iconSize = size === 'large' ? 110 : size === 'medium' ? 80 : 60;
  const textSize = size === 'large' ? 24 : size === 'medium' ? 20 : 16;

  return (
    <View style={styles.logoContainer}>
      <View style={[styles.logoPlaceholder, { width: logoSize, height: logoSize, borderRadius: logoSize / 2 }]}>
        <Image source={require('../assets/images/DePedidosLogo.png')} style={{width: iconSize*1.30, height: iconSize}}/>
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontWeight: 'bold',
    color: '#000',
  },
}); 