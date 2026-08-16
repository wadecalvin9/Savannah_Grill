import { router } from 'expo-router'
import { useState } from 'react'
import {
    FlatList,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../../constants'
import { useGlobalContext } from '../../context/GlobalProvider'

const STATUSES = ['All', 'Pending', 'Preparing', 'Ready', 'Out for Delivery', 'Completed', 'Cancelled']

export default function ManageOrders() {
    const { orders, updateOrderStatus } = useGlobalContext()
    const [selectedStatus, setSelectedStatus] = useState('All')

    const filteredOrders = selectedStatus === 'All'
        ? orders
        : orders.filter(o => o.status === selectedStatus)

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return { bg: '#EFF6FF', text: '#3B82F6' }
            case 'Preparing': return { bg: '#FFF7ED', text: '#F97316' }
            case 'Ready': return { bg: '#ECFDF5', text: '#10B981' }
            case 'Out for Delivery': return { bg: '#F5F3FF', text: '#8B5CF6' }
            case 'Completed': return { bg: '#F0FDF4', text: '#16A34A' }
            case 'Cancelled': return { bg: '#FEF2F2', text: '#EF4444' }
            default: return { bg: '#F3F4F6', text: '#6B7280' }
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 14,
                backgroundColor: '#FFFFFF',
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6',
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity
                        onPress={() => router.canGoBack() ? router.back() : router.replace('/admin')}
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: '#F9FAFB',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                        }}
                    >
                        <Image source={images.arrowBack} style={{ width: 16, height: 16 }} resizeMode="contain" tintColor="#1C1C2E" />
                    </TouchableOpacity>

                    <View>
                        <Text style={{ fontSize: 20, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                            Customer Orders
                        </Text>
                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>
                            {orders.length} total order(s)
                        </Text>
                    </View>
                </View>
            </View>

            {/* Status Filter Tabs */}
            <View style={{ paddingTop: 14, paddingBottom: 10 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
                    {STATUSES.map((status) => {
                        const isSelected = selectedStatus === status
                        const count = status === 'All' ? orders.length : orders.filter(o => o.status === status).length
                        return (
                            <TouchableOpacity
                                key={status}
                                onPress={() => setSelectedStatus(status)}
                                style={{
                                    paddingHorizontal: 16,
                                    paddingVertical: 8,
                                    borderRadius: 99,
                                    backgroundColor: isSelected ? '#FE8C00' : '#FFFFFF',
                                    borderWidth: 1,
                                    borderColor: isSelected ? '#FE8C00' : '#E5E7EB',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: isSelected ? '#FFF' : '#6B7280' }}>
                                    {status}
                                </Text>
                                <View style={{
                                    backgroundColor: isSelected ? '#FFFFFF30' : '#F3F4F6',
                                    paddingHorizontal: 6,
                                    paddingVertical: 1,
                                    borderRadius: 99,
                                }}>
                                    <Text style={{ fontSize: 10, fontFamily: 'QuickSand-Bold', color: isSelected ? '#FFF' : '#6B7280' }}>
                                        {count}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })}
                </ScrollView>
            </View>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
                    <Image source={images.emptyState} style={{ width: 140, height: 140 }} resizeMode="contain" />
                    <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#9CA3AF', marginTop: 16 }}>
                        No orders in this status
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredOrders}
                    keyExtractor={(o) => o.id}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 4 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item: order }) => {
                        const style = getStatusColor(order.status)
                        return (
                            <View style={{
                                backgroundColor: '#FFFFFF',
                                borderRadius: 20,
                                padding: 16,
                                marginBottom: 14,
                                borderWidth: 1,
                                borderColor: '#F3F4F6',
                                shadowColor: '#000',
                                shadowOpacity: 0.03,
                                shadowRadius: 8,
                                elevation: 2,
                            }}>
                                {/* Order Top Bar */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <View>
                                        <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                                            {order.id}
                                        </Text>
                                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', marginTop: 1 }}>
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.customerName}
                                        </Text>
                                    </View>

                                    <View style={{
                                        backgroundColor: style.bg,
                                        paddingHorizontal: 12,
                                        paddingVertical: 5,
                                        borderRadius: 99,
                                    }}>
                                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: style.text }}>
                                            {order.status}
                                        </Text>
                                    </View>
                                </View>

                                {/* Delivery Address & Note */}
                                <View style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: 10, marginBottom: 12 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                        <Image source={images.location} style={{ width: 11, height: 11 }} resizeMode="contain" tintColor="#6B7280" />
                                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', flex: 1 }}>
                                            {order.address}
                                        </Text>
                                    </View>
                                    {order.note ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 }}>
                                            <Image source={images.pencil} style={{ width: 10, height: 10, marginTop: 2 }} resizeMode="contain" tintColor="#9CA3AF" />
                                            <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Medium', color: '#6B7280', flex: 1 }}>
                                                {order.note}
                                            </Text>
                                        </View>
                                    ) : null}
                                    {order.rider_name ? (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                            <Image source={images.person} style={{ width: 10, height: 10 }} resizeMode="contain" tintColor="#FE8C00" />
                                            <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>
                                                Rider: {order.rider_name}
                                            </Text>
                                        </View>
                                    ) : null}
                                </View>

                                {/* Items List */}
                                <View style={{ borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10, marginBottom: 12, gap: 6 }}>
                                    {order.items.map((it, idx) => (
                                        <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Medium', color: '#1C1C2E' }}>
                                                {it.quantity}x {it.name}
                                            </Text>
                                            <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#6B7280' }}>
                                                KES {((it.price ?? 0) * it.quantity).toLocaleString()}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Total Price */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                    <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>Total Amount</Text>
                                    <Text style={{ fontSize: 18, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>
                                        KES {order.totalPrice.toLocaleString()}
                                    </Text>
                                </View>

                                {/* Quick Action Buttons */}
                                <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                                    Update Status:
                                </Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                    {order.status !== 'Preparing' && (
                                        <TouchableOpacity
                                            onPress={() => updateOrderStatus(order.id, 'Preparing')}
                                            style={{ backgroundColor: '#FFF7ED', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: '#FFEDD5', flexDirection: 'row', alignItems: 'center', gap: 6 }}
                                        >
                                            <Image source={images.pencil} style={{ width: 10, height: 10 }} resizeMode="contain" tintColor="#F97316" />
                                            <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Bold', color: '#F97316' }}>Preparing</Text>
                                        </TouchableOpacity>
                                    )}

                                    {order.status !== 'Ready' && (
                                        <TouchableOpacity
                                            onPress={() => updateOrderStatus(order.id, 'Ready')}
                                            style={{ backgroundColor: '#ECFDF5', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: '#A7F3D0', flexDirection: 'row', alignItems: 'center', gap: 6 }}
                                        >
                                            <Image source={images.check} style={{ width: 10, height: 10 }} resizeMode="contain" tintColor="#10B981" />
                                            <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Bold', color: '#10B981' }}>Ready</Text>
                                        </TouchableOpacity>
                                    )}

                                    {order.status !== 'Out for Delivery' && order.status !== 'Completed' && order.status !== 'Cancelled' && (
                                        <TouchableOpacity
                                            onPress={() => updateOrderStatus(order.id, 'Out for Delivery')}
                                            style={{ backgroundColor: '#FFF7ED', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: '#FED7AA', flexDirection: 'row', alignItems: 'center', gap: 6 }}
                                        >
                                            <Image source={images.location} style={{ width: 10, height: 10 }} resizeMode="contain" tintColor="#F97316" />
                                            <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Bold', color: '#F97316' }}>Out for Delivery</Text>
                                        </TouchableOpacity>
                                    )}

                                    {order.status !== 'Completed' && (
                                        <TouchableOpacity
                                            onPress={() => updateOrderStatus(order.id, 'Completed')}
                                            style={{ backgroundColor: '#F0FDF4', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: '#BBF7D0', flexDirection: 'row', alignItems: 'center', gap: 6 }}
                                        >
                                            <Image source={images.check} style={{ width: 10, height: 10 }} resizeMode="contain" tintColor="#16A34A" />
                                            <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Bold', color: '#16A34A' }}>Complete</Text>
                                        </TouchableOpacity>
                                    )}

                                    {order.status !== 'Cancelled' && (
                                        <TouchableOpacity
                                            onPress={() => updateOrderStatus(order.id, 'Cancelled')}
                                            style={{ backgroundColor: '#FEF2F2', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, borderWidth: 1, borderColor: '#FCA5A5', flexDirection: 'row', alignItems: 'center', gap: 6 }}
                                        >
                                            <Image source={images.trash} style={{ width: 10, height: 10 }} resizeMode="contain" tintColor="#EF4444" />
                                            <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Bold', color: '#EF4444' }}>Cancel</Text>
                                        </TouchableOpacity>
                                    )}
                                </ScrollView>
                            </View>
                        )
                    }}
                />
            )}
        </SafeAreaView>
    )
}
