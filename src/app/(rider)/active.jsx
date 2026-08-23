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
    TextInput,
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
    const {
        activeDelivery,
        pendingConfirmations = [],
        prepareDeliveryCode,
        verifyAndCompleteDelivery,
        fetchRiderData,
    } = useGlobalContext()

    const [completing, setCompleting] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [codeInput, setCodeInput] = useState('')
    const [attempts, setAttempts] = useState(0)
    const [codeReady, setCodeReady] = useState(false)
    const [riderCoords, setRiderCoords] = useState(null)

    // Broadcast GPS while on an active delivery
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

    // Sync codeReady if the order already has a code (e.g. after refresh)
    useEffect(() => {
        if (activeDelivery?.confirmation_code) {
            setCodeReady(true)
        } else {
            setCodeReady(false)
            setCodeInput('')
            setAttempts(0)
        }
    }, [activeDelivery?.id, activeDelivery?.confirmation_code])

    const handleGetCode = async () => {
        if (!activeDelivery?.id) return
        setGenerating(true)
        try {
            await prepareDeliveryCode(activeDelivery.id)
            setCodeReady(true)
            Alert.alert(
                'Code Generated',
                'Ask the customer to open their app and show you the 4-digit delivery code.'
            )
        } catch (e) {
            Alert.alert('Error', e?.message || 'Could not generate code. Try again.')
        } finally {
            setGenerating(false)
        }
    }

    const handleVerifyCode = async () => {
        if (!codeInput.trim() || codeInput.length < 4) {
            Alert.alert('Invalid', 'Please enter the 4-digit code.')
            return
        }
        if (attempts >= 5) {
            Alert.alert('Too many attempts', 'Maximum 5 attempts reached. Contact support.')
            return
        }

        setCompleting(true)
        try {
            await verifyAndCompleteDelivery(activeDelivery.id, codeInput.trim())
            Alert.alert('Success', 'Delivery completed successfully.')
            setCodeInput('')
            setAttempts(0)
            setCodeReady(false)
        } catch (e) {
            const newAttempts = attempts + 1
            setAttempts(newAttempts)

            const msg = e?.message || ''
            if (msg.toLowerCase().includes('expired')) {
                Alert.alert('Code Expired', msg)
            } else if (msg.toLowerCase().includes('incorrect')) {
                Alert.alert(
                    'Incorrect Code',
                    `Wrong code. ${5 - newAttempts} attempt${5 - newAttempts === 1 ? '' : 's'} remaining.`
                )
            } else {
                Alert.alert('Error', msg || 'Verification failed.')
            }
        } finally {
            setCompleting(false)
        }
    }

    // ── Empty state ──────────────────────────────────────────────────────────
    if (!activeDelivery && pendingConfirmations.length === 0) {
        return (
            <SafeAreaView
                style={{ flex: 1, backgroundColor: '#FAFAFA', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}
                edges={['top']}
            >
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
                    <Text style={{ fontSize: 22, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                        {activeDelivery ? 'Active Delivery' : 'Awaiting Confirmation'}
                    </Text>
                    {activeDelivery ? (
                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#FE8C00' }}>
                            #{activeDelivery.id?.slice(-8).toUpperCase()} · Out for Delivery
                        </Text>
                    ) : (
                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#059669' }}>
                            {pendingConfirmations.length} order{pendingConfirmations.length !== 1 ? 's' : ''} waiting for customer
                        </Text>
                    )}
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
                {/* ── Currently delivering ─────────────────────────────────── */}
                {activeDelivery && (
                    <>
                        {/* Destination */}
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

                        {/* Map */}
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

                        {/* Items */}
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

                        {/* ── Confirmation code section ─────────────────────── */}
                        <View style={{
                            backgroundColor: '#FFF7ED',
                            borderRadius: 12,
                            padding: 12,
                            marginBottom: 14,
                            borderWidth: 1,
                            borderColor: '#FED7AA',
                        }}>
                            <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Medium', color: '#C2410C', textAlign: 'center' }}>
                                Ask the customer for their 4-digit code.
                            </Text>
                        </View>

                        {!codeReady ? (
                            <TouchableOpacity
                                onPress={handleGetCode}
                                disabled={generating}
                                style={{
                                    backgroundColor: generating ? '#E07B00' : '#FE8C00',
                                    borderRadius: 16,
                                    paddingVertical: 18,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'row',
                                    gap: 12,
                                    marginBottom: 24,
                                }}
                            >
                                {generating ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#FFF' }}>
                                        I’ve Arrived – Get Code
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ) : (
                            <View style={{ marginBottom: 24 }}>
                                <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Medium', color: '#6B7280', marginBottom: 8 }}>
                                    Enter the 4-digit code shown on the customer’s phone
                                </Text>
                                <TextInput
                                    value={codeInput}
                                    onChangeText={(t) => setCodeInput(t.replace(/[^0-9]/g, '').slice(0, 4))}
                                    keyboardType="number-pad"
                                    maxLength={4}
                                    placeholder="••••"
                                    placeholderTextColor="#9CA3AF"
                                    style={{
                                        backgroundColor: '#FFFFFF',
                                        borderWidth: 1.5,
                                        borderColor: '#E5E7EB',
                                        borderRadius: 14,
                                        paddingVertical: 14,
                                        paddingHorizontal: 16,
                                        fontSize: 22,
                                        fontFamily: 'QuickSand-Bold',
                                        letterSpacing: 8,
                                        textAlign: 'center',
                                        marginBottom: 12,
                                        color: '#1C1C2E',
                                    }}
                                />
                                <TouchableOpacity
                                    onPress={handleVerifyCode}
                                    disabled={completing || attempts >= 5}
                                    style={{
                                        backgroundColor: completing || attempts >= 5 ? '#9CA3AF' : '#10B981',
                                        borderRadius: 16,
                                        paddingVertical: 18,
                                        alignItems: 'center',
                                    }}
                                >
                                    {completing ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#FFF' }}>
                                            {attempts >= 5 ? 'Max attempts reached' : 'Verify & Complete Delivery'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}

                {/* ── Awaiting confirmation (legacy Delivered status) ─────── */}
                {pendingConfirmations.length > 0 && (
                    <View style={{ marginBottom: 16 }}>
                        <Text style={{
                            fontSize: 14,
                            fontFamily: 'QuickSand-Bold',
                            color: '#1C1C2E',
                            marginBottom: 12,
                        }}>
                            {activeDelivery ? 'Also awaiting confirmation' : 'Awaiting Customer Confirmation'}
                        </Text>

                        {pendingConfirmations.map((order) => (
                            <View
                                key={order.id}
                                style={{
                                    backgroundColor: '#FFFFFF',
                                    borderRadius: 20,
                                    padding: 16,
                                    marginBottom: 12,
                                    borderWidth: 1,
                                    borderColor: '#A7F3D0',
                                }}
                            >
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                    <View>
                                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>
                                            #{order.id?.slice(-8).toUpperCase()}
                                        </Text>
                                        <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginTop: 2 }}>
                                            {order.customerName}
                                        </Text>
                                    </View>
                                    <View style={{
                                        backgroundColor: '#ECFDF5',
                                        paddingHorizontal: 10,
                                        paddingVertical: 5,
                                        borderRadius: 99,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 5,
                                    }}>
                                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#059669' }} />
                                        <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Bold', color: '#059669' }}>
                                            Awaiting Confirmation
                                        </Text>
                                    </View>
                                </View>

                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <Image source={images.location} style={{ width: 13, height: 13 }} resizeMode="contain" tintColor="#9CA3AF" />
                                    <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Medium', color: '#6B7280', flex: 1 }} numberOfLines={1}>
                                        {order.address || 'No address'}
                                    </Text>
                                </View>

                                <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Regular', color: '#6B7280', marginBottom: 10 }} numberOfLines={1}>
                                    {order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                </Text>

                                <View style={{
                                    backgroundColor: '#ECFDF5',
                                    borderRadius: 10,
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    borderWidth: 1,
                                    borderColor: '#A7F3D0',
                                }}>
                                    <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#059669' }}>
                                        Waiting for the customer to confirm they received this order.
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}