import * as Location from 'expo-location'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import RiderMapView from '../../../components/RiderMapView'
import { images } from '../../../constants'
import { updateOrderRiderLocation } from '../../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'

const isWeb = Platform.OS === 'web'

export default function ActiveDelivery() {
    const { activeDelivery, completeRiderDelivery, fetchRiderData } = useGlobalContext()
    const [completing, setCompleting] = useState(false)
    const [riderCoords, setRiderCoords] = useState(null)

    useEffect(() => {
        if (!activeDelivery?.id) return

        let subscription = null

        const startLocationBroadcast = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync()
                if (status !== 'granted') return

                subscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        distanceInterval: 10,
                        timeInterval: 10000,
                    },
                    (loc) => {
                        const { latitude, longitude } = loc.coords
                        setRiderCoords({ lat: latitude, lng: longitude })
                        updateOrderRiderLocation(activeDelivery.id, latitude, longitude)
                    }
                )
            } catch (err) {
                console.warn('Rider GPS broadcast warning:', err?.message)
            }
        }

        startLocationBroadcast()

        return () => {
            if (subscription && subscription.remove) {
                subscription.remove()
            }
        }
    }, [activeDelivery?.id])

    const handleComplete = () => {
        Alert.alert(
            'Mark as Delivered?',
            'Confirm that you have delivered this order to the customer.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delivered',
                    onPress: async () => {
                        setCompleting(true)
                        try {
                            await completeRiderDelivery(activeDelivery.id)
                            await fetchRiderData()
                        } catch (e) {
                            Alert.alert('Error', 'Could not complete delivery. Try again.')
                        } finally {
                            setCompleting(false)
                        }
                    },
                },
            ]
        )
    }

    if (!activeDelivery) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }} edges={['top']}>
                <View style={{
                    width: 96, height: 96, borderRadius: 48,
                    backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 20, borderWidth: 2, borderColor: '#FED7AA',
                }}>
                    <Image source={images.location} style={{ width: 44, height: 44 }} resizeMode="contain" tintColor="#FE8C00" />
                </View>
                <Text style={{ fontSize: 20, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', textAlign: 'center' }}>
                    No active delivery
                </Text>
                <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Regular', color: '#9CA3AF', textAlign: 'center', marginTop: 8 }}>
                    Accept an order from the Dashboard to start delivering.
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/(rider)/dashboard')}
                    style={{ marginTop: 24, backgroundColor: '#FE8C00', borderRadius: 99, paddingHorizontal: 28, paddingVertical: 14 }}
                >
                    <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#FFF' }}>Go to Dashboard</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
            {/* Header */}
            <View style={{
                paddingHorizontal: isWeb ? 32 : 20,
                paddingTop: isWeb ? 20 : 16,
                paddingBottom: 14,
                backgroundColor: '#FFFFFF',
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6',
            }}>
                <View style={{ maxWidth: isWeb ? 900 : undefined, width: '100%', alignSelf: isWeb ? 'center' : undefined }}>
                    <Text style={{ fontSize: 22, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>Active Delivery</Text>
                    <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#FE8C00' }}>
                        #{activeDelivery.id?.slice(-8).toUpperCase()} · Out for Delivery
                    </Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: isWeb ? 32 : 20,
                    paddingTop: 20,
                    paddingBottom: isWeb ? 40 : 140,
                    maxWidth: isWeb ? 900 : undefined,
                    width: isWeb ? '100%' : undefined,
                    alignSelf: isWeb ? 'center' : undefined,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Delivery Destination */}
                <View style={{
                    backgroundColor: '#FFF7ED', borderRadius: 20, padding: 18,
                    marginBottom: 16, borderWidth: 1, borderColor: '#FED7AA',
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FE8C0020', alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={images.location} style={{ width: 16, height: 16 }} resizeMode="contain" tintColor="#FE8C00" />
                        </View>
                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#FE8C00', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Deliver to
                        </Text>
                    </View>
                    <Text style={{ fontSize: 18, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                        {activeDelivery.address || 'No address provided'}
                    </Text>
                    <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Medium', color: '#6B7280', marginTop: 4 }}>
                        Customer: {activeDelivery.customerName}
                    </Text>
                    {activeDelivery.note ? (
                        <View style={{
                            marginTop: 10, padding: 10, backgroundColor: '#FFF',
                            borderRadius: 10, borderWidth: 1, borderColor: '#FED7AA',
                            flexDirection: 'row', alignItems: 'flex-start', gap: 8,
                        }}>
                            <Image source={images.pencil} style={{ width: 13, height: 13, marginTop: 1 }} resizeMode="contain" tintColor="#9CA3AF" />
                            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#6B7280', flex: 1 }}>
                                {activeDelivery.note}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* Live Navigation Map View */}
                <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginBottom: 10 }}>
                        Live Route Navigation Map
                    </Text>
                    <RiderMapView
                        riderLat={riderCoords?.lat || activeDelivery.riderLat}
                        riderLng={riderCoords?.lng || activeDelivery.riderLng}
                        destinationName={activeDelivery.address}
                        height={isWeb ? 320 : 240}
                    />
                </View>

                {/* Order Items */}
                <View style={{
                    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
                    marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6',
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={images.bag} style={{ width: 15, height: 15 }} resizeMode="contain" tintColor="#F97316" />
                        </View>
                        <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>Order Items</Text>
                    </View>
                    {activeDelivery.items.map((it, idx) => (
                        <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                                <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#FE8C00' }} />
                                <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Medium', color: '#1C1C2E' }}>
                                    {it.quantity}x {it.name}
                                </Text>
                            </View>
                            <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#6B7280' }}>
                                KES {((it.price ?? 0) * it.quantity).toLocaleString()}
                            </Text>
                        </View>
                    ))}
                    <View style={{ height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>Total</Text>
                        <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>
                            KES {activeDelivery.totalPrice.toLocaleString()}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleComplete}
                    disabled={completing}
                    style={{
                        backgroundColor: completing ? '#E07B00' : '#FE8C00',
                        borderRadius: 16, paddingVertical: 18,
                        alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'row', gap: 12,
                        shadowColor: '#FE8C00', shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
                    }}
                >
                    {completing
                        ? <ActivityIndicator size="small" color="#FFF" />
                        : <>
                            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                                <Image source={images.check} style={{ width: 14, height: 14 }} resizeMode="contain" tintColor="#FFF" />
                            </View>
                            <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#FFF' }}>
                                Mark as Delivered
                            </Text>
                        </>
                    }
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}