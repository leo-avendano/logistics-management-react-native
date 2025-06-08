import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export const BackButton = ({ routeBack , tintColor = '#FFC107', size = 28 }) => {
  const router = useRouter();

  const handlePress = () => {
    const targetRoute = `/${routeBack}`;
    router.replace(targetRoute);
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