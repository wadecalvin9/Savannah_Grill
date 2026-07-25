import { useState } from 'react'
import {
    FlatList,
    Image,
    RefreshControl,
    Text,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../../constants'
import { useGlobalContext } from '../../context/GlobalProvider'

export default function RiderHistory() {
    const { riderHistory, fetchRiderData } = useGlobalContext()
    const [refreshing, setRefreshing] = useState(false)

    const completed = riderHistory.filter(o => o.status === 'Completed')
    const totalEarned = completed.reduce((sum, o) => sum + (o.totalPrice || 0), 0)

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchRiderData()
        setRefreshing(false)
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
            {/* Header */}
            <View style={{
                paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
                backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
            }}>
                <Text style={{ fontSize: 22, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>Delivery History</Text>
                <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', marginTop: 2 }}>
                    {completed.length} completed deliveries
                </Text>
            </View>

            {/* Stats */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 14, gap: 10 }}>
                <View style={{
                    flex: 1, backgroundColor: '#F5F3FF', borderRadius: 16, padding: 14,
                    borderWidth: 1, borderColor: '#DDD6FE',
                }}>
                    <Text style={{ fontSize: 22, fontFamily: 'QuickSand-Bold', color: '#8B5CF6' }}>{completed.length}</Text>
                    <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Medium', color: '#7C3AED', marginTop: 2 }}>Total Deliveries</Text>
                </View>
                <View style={{
                    flex: 1, backgroundColor: '#ECFDF5', borderRadius: 16, padding: 14,
                    borderWidth: 1, borderColor: '#A7F3D0',
                }}>
                    <Text style={{ fontSize: 18, fontFamily: 'QuickSand-Bold', color: '#10B981' }}>
                        KES {totalEarned.toLocaleString()}
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Medium', color: '#059669', marginTop: 2 }}>Total Value Delivered</Text>
                </View>
            </View>

            {completed.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
                    <Image source={images.emptyState} style={{ width: 140, height: 140 }} resizeMode="contain" />
                    <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#9CA3AF', marginTop: 16, textAlign: 'center' }}>
                        No deliveries yet
                    </Text>
                    <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Regular', color: '#9CA3AF', textAlign: 'center', marginTop: 6 }}>
                        Complete your first delivery to see it here
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={completed}
                    keyExtractor={o => o.id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 140 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#8B5CF6" />}
                    renderItem={({ item: order }) => (
                        <View style={{
                            backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
                            marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6',
                            shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
                        }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <View>
                                    <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>
                                        {new Date(order.createdAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </Text>
                                    <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginTop: 2 }}>
                                        {order.customerName}
                                    </Text>
                                </View>
                                <View style={{ backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 }}>
                                    <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Bold', color: '#16A34A' }}>✓ Delivered</Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                <Image source={images.location} style={{ width: 12, height: 12 }} resizeMode="contain" tintColor="#9CA3AF" />
                                <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', flex: 1 }} numberOfLines={1}>
                                    {order.address}
                                </Text>
                            </View>

                            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Regular', color: '#6B7280', marginBottom: 6 }} numberOfLines={1}>
                                {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                            </Text>

                            <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>
                                KES {order.totalPrice.toLocaleString()}
                            </Text>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    )
}
