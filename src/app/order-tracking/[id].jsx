import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useRef } from 'react'
import {
    Animated,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../../constants'
import { useGlobalContext } from '../../context/GlobalProvider'
import RiderMapView from '../../../components/RiderMapView'

const STAGES = [
    { key: 'Pending', label: 'Order Placed', desc: 'We received your order', icon: images.pencil },
    { key: 'Preparing', label: 'Preparing', desc: 'Kitchen is cooking your meal', icon: images.bag },
    { key: 'Ready', label: 'Ready for Pickup', desc: 'Your meal is ready', icon: images.check },
    { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'Rider is on the way to you', icon: images.location },
    { key: 'Completed', label: 'Delivered!', desc: 'Enjoy your meal!', icon: images.star },
]

const STATUS_ORDER = STAGES.map(s => s.key)
const getStageIndex = (status) => {
    const idx = STATUS_ORDER.indexOf(status)
    return idx === -1 ? 0 : idx
}

export default function OrderTracking() {
    const { id } = useLocalSearchParams()
    const { myOrders, orders } = useGlobalContext()
    const order = [...myOrders, ...orders].find(o => o.id === id || o.$id === id)
    const pulseAnim = useRef(new Animated.Value(1)).current

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.25, duration: 700, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            ])
        )
        pulse.start()
        return () => pulse.stop()
    }, [])

    if (!order) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA', alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
                <Image source={images.emptyState} style={{ width: 140, height: 140 }} resizeMode="contain" />
                <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#9CA3AF', marginTop: 16 }}>Order not found</Text>
                <TouchableOpacity
                    onPress={() => (router.canGoBack() ? router.back() : router.replace('/orders'))}
                    style={{ marginTop: 20, backgroundColor: '#FE8C00', borderRadius: 99, paddingHorizontal: 24, paddingVertical: 12 }}
                >
                    <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#FFF' }}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }

    const currentIndex = getStageIndex(order.status)
    const isCancelled = order.status === 'Cancelled'

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 14,
                backgroundColor: '#FFFFFF',
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6',
            }}>
                <TouchableOpacity
                    onPress={() => (router.canGoBack() ? router.back() : router.replace('/orders'))}
                    style={{
                        width: 36, height: 36, borderRadius: 18,
                        backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center',
                        borderWidth: 1, borderColor: '#E5E7EB',
                    }}
                >
                    <Image source={images.arrowBack} style={{ width: 16, height: 16 }} resizeMode="contain" tintColor="#1C1C2E" />
                </TouchableOpacity>
                <View>
                    <Text style={{ fontSize: 18, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>Live Order Tracking</Text>
                    <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>
                        #{(order.id || order.$id || '').slice(-8).toUpperCase()}
                    </Text>
                </View>
            </View>
            <ScrollView contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }} showsVerticalScrollIndicator={false}>
                {isCancelled ? (
                    <View style={{
                        marginHorizontal: 20, marginBottom: 20,
                        backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16,
                        borderWidth: 1, borderColor: '#FCA5A5',
                        flexDirection: 'row', alignItems: 'center', gap: 10,
                    }}>
                        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={images.trash} style={{ width: 18, height: 18 }} resizeMode="contain" tintColor="#EF4444" />
                        </View>
                        <View>
                            <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#EF4444' }}>Order Cancelled</Text>
                            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Regular', color: '#EF4444' }}>This order has been cancelled.</Text>
                        </View>
                    </View>
                ) : (
                    <View style={{ marginHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 16 }}>
                        <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginBottom: 20 }}>Order Status</Text>
                        {STAGES.map((stage, idx) => {
                            const isDone = idx < currentIndex
                            const isCurrent = idx === currentIndex
                            const isFuture = idx > currentIndex
                            return (
                                <View key={stage.key} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                    <View style={{ alignItems: 'center', width: 40 }}>
                                        {isCurrent ? (
                                            <Animated.View style={{
                                                width: 36, height: 36, borderRadius: 18, backgroundColor: '#FE8C00',
                                                alignItems: 'center', justifyContent: 'center',
                                                transform: [{ scale: pulseAnim }],
                                                shadowColor: '#FE8C00', shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
                                            }}>
                                                <Image source={stage.icon} style={{ width: 16, height: 16 }} resizeMode="contain" tintColor="#FFF" />
                                            </Animated.View>
                                        ) : isDone ? (
                                            <View style={{
                                                width: 36, height: 36, borderRadius: 18, backgroundColor: '#ECFDF5',
                                                alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#10B981',
                                            }}>
                                                <Image source={images.check} style={{ width: 14, height: 14 }} resizeMode="contain" tintColor="#10B981" />
                                            </View>
                                        ) : (
                                            <View style={{
                                                width: 36, height: 36, borderRadius: 18, backgroundColor: '#F9FAFB',
                                                alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#E5E7EB',
                                            }}>
                                                <Image source={stage.icon} style={{ width: 14, height: 14 }} resizeMode="contain" tintColor="#D1D5DB" />
                                            </View>
                                        )}
                                        {idx < STAGES.length - 1 && (
                                            <View style={{ width: 2, height: 44, backgroundColor: isDone ? '#10B981' : '#E5E7EB', marginTop: 2 }} />
                                        )}
                                    </View>
                                    <View style={{ flex: 1, paddingLeft: 14, paddingBottom: idx < STAGES.length - 1 ? 28 : 0, paddingTop: 6 }}>
                                        <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: isCurrent ? '#FE8C00' : isDone ? '#10B981' : '#9CA3AF' }}>
                                            {stage.label}
                                        </Text>
                                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Regular', color: isFuture ? '#D1D5DB' : '#6B7280', marginTop: 2 }}>
                                            {stage.desc}
                                        </Text>
                                    </View>
                                </View>
                            )
                        })}
                    </View>
                )}

                {order.riderName && !isCancelled && (
                    <View style={{
                        marginHorizontal: 20, backgroundColor: '#FFF7ED', borderRadius: 20, padding: 16, marginBottom: 16,
                        borderWidth: 1, borderColor: '#FED7AA', flexDirection: 'row', alignItems: 'center', gap: 12,
                    }}>
                        <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: '#FE8C0020', alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={images.location} style={{ width: 22, height: 22 }} resizeMode="contain" tintColor="#FE8C00" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#FE8C00' }}>Your Rider</Text>
                            <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>{order.riderName}</Text>
                        </View>
                    </View>
                )}

                {!isCancelled && (order.status === 'Out for Delivery' || order.riderName) && (
                    <View style={{ marginHorizontal: 20, marginBottom: 16 }}>
                        <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginBottom: 10 }}>Live GPS Map Tracking</Text>
                        <RiderMapView
                            riderLat={order.riderLat}
                            riderLng={order.riderLng}
                            destinationName={order.address}
                            height={250}
                        />
                    </View>
                )}

                <View style={{ marginHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#F3F4F6' }}>
                    <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginBottom: 12 }}>Order Summary</Text>
                    {order.items.map((it, idx) => (
                        <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Medium', color: '#6B7280' }}>{it.quantity}x {it.name}</Text>
                            <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>KES {((it.price ?? 0) * it.quantity).toLocaleString()}</Text>
                        </View>
                    ))}
                    <View style={{ height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>Total</Text>
                        <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>KES {order.totalPrice.toLocaleString()}</Text>
                    </View>
                    {order.address ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                            <Image source={images.location} style={{ width: 14, height: 14 }} resizeMode="contain" tintColor="#9CA3AF" />
                            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', flex: 1 }}>{order.address}</Text>
                        </View>
                    ) : null}
                </View>

                <TouchableOpacity
                    onPress={() => router.push('/orders')}
                    style={{ marginHorizontal: 20, marginTop: 16, paddingVertical: 14, alignItems: 'center' }}
                >
                    <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#9CA3AF' }}>← Back to My Orders</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}