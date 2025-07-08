import React from 'react';
import { Platform, TouchableOpacity, Text, Linking } from 'react-native';
import { openBrowserAsync } from 'expo-web-browser';

type Props = {
  href: string;
  children: React.ReactNode;
  style?: any;
};

export function ExternalLink({ href, children, style, ...rest }: Props) {
  const handlePress = async (event?: any) => {
    if (Platform.OS === 'web') {
      // En web, dejar que el enlace se abra normalmente
      return;
    }
    event?.preventDefault?.();
    // En móvil, abrir en navegador externo
    await openBrowserAsync(href);
  };

  if (Platform.OS === 'web') {
    // En web, usar un <a> nativo
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={style}
        {...rest}
      >
        {children}
      </a>
    );
  }

  // En nativo, usar TouchableOpacity
  return (
    <TouchableOpacity onPress={handlePress} style={style} {...rest}>
      {typeof children === 'string' ? (
        <Text style={{ color: '#1B95E0' }}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}