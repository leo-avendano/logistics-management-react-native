import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const BackButton = ({ tintColor = '#FFC107', size = 28 }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.goBack()
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={{ padding: 8 }}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
    >
      <Ionicons name="chevron-back" size={size} color={tintColor} />
    </TouchableOpacity>
  );
};