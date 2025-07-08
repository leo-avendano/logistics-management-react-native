import { View, StyleSheet } from 'react-native';

export const HeaderContainer = ({ children, style }) => {
  const combinedStyles = StyleSheet.flatten([styles.header, style]);
  
  return (
    <View style={combinedStyles}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
    header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    },
})