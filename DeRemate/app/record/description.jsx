import React, { useState, useEffect, useCallback } from 'react';
import {  
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getPackageInfo } from '../../services/firebaseService';
import { StatusText } from '../../components/StatusText';
import { BackButton } from '../../components/BackButton';
import { HeaderContainer } from '../../components/HeaderContainer';
import { Navbar } from '../../components/Navbar';

export default function DescriptionScreen() {
    const route = useRoute();
    const params = route.params || {};
    const routeData = JSON.parse(params.route);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rutaPackage, setRutaPackage] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPackageInfo(routeData.uuid);
            setRutaPackage(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [routeData.uuid]);

    useEffect(() => {
        if (routeData.uuid) {
            fetchData();
        }
    }, [routeData.uuid, fetchData]);

    return (
        <View style={styles.container}>
            {/* El fuking header */}
            <HeaderContainer style={{paddingHorizontal: 8, justifyContent: 'start'}}>
                <BackButton/>
                <View style={styles.logoContainer}>
                    <Ionicons name="information-outline" size={40} color="#FFC107" />
                    <View style={styles.titleContainer}>
                        <Text style={styles.logoText}>Detalles de la ruta {routeData.uuid}</Text>
                        <StatusText status={routeData.estado} style={styles.statusMargin} />
                    </View>
                </View>
            </HeaderContainer>

            {
                loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FFC107" />
                    </View>
                ): error ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={50} color="#ff4444" />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity 
                            style={styles.retryButton}
                            onPress={fetchData}
                        >
                            <Text style={styles.retryButtonText}>Reintentar</Text>
                        </TouchableOpacity>
                    </View>
                ): (
                    <ScrollView style={styles.containerDetails}>
                    {/* Sección de Destino */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ubicación de Entrega</Text>
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={20} color="#666" />
                            <Text style={styles.infoText}>Latitud: {routeData.destino?.lat}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={20} color="#666" />
                            <Text style={styles.infoText}>Longitud: {routeData.destino?.lon}</Text>
                        </View>
                    </View>

                    {/* Sección de Fechas */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Horarios</Text>
                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={20} color="#666" />
                            <Text style={styles.infoText}>Inicio: {routeData.fechas?.inicioRepartir}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#666" />
                            <Text style={styles.infoText}>Fin: {routeData.fechas?.finRepartir}</Text>
                        </View>
                    </View>

                    {/* Sección de Paquete */}
                    {rutaPackage && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Información del Paquete</Text>
                            <View style={styles.infoRow}>
                                <Ionicons name="cube-outline" size={20} color="#666" />
                                <Text style={styles.infoText}>Nombre: {rutaPackage.nombre}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="pricetag-outline" size={20} color="#666" />
                                <Text style={styles.infoText}>Descripción: {rutaPackage.descripcion}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="scale-outline" size={20} color="#666" />
                                <Text style={styles.infoText}>Peso: {rutaPackage.peso} kg</Text>
                            </View>
                            
                            {/* Tamaño del paquete */}
                            <Text style={[styles.sectionTitle, {marginTop: 15}]}>Dimensiones</Text>
                            <View style={styles.infoRow}>
                                <Ionicons name="resize-outline" size={20} color="#666" />
                                <Text style={styles.infoText}>Alto: {rutaPackage.tamaño?.alto} cm</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="resize-outline" size={20} color="#666" />
                                <Text style={styles.infoText}>Ancho: {rutaPackage.tamaño?.ancho} cm</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="resize-outline" size={20} color="#666" />
                                <Text style={styles.infoText}>Largo: {rutaPackage.tamaño?.largo} cm</Text>
                            </View>
                            
                            {/* Ubicación en almacén */}
                            <Text style={[styles.sectionTitle, {marginTop: 15}]}>Ubicación en Almacén</Text>
                            <View style={styles.infoRow}>
                                <Ionicons name="business-outline" size={20} color="#666" />
                                <Text style={styles.infoText}>Depósito: {rutaPackage.ubicacion?.deposito}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="layers-outline" size={20} color="#666" />
                                <Text style={styles.infoText}>Estante: {rutaPackage.ubicacion?.estante}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="grid-outline" size={20} color="#666" />
                                <Text style={styles.infoText}>Sector: {rutaPackage.ubicacion?.sector}</Text>
                            </View>
                        </View>
                        )}
                    </ScrollView>
                    )
                }
            <Navbar/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        marginTop: 20,
        fontSize: 18,
        color: '#ff4444',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#FFC107',
        borderRadius: 5,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    containerDetails: {
        padding: 20,
        paddingBottom: 35,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    titleContainer: {
        marginLeft: 10,
        flexDirection: 'column',
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginLeft: 8,
    },
    statusMargin: {
        marginTop: 5,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
    },
    section: {
        marginBottom: 25,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#444',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 7,
    },
    infoText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#555',
    },
});