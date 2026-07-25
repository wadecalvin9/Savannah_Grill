import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
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

const STAGES = [
    { key: 'Pending', label: 'Order Placed', emoji: '📋', desc: 'We received your order' },
    { key: 'Preparing', label: 'Preparing', emoji: '👨‍🍳', desc: 'Kitchen is cooking your meal' },
    { key: 'Ready', label: 'Ready for Pickup', emoji: '✅', desc: 'Your meal is ready' },
    { key: 'Out for Delivery', label: 'Out for Delivery', emoji: '🛵', desc: 'Rider is on the way to you' },
    { key: 'Completed', label: 'Delivered!', emoji: '🎉', desc: 'Enjoy your meal!' },
]

const STATUS_ORDER = STAGES.map(s => s.key)

const getStageIndex = (status) => {
    const idx = STATUS_ORDER.indexOf(status)
    return idx === -1 ? 0 : idx
}

export default function OrderTracking() {
    const { id } = useLocalSearchParams()
    const { myOrders, orders } = useGlobalContext()

    // Find order from either myOrders or orders (admin view)
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
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20, backgroundColor: '#FE8C00', borderRadius: 99, paddingHorizontal: 24, paddingVertical: 12 }}>
                    <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#FFF' }}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }

    const currentIndex = getStageIndex(order.status)
    const isCancelled = order.status === 'Cancelled'

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
            {/* Header */}
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
                    onPress={() => router.back()}
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
                        #{order.id?.slice(-8).toUpperCase()}
                    </Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }} showsVerticalScrollIndicator={false}>
                {/* Cancelled banner */}
                {isCancelled && (
                    <View style={{
                        marginHorizontal: 20, marginBottom: 20,
                        backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16,
                        borderWidth: 1, borderColor: '#FCA5A5',
                        flexDirection: 'row', alignItems: 'center', gap: 10,
                    }}>
                        <Text style={{ fontSize: 24 }}>❌</Text>
                        <View>
                            <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#EF4444' }}>Order Cancelled</Text>
                            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Regular', color: '#EF4444' }}>This order has been cancelled.</Text>
                        </View>
                    </View>
                )}

                {/* Timeline */}
                {!isCancelled && (
                    <View style={{ marginHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 16 }}>
                        <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginBottom: 20 }}>
                            Order Status
                        </Text>

                        {STAGES.map((stage, idx) => {
                            const isDone = idx < currentIndex
                            const isCurrent = idx === currentIndex
                            const isFuture = idx > currentIndex

                            return (
                                <View key={stage.key} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: idx < STAGES.length - 1 ? 0 : 0 }}>
                                    {/* Line + Circle column */}
                                    <View style={{ alignItems: 'center', width: 40 }}>
                                        {/* Circle */}
                                        {isCurrent ? (
                                            <Animated.View style={{
                                                width: 36, height: 36, borderRadius: 18,
                                                backgroundColor: '#FE8C00',
                                                alignItems: 'center', justifyContent: 'center',
                                                transform: [{ scale: pulseAnim }],
                                                shadowColor: '#FE8C00',
                                                shadowOpacity: 0.4,
                                                shadowRadius: 8,
                                                elevation: 4,
                                            }}>
                                                <Text style={{ fontSize: 16 }}>{stage.emoji}</Text>
                                            </Animated.View>
                                        ) : isDone ? (
                                            <View style={{
                                                width: 36, height: 36, borderRadius: 18,
                                                backgroundColor: '#ECFDF5',
                                                alignItems: 'center', justifyContent: 'center',
                                                borderWidth: 2, borderColor: '#10B981',
                                            }}>
                                                <Text style={{ fontSize: 14 }}>✓</Text>
                                            </View>
                                        ) : (
                                            <View style={{
                                                width: 36, height: 36, borderRadius: 18,
                                                backgroundColor: '#F9FAFB',
                                                alignItems: 'center', justifyContent: 'center',
                                                borderWidth: 2, borderColor: '#E5E7EB',
                                            }}>
                                                <Text style={{ fontSize: 14, color: '#D1D5DB' }}>{stage.emoji}</Text>
                                            </View>
                                        )}

                                        {/* Connector line */}
                                        {idx < STAGES.length - 1 && (
                                            <View style={{
                                                width: 2,
                                                height: 44,
                                                backgroundColor: isDone ? '#10B981' : '#E5E7EB',
                                                marginTop: 2,
                                            }} />
                                        )}
                                    </View>

                                    {/* Text */}
                                    <View style={{ flex: 1, paddingLeft: 14, paddingBottom: idx < STAGES.length - 1 ? 28 : 0, paddingTop: 6 }}>
                                        <Text style={{
                                            fontSize: 14,
                                            fontFamily: 'QuickSand-Bold',
                                            color: isCurrent ? '#FE8C00' : isDone ? '#10B981' : '#9CA3AF',
                                        }}>
                                            {stage.label}
                                        </Text>
                                        <Text style={{
                                            fontSize: 12,
                                            fontFamily: 'QuickSand-Regular',
                                            color: isFuture ? '#D1D5DB' : '#6B7280',
                                            marginTop: 2,
                                        }}>
                                            {stage.desc}
                                        </Text>
                                    </View>
                                </View>
                            )
                        })}
                    </View>
                )}

                {/* Rider Info (if assigned) */}
                {order.riderName && !isCancelled && (
                    <View style={{
                        marginHorizontal: 20,
                        backgroundColor: '#F5F3FF',
                        borderRadius: 20,
                        padding: 16,
                        marginBottom: 16,
                        borderWidth: 1,
                        borderColor: '#DDD6FE',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                    }}>
                        <View style={{
                            width: 46, height: 46, borderRadius: 23,
                            backgroundColor: '#8B5CF620',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Text style={{ fontSize: 24 }}>🛵</Text>
                        </View>
                        <View>
                            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#8B5CF6' }}>Your Rider</Text>
                            <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>{order.riderName}</Text>
                        </View>
                    </View>
                )}

                {/* Order Summary */}
                <View style={{
                    marginHorizontal: 20,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: '#F3F4F6',
                }}>
                    <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginBottom: 12 }}>Order Summary</Text>

                    {order.items.map((it, idx) => (
                        <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Medium', color: '#6B7280' }}>
                                {it.quantity}x {it.name}
                            </Text>
                            <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                                KES {((it.price ?? 0) * it.quantity).toLocaleString()}
                            </Text>
                        </View>
                    ))}

                    <View style={{ height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 }} />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>Total</Text>
                        <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>
                            KES {order.totalPrice.toLocaleString()}
                        </Text>
                    </View>

                    {order.address ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                            <Image source={images.location} style={{ width: 14, height: 14 }} resizeMode="contain" tintColor="#9CA3AF" />
                            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', flex: 1 }}>{order.address}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Back to orders */}
                <TouchableOpacity
                    onPress={() => router.push('/orders')}
                    style={{ marginHorizontal: 20, marginTop: 16, paddingVertical: 14, alignItems: 'center' }}
                >
                    <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#9CA3AF' }}>
                        ← Back to My Orders
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}
