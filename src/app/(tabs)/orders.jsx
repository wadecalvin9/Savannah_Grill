import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import {
    Alert,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../../constants'
import { useGlobalContext } from '../../context/GlobalProvider'

const FILTERS = ['All', 'Active', 'Completed', 'Cancelled']

const getStatusStyle = (status) => {
    switch (status) {
        case 'Pending': return { bg: '#EFF6FF', text: '#3B82F6', dot: '#3B82F6' }
        case 'Preparing': return { bg: '#FFF7ED', text: '#F97316', dot: '#F97316' }
        case 'Ready': return { bg: '#ECFDF5', text: '#10B981', dot: '#10B981' }
        case 'Out for Delivery': return { bg: '#F5F3FF', text: '#8B5CF6', dot: '#8B5CF6' }
        case 'Delivered': return { bg: '#ECFDF5', text: '#059669', dot: '#059669' }   // new
        case 'Completed': return { bg: '#F0FDF4', text: '#16A34A', dot: '#16A34A' }
        case 'Cancelled': return { bg: '#FEF2F2', text: '#EF4444', dot: '#EF4444' }
        default: return { bg: '#F3F4F6', text: '#6B7280', dot: '#6B7280' }
    }
}

// Delivered is still considered active until the customer confirms
const isActive = (status) => !['Completed', 'Cancelled'].includes(status)
const canCancel = (status) => status === 'Pending' || status === 'Preparing'

export default function Orders() {
    const { myOrders, fetchMyOrders, updateOrderStatus } = useGlobalContext()
    const [filter, setFilter] = useState('All')
    const [refreshing, setRefreshing] = useState(false)
    const [confirmingId, setConfirmingId] = useState(null)

    useEffect(() => {
        fetchMyOrders()
    }, [])

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchMyOrders()
        setRefreshing(false)
    }

    const handleConfirmReceived = (order) => {
        Alert.alert(
            'Confirm Receipt',
            'Have you received this order?',
            [
                { text: 'Not yet', style: 'cancel' },
                {
                    text: 'Yes, Received',
                    onPress: async () => {
                        setConfirmingId(order.id)
                        try {
                            await updateOrderStatus(order.id, 'Completed')
                            await fetchMyOrders()
                        } catch (e) {
                            Alert.alert('Error', 'Could not confirm. Please try again.')
                        } finally {
                            setConfirmingId(null)
                        }
                    },
                },
            ]
        )
    }

    const filtered = myOrders.filter(o => {
        if (filter === 'All') return true
        if (filter === 'Active') return isActive(o.status)
        if (filter === 'Completed') return o.status === 'Completed'
        if (filter === 'Cancelled') return o.status === 'Cancelled'
        return true
    })

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
            {/* Header */}
            <View style={{
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 12,
                backgroundColor: '#FFFFFF',
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6',
            }}>
                <Text style={{ fontSize: 24, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                    My Orders
                </Text>
                <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', marginTop: 2 }}>
                    {myOrders.length} total order{myOrders.length !== 1 ? 's' : ''}
                </Text>
            </View>

            {/* Filter chips */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 8 }}>
                {FILTERS.map(f => {
                    const active = filter === f
                    return (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setFilter(f)}
                            style={{
                                paddingHorizontal: 16,
                                paddingVertical: 7,
                                borderRadius: 99,
                                backgroundColor: active ? '#FE8C00' : '#FFFFFF',
                                borderWidth: 1,
                                borderColor: active ? '#FE8C00' : '#E5E7EB',
                            }}
                        >
                            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: active ? '#FFF' : '#6B7280' }}>
                                {f}
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </View>

            {filtered.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
                    <Image source={images.emptyState} style={{ width: 160, height: 160 }} resizeMode="contain" />
                    <Text style={{ fontSize: 18, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginTop: 16 }}>
                        No orders here
                    </Text>
                    <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Regular', color: '#9CA3AF', textAlign: 'center', marginTop: 6 }}>
                        {filter === 'All' ? "You haven't placed any orders yet." : `No ${filter.toLowerCase()} orders found.`}
                    </Text>
                    {filter === 'All' && (
                        <TouchableOpacity
                            onPress={() => router.push('/search')}
                            style={{
                                marginTop: 20,
                                backgroundColor: '#FE8C00',
                                borderRadius: 99,
                                paddingHorizontal: 28,
                                paddingVertical: 14,
                            }}
                        >
                            <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#FFF' }}>
                                Explore Menu
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={o => o.id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 140, paddingTop: 4 }}
                    showsVerticalScrollIndicator={false}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                    renderItem={({ item: order }) => {
                        const style = getStatusStyle(order.status)
                        const active = isActive(order.status)

                        return (
                            <View style={{
                                backgroundColor: '#FFFFFF',
                                borderRadius: 20,
                                padding: 16,
                                marginBottom: 12,
                                borderWidth: 1,
                                borderColor: '#F3F4F6',
                                shadowColor: '#000',
                                shadowOpacity: 0.04,
                                shadowRadius: 8,
                                elevation: 2,
                            }}>
                                {/* Top row */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <View>
                                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>
                                            {new Date(order.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </Text>
                                        <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginTop: 2 }}>
                                            {order.items.length} item{order.items.length !== 1 ? 's' : ''} • KES {order.totalPrice.toLocaleString()}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: style.bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99, gap: 5 }}>
                                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: style.dot }} />
                                        <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Bold', color: style.text }}>
                                            {order.status}
                                        </Text>
                                    </View>
                                </View>

                                {/* Items summary */}
                                <Text numberOfLines={1} style={{ fontSize: 13, fontFamily: 'QuickSand-Regular', color: '#6B7280', marginBottom: 10 }}>
                                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                </Text>

                                {/* Delivery address */}
                                {order.address ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                                        <Image source={images.location} style={{ width: 12, height: 12 }} resizeMode="contain" tintColor="#9CA3AF" />
                                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', flex: 1 }} numberOfLines={1}>
                                            {order.address}
                                        </Text>
                                    </View>
                                ) : null}

                                {/* Rider info */}
                                {order.riderName && order.status === 'Out for Delivery' ? (
                                    <View style={{ backgroundColor: '#FFF7ED', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Image source={images.location} style={{ width: 13, height: 13 }} resizeMode="contain" tintColor="#FE8C00" />
                                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#F97316' }}>
                                            {order.riderName} is on the way
                                        </Text>
                                    </View>
                                ) : null}

                                {/* Waiting for customer confirmation */}
                                {order.status === 'Delivered' && (
                                    <View style={{
                                        backgroundColor: '#ECFDF5',
                                        borderRadius: 10,
                                        paddingHorizontal: 12,
                                        paddingVertical: 8,
                                        marginBottom: 12,
                                        borderWidth: 1,
                                        borderColor: '#A7F3D0',
                                    }}>
                                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#059669' }}>
                                            Rider marked this as delivered. Please confirm you received it.
                                        </Text>
                                    </View>
                                )}

                                {/* Delivery confirmation code */}
                                {order.status === 'Out for Delivery' && order.confirmation_code ? (
                                <View style={{
                                    backgroundColor: '#FEF3C7',
                                    borderRadius: 12,
                                    padding: 14,
                                    marginBottom: 12,
                                    borderWidth: 1,
                                    borderColor: '#FCD34D',
                                }}>
                                    <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#92400E', marginBottom: 4 }}>
                                    Your delivery code
                                    </Text>
                                    <Text style={{ fontSize: 28, fontFamily: 'QuickSand-Bold', color: '#92400E', letterSpacing: 4 }}>
                                    {order.confirmation_code}
                                    </Text>
                                    <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#A16207', marginTop: 4 }}>
                                    Show this code to the rider when they arrive.
                                    </Text>
                                </View>
                                ) : null}

                                {/* Action buttons */}
                                <View style={{ gap: 8 }}>
                                    {/* Track while still in transit */}
                                    {active && order.status !== 'Delivered' && (
                                        <TouchableOpacity
                                            onPress={() => router.push(`/order-tracking/${order.id}`)}
                                            style={{
                                                backgroundColor: '#FE8C00',
                                                borderRadius: 12,
                                                paddingVertical: 11,
                                                alignItems: 'center',
                                                flexDirection: 'row',
                                                justifyContent: 'center',
                                                gap: 8,
                                            }}
                                        >
                                            <Image source={images.location} style={{ width: 14, height: 14 }} resizeMode="contain" tintColor="#FFF" />
                                            <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#FFF' }}>
                                                Track Order
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    {/* Customer confirmation */}
                                    {order.status === 'Delivered' && (
                                        <TouchableOpacity
                                            onPress={() => handleConfirmReceived(order)}
                                            disabled={confirmingId === order.id}
                                            style={{
                                                backgroundColor: '#10B981',
                                                borderRadius: 12,
                                                paddingVertical: 11,
                                                alignItems: 'center',
                                                opacity: confirmingId === order.id ? 0.7 : 1,
                                            }}
                                        >
                                            <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#FFF' }}>
                                                {confirmingId === order.id ? 'Confirming…' : 'Confirm Received'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    {canCancel(order.status) && (
                                        <TouchableOpacity
                                            onPress={() => {
                                                Alert.alert(
                                                    'Cancel Order',
                                                    'Are you sure you want to cancel this order?',
                                                    [
                                                        { text: 'No', style: 'cancel' },
                                                        {
                                                            text: 'Yes, Cancel',
                                                            style: 'destructive',
                                                            onPress: async () => {
                                                                await updateOrderStatus(order.id, 'Cancelled')
                                                                fetchMyOrders()
                                                            },
                                                        },
                                                    ]
                                                )
                                            }}
                                            style={{
                                                backgroundColor: '#FFFFFF',
                                                borderRadius: 12,
                                                paddingVertical: 11,
                                                alignItems: 'center',
                                                borderWidth: 1,
                                                borderColor: '#FECACA',
                                            }}
                                        >
                                            <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#EF4444' }}>
                                                Cancel Order
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        )
                    }}
                />
            )}
        </SafeAreaView>
    )
}