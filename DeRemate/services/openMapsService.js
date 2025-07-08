import { Platform, Linking } from 'react-native';

export const openGoogleMaps = (coordenadas) => {
  if (!coordenadas) {
    console.error('Coordenadas no disponibles');
    return;
  }

  const { lat, lon } = coordenadas;
  const location = `${lat},${lon}`;

  const url = Platform.select({
    ios: `maps:${lat},${lon}?q=${location}`,
    android: `geo:${lat},${lon}?q=${location}`
  });

  Linking.canOpenURL(url)
    .then(supported => {
      if (supported) {
        return Linking.openURL(url);
      } else {
        const browserUrl = `https://www.google.com/maps/search/?api=1&query=${location}`;
        return Linking.openURL(browserUrl);
      }
    })
    .catch(err => console.error('Error al abrir Google Maps:', err));
};
