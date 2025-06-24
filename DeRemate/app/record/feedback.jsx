import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { HeaderContainer } from '../../components/HeaderContainer';
import { BackButton } from '../../components/BackButton';
import { useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';

export default function FeedbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const feedback = JSON.parse(params.feedback);
const navigation = useNavigation();
const route = JSON.parse(params.route);

useLayoutEffect(() => {
  navigation.setOptions({ headerShown: false });
}, [navigation]);

  return (
    <View style={styles.container}>
<HeaderContainer style={{paddingHorizontal: 8, justifyContent: 'start'}}>
<BackButton routeBack={{
  pathname: "/record/description",
  params: { route: JSON.stringify(route) }
}} />
  <View style={styles.headerContent}>
    <Ionicons name="chatbubble-ellipses-outline" size={24} color="#FFC107" />
    <Text style={styles.headerText}>Feedback del Cliente</Text>
  </View>
</HeaderContainer>


      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Comentario */}
          <View style={styles.section}>
            <Text style={styles.label}>Comentario:</Text>
            <Text style={styles.text}>{feedback.comentario || 'Sin comentario'}</Text>
          </View>

          {/* Estrellas */}
          <View style={styles.section}>
            <Text style={styles.label}>Calificación:</Text>
            <View style={styles.starsRow}>
              {[...Array(5)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < feedback.estrellas ? 'star' : 'star-outline'}
                  size={22}
                  color="#FFD700"
                />
              ))}
            </View>
          </View>

          {/* Imágenes */}
          {feedback.imagen && Array.isArray(feedback.imagen) && (
            <View style={styles.section}>
              <Text style={styles.label}>Imágenes:</Text>
              <View style={styles.imageColumn}>
                {feedback.imagen.map((imgUrl, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: imgUrl }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ))}
              </View>
            </View>
          )}

          {feedback.imagen && typeof feedback.imagen === 'string' && (
            <View style={styles.section}>
              <Text style={styles.label}>Imagen:</Text>
              <Image
                source={{ uri: feedback.imagen }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginBottom: 6,
  },
  text: {
    fontSize: 16,
    color: '#555',
  },
  starsRow: {
    flexDirection: 'row',
  },
  imageColumn: {
    flexDirection: 'column',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 12,
  },
});
