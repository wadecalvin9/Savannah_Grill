import cn from 'clsx'
import { Redirect, Tabs } from 'expo-router'
import { Image, Text, View } from 'react-native'
import { images } from '../../../constants'
import { useGlobalContext } from '../../context/GlobalProvider'

const TabBarIcon = ({ focused, title, icon, badge }) => (
    <View className="flex flex-col items-center justify-center h-full w-full">
        <View style={{ position: 'relative' }}>
            <Image source={icon} style={{ width: 24, height: 24 }} resizeMode="contain" tintColor={focused ? '#8B5CF6' : '#5D5F6D'} />
            {badge > 0 && (
                <View style={{
                    position: 'absolute', top: -4, right: -6,
                    backgroundColor: '#EF4444', borderRadius: 99,
                    minWidth: 14, height: 14,
                    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
                }}>
                    <Text style={{ fontSize: 8, fontFamily: 'QuickSand-Bold', color: '#FFF' }}>{badge > 9 ? '9+' : badge}</Text>
                </View>
            )}
        </View>
        <Text style={{ fontSize: 10, fontFamily: 'QuickSand-Bold', marginTop: 3, color: focused ? '#8B5CF6' : '#5D5F6D' }}>
            {title}
        </Text>
    </View>
)

export default function RiderLayout() {
    const { isLoggedIn, isLoading, userRole, riderOrders, activeDelivery } = useGlobalContext()

    if (!isLoggedIn && !isLoading) return <Redirect href="/sign-in" />
    if (isLoggedIn && userRole !== 'rider') return <Redirect href="/" />

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarItemStyle: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', padding: 0, margin: 0 },
                tabBarIconStyle: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderRadius: 50,
                    height: 70,
                    position: 'absolute',
                    bottom: 30,
                    left: 20,
                    right: 20,
                    paddingTop: 0,
                    paddingBottom: 0,
                    shadowColor: '#1a1a1a',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 5,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon title="Dashboard" icon={images.home} focused={focused} badge={riderOrders.length} />
                    ),
                }}
            />
            <Tabs.Screen
                name="active"
                options={{
                    title: 'Active',
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon title="Active" icon={images.location} focused={focused} badge={activeDelivery ? 1 : 0} />
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon title="History" icon={images.clock} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused }) => (
                        <TabBarIcon title="Profile" icon={images.person} focused={focused} />
                    ),
                }}
            />
        </Tabs>
    )
}
