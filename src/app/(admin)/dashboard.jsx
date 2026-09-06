import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../../constants'
import { getMenu } from '../../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'

const StatCard = ({ title, value, color = '#FE8C00', icon }) => (
    <View style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 14,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    }}>
        <View style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: `${color}15`,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
        }}>
            <Image source={icon} style={{ width: 16, height: 16 }} resizeMode="contain" tintColor={color} />
        </View>
        <Text style={{ fontSize: 18, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>{value}</Text>
        <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', marginTop: 2 }}>{title}</Text>
    </View>
)

const ActionCard = ({ title, description, icon, color = '#FE8C00', onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 16,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#F3F4F6',
            shadowColor: '#000',
            shadowOpacity: 0.03,
            shadowRadius: 8,
            elevation: 2,
        }}
    >
        <View style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            backgroundColor: `${color}15`,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
        }}>
            <Image source={icon} style={{ width: 22, height: 22 }} resizeMode="contain" tintColor={color} />
        </View>

        <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>{title}</Text>
            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Regular', color: '#9CA3AF', marginTop: 2 }}>{description}</Text>
        </View>

        <Image source={images.arrowRight} style={{ width: 14, height: 14 }} resizeMode="contain" tintColor="#D1D5DB" />
    </TouchableOpacity>
)

export default function AdminDashboard() {
    const { orders } = useGlobalContext()
    const [productsCount, setProductsCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                const items = await getMenu()
                setProductsCount(items?.length || 0)
            } catch (e) {
                console.error(e)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [])

    const activeOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing')
    const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalPrice : 0), 0)

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
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
                            onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
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
                                Admin Panel
                            </Text>
                            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>
                                Savannah Grill Management
                            </Text>
                        </View>
                    </View>

                    <View style={{
                        backgroundColor: '#FE8C0015',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 99,
                    }}>
                        <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>
                            ADMIN
                        </Text>
                    </View>
                </View>

                {/* Dashboard Metrics */}
                <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
                    <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginLeft: 4 }}>
                        Overview Stats
                    </Text>

                    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                        <StatCard
                            title="Total Products"
                            value={isLoading ? '...' : productsCount.toString()}
                            icon={images.bag}
                            color="#FE8C00"
                        />
                        <StatCard
                            title="Active Orders"
                            value={activeOrders.length.toString()}
                            icon={images.clock}
                            color="#F97316"
                        />
                    </View>

                    <View style={{ flexDirection: 'row' }}>
                        <StatCard
                            title="Total Orders"
                            value={orders.length.toString()}
                            icon={images.check}
                            color="#3B82F6"
                        />
                        <StatCard
                            title="Total Revenue"
                            value={`KES ${totalRevenue.toLocaleString()}`}
                            icon={images.dollar}
                            color="#10B981"
                        />
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
                    <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                        Quick Actions
                    </Text>

                    <ActionCard
                        title="Add New Product"
                        description="Add new menu item with pricing & image"
                        icon={images.plus}
                        color="#FE8C00"
                        onPress={() => router.push('/(admin)/add-product')}
                    />

                    <ActionCard
                        title="Manage Products"
                        description="Edit prices, update details, or delete items"
                        icon={images.pencil}
                        color="#3B82F6"
                        onPress={() => router.push('/(admin)/products')}
                    />

                    <ActionCard
                        title="Manage Orders"
                        description="View live orders and update fulfillment status"
                        icon={images.clock}
                        color="#10B981"
                        onPress={() => router.push('/(admin)/orders')}
                    />

                    <ActionCard
                        title="Manage Users"
                        description="Promote users to riders or admin roles"
                        icon={images.person}
                        color="#8B5CF6"
                        onPress={() => router.push('/(admin)/users')}
                    />
                </View>

                {/* Recent Orders Preview */}
                <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                            Recent Orders
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/admin/orders')}>
                            <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>
                                View All ({orders.length})
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {orders.slice(0, 3).map((order) => (
                        <View key={order.id} style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 16,
                            padding: 14,
                            marginBottom: 10,
                            borderWidth: 1,
                            borderColor: '#F3F4F6',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                            <View>
                                <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                                    {order.id} · {order.customerName}
                                </Text>
                                <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', marginTop: 2 }}>
                                    {order.items.length} item(s) • KES {order.totalPrice.toLocaleString()}
                                </Text>
                            </View>

                            <View style={{
                                backgroundColor:
                                    order.status === 'Completed' ? '#ECFDF5' :
                                    order.status === 'Preparing' ? '#FFF7ED' :
                                    order.status === 'Cancelled' ? '#FEF2F2' : '#EFF6FF',
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: 99,
                            }}>
                                <Text style={{
                                    fontSize: 11,
                                    fontFamily: 'QuickSand-Bold',
                                    color:
                                        order.status === 'Completed' ? '#10B981' :
                                        order.status === 'Preparing' ? '#F97316' :
                                        order.status === 'Cancelled' ? '#EF4444' : '#3B82F6',
                                }}>
                                    {order.status}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
