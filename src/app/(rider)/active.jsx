import { router } from 'expo-router'
import { useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../../constants'
import { useGlobalContext } from '../../context/GlobalProvider'

export default function ActiveDelivery() {
    const { activeDelivery, completeRiderDelivery, fetchRiderData } = useGlobalContext()
    const [completing, setCompleting] = useState(false)

    const handleComplete = () => {
        Alert.alert(
            'Mark as Delivered?',
            'Confirm that you have delivered this order to the customer.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delivered ✓',
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
                <Text style={{ fontSize: 56, marginBottom: 16 }}>🛵</Text>
                <Text style={{ fontSize: 20, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', textAlign: 'center' }}>
                    No active delivery
                </Text>
                <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Regular', color: '#9CA3AF', textAlign: 'center', marginTop: 8 }}>
                    Accept an order from the Dashboard to start delivering.
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/(rider)/dashboard')}
                    style={{ marginTop: 24, backgroundColor: '#8B5CF6', borderRadius: 99, paddingHorizontal: 28, paddingVertical: 14 }}
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
                paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
                backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
            }}>
                <Text style={{ fontSize: 22, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>Active Delivery</Text>
                <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#8B5CF6' }}>
                    #{activeDelivery.id?.slice(-8).toUpperCase()} · Out for Delivery
                </Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
                {/* Delivery Destination */}
                <View style={{
                    backgroundColor: '#F5F3FF', borderRadius: 20, padding: 18,
                    marginBottom: 16, borderWidth: 1, borderColor: '#DDD6FE',
                }}>
                    <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                        📍 Deliver to
                    </Text>
                    <Text style={{ fontSize: 18, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                        {activeDelivery.address || 'No address provided'}
                    </Text>
                    <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Medium', color: '#6B7280', marginTop: 4 }}>
                        Customer: {activeDelivery.customerName}
                    </Text>
                    {activeDelivery.note ? (
                        <View style={{
                            marginTop: 10, padding: 10, backgroundColor: '#FFF',
                            borderRadius: 10, borderWidth: 1, borderColor: '#DDD6FE',
                        }}>
                            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#6B7280' }}>
                                💬 Note: "{activeDelivery.note}"
                            </Text>
                        </View>
                    ) : null}
                </View>

                {/* Order Items */}
                <View style={{
                    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
                    marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6',
                }}>
                    <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginBottom: 12 }}>
                        Order Items
                    </Text>
                    {activeDelivery.items.map((it, idx) => (
                        <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                            <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Medium', color: '#1C1C2E' }}>
                                {it.quantity}x {it.name}
                            </Text>
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

                {/* Confirm Delivery */}
                <TouchableOpacity
                    onPress={handleComplete}
                    disabled={completing}
                    style={{
                        backgroundColor: completing ? '#6D28D9' : '#8B5CF6',
                        borderRadius: 16, paddingVertical: 18,
                        alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'row', gap: 10,
                        shadowColor: '#8B5CF6', shadowOpacity: 0.35, shadowRadius: 10, elevation: 5,
                    }}
                >
                    {completing
                        ? <ActivityIndicator size="small" color="#FFF" />
                        : <>
                            <Text style={{ fontSize: 18 }}>✅</Text>
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
