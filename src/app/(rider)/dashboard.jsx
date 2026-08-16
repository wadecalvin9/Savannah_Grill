import { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../../constants'
import { useGlobalContext } from '../../context/GlobalProvider'

const isWeb = Platform.OS === 'web'

export default function RiderDashboard() {
    const { user, riderOrders, activeDelivery, fetchRiderData, acceptRiderDelivery } = useGlobalContext()
    const [refreshing, setRefreshing] = useState(false)
    const [acceptingId, setAcceptingId] = useState(null)

    useEffect(() => {
        fetchRiderData()
    }, [])

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchRiderData()
        setRefreshing(false)
    }

    const handleAccept = async (order) => {
        if (activeDelivery) {
            Alert.alert('Already on a Delivery', 'Complete your current delivery before accepting a new one.')
            return
        }
        Alert.alert(
            'Accept Delivery?',
            `Deliver to ${order.address || 'the customer'}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Accept',
                    onPress: async () => {
                        setAcceptingId(order.id)
                        try {
                            await acceptRiderDelivery(order)
                        } catch (e) {
                            Alert.alert('Error', 'Could not accept delivery. Try again.')
                        } finally {
                            setAcceptingId(null)
                        }
                    },
                },
            ]
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
                <View style={{
                    maxWidth: isWeb ? 900 : undefined,
                    width: '100%',
                    alignSelf: isWeb ? 'center' : undefined,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <View>
                        <Text style={{ fontSize: 22, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                            Hey, {user?.name?.split(' ')[0]}
                        </Text>
                        <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', marginTop: 2 }}>
                            {riderOrders.length} order{riderOrders.length !== 1 ? 's' : ''} available for pickup
                        </Text>
                    </View>
                    <View style={{
                        backgroundColor: '#FFF7ED', paddingHorizontal: 12, paddingVertical: 6,
                        borderRadius: 99, borderWidth: 1, borderColor: '#FED7AA',
                        flexDirection: 'row', alignItems: 'center', gap: 6,
                    }}>
                        <Image source={images.location} style={{ width: 12, height: 12 }} resizeMode="contain" tintColor="#FE8C00" />
                        <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>RIDER</Text>
                    </View>
                </View>
            </View>

            {/* Active delivery banner */}
            {activeDelivery && (
                <View style={{
                    marginHorizontal: isWeb ? 32 : 16,
                    marginTop: 12,
                    maxWidth: isWeb ? 900 : undefined,
                    alignSelf: isWeb ? 'center' : undefined,
                    width: isWeb ? '100%' : undefined,
                    backgroundColor: '#FFF7ED', borderRadius: 16,
                    padding: 14, borderWidth: 1, borderColor: '#FED7AA',
                    flexDirection: 'row', alignItems: 'center', gap: 10,
                }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#FE8C0020', alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={images.location} style={{ width: 18, height: 18 }} resizeMode="contain" tintColor="#FE8C00" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>Active Delivery in Progress</Text>
                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#F97316' }} numberOfLines={1}>
                            {activeDelivery.address}
                        </Text>
                    </View>
                </View>
            )}

            {riderOrders.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
                    <View style={{
                        width: 96, height: 96, borderRadius: 48,
                        backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 20, borderWidth: 2, borderColor: '#FED7AA',
                    }}>
                        <Image source={images.bag} style={{ width: 44, height: 44 }} resizeMode="contain" tintColor="#FE8C00" />
                    </View>
                    <Text style={{ fontSize: 18, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', textAlign: 'center' }}>
                        No pickups available
                    </Text>
                    <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Regular', color: '#9CA3AF', textAlign: 'center', marginTop: 6 }}>
                        Orders marked Ready will appear here in real-time
                    </Text>
                    <TouchableOpacity
                        onPress={handleRefresh}
                        style={{ marginTop: 20, backgroundColor: '#FE8C00', borderRadius: 99, paddingHorizontal: 24, paddingVertical: 12 }}
                    >
                        <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#FFF' }}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={riderOrders}
                    keyExtractor={o => o.id}
                    contentContainerStyle={{
                        paddingHorizontal: isWeb ? 32 : 16,
                        paddingTop: 14,
                        paddingBottom: isWeb ? 40 : 140,
                        maxWidth: isWeb ? 900 : undefined,
                        width: isWeb ? '100%' : undefined,
                        alignSelf: isWeb ? 'center' : undefined,
                    }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FE8C00" />}
                    renderItem={({ item: order }) => (
                        <View style={{
                            backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
                            marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6',
                            shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
                        }}>
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
                                    flexDirection: 'row', alignItems: 'center', gap: 5,
                                    backgroundColor: order.status === 'Ready' ? '#ECFDF5' : '#FFF7ED',
                                    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99,
                                }}>
                                    <Image
                                        source={order.status === 'Ready' ? images.check : images.location}
                                        style={{ width: 10, height: 10 }}
                                        resizeMode="contain"
                                        tintColor={order.status === 'Ready' ? '#10B981' : '#FE8C00'}
                                    />
                                    <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Bold', color: order.status === 'Ready' ? '#10B981' : '#FE8C00' }}>
                                        {order.status === 'Ready' ? 'Ready' : 'Unassigned'}
                                    </Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                <Image source={images.location} style={{ width: 14, height: 14 }} resizeMode="contain" tintColor="#FE8C00" />
                                <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Medium', color: '#6B7280', flex: 1 }} numberOfLines={1}>
                                    {order.address || 'No address'}
                                </Text>
                            </View>

                            <View style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: 10, marginBottom: 12 }}>
                                {order.items.slice(0, 3).map((it, idx) => (
                                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: idx < Math.min(order.items.length, 3) - 1 ? 4 : 0 }}>
                                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#9CA3AF' }} />
                                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#6B7280' }}>
                                            {it.quantity}x {it.name}
                                        </Text>
                                    </View>
                                ))}
                                {order.items.length > 3 && (
                                    <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', marginTop: 2 }}>
                                        +{order.items.length - 3} more items
                                    </Text>
                                )}
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>
                                    KES {order.totalPrice.toLocaleString()}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => handleAccept(order)}
                                    disabled={acceptingId === order.id}
                                    style={{
                                        backgroundColor: '#FE8C00', borderRadius: 99,
                                        paddingHorizontal: 20, paddingVertical: 10,
                                        flexDirection: 'row', alignItems: 'center', gap: 8,
                                        opacity: acceptingId === order.id ? 0.7 : 1,
                                    }}
                                >
                                    {acceptingId === order.id
                                        ? <ActivityIndicator size="small" color="#FFF" />
                                        : <>
                                            <Image source={images.bag} style={{ width: 14, height: 14 }} resizeMode="contain" tintColor="#FFF" />
                                            <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#FFF' }}>Accept</Text>
                                        </>
                                    }
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    )
}