import cn from 'clsx'
import { Redirect, Slot, Tabs, usePathname, useRouter } from 'expo-router'
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native'
import { images } from '../../../constants'
import { useGlobalContext } from '../../context/GlobalProvider'

const TabBarIcon = ({ focused, title, icon, badge }) => (
    <View className="flex flex-col items-center justify-center h-full w-full">
        <View style={{ position: 'relative' }}>
            <Image source={icon} style={{ width: 24, height: 24 }} resizeMode="contain" tintColor={focused ? '#FE8C00' : '#5D5F6D'} />
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
        <Text style={{ fontSize: 10, fontFamily: 'QuickSand-Bold', marginTop: 3, color: focused ? '#FE8C00' : '#5D5F6D' }}>
            {title}
        </Text>
    </View>
)

// ─── Web top navbar ───────────────────────────────────────────────────────────
function RiderWebNavbar() {
    const pathname = usePathname()
    const router = useRouter()
    const { riderOrders, activeDelivery } = useGlobalContext()

    const links = [
        { label: 'Dashboard', href: '/(rider)/dashboard', icon: images.home, badge: riderOrders?.length || 0 },
        { label: 'Active',    href: '/(rider)/active',    icon: images.location, badge: activeDelivery ? 1 : 0 },
        { label: 'History',   href: '/(rider)/history',   icon: images.clock, badge: 0 },
        { label: 'Profile',   href: '/(rider)/profile',   icon: images.person, badge: 0 },
    ]

    return (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
            borderBottomWidth: 1,
            borderBottomColor: '#F3F4F6',
            paddingHorizontal: 24,
            paddingVertical: 12,
            minHeight: 64,
        }}>
            {/* Left: brand */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Image source={images.logo} style={{ width: 36, height: 36 }} resizeMode="contain" />
                <View>
                    <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                        Savannah Grill
                    </Text>
                    <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Medium', color: '#FE8C00' }}>
                        Rider Portal
                    </Text>
                </View>
            </View>

            {/* Center: nav links */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                {links.map((link) => {
                    const isActive = pathname.includes(link.href.split('/').pop())
                    return (
                        <TouchableOpacity
                            key={link.href}
                            onPress={() => router.push(link.href)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 8,
                                paddingHorizontal: 16,
                                paddingVertical: 10,
                                borderRadius: 99,
                                backgroundColor: isActive ? '#FFF7ED' : 'transparent',
                            }}
                        >
                            <View style={{ position: 'relative' }}>
                                <Image
                                    source={link.icon}
                                    style={{ width: 18, height: 18 }}
                                    resizeMode="contain"
                                    tintColor={isActive ? '#FE8C00' : '#6B7280'}
                                />
                                {link.badge > 0 && (
                                    <View style={{
                                        position: 'absolute', top: -6, right: -8,
                                        backgroundColor: '#EF4444', borderRadius: 99,
                                        minWidth: 16, height: 16,
                                        alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
                                    }}>
                                        <Text style={{ fontSize: 9, fontFamily: 'QuickSand-Bold', color: '#FFF' }}>
                                            {link.badge > 9 ? '9+' : link.badge}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <Text style={{
                                fontSize: 13,
                                fontFamily: isActive ? 'QuickSand-Bold' : 'QuickSand-Medium',
                                color: isActive ? '#FE8C00' : '#6B7280',
                            }}>
                                {link.label}
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </View>

            {/* Right spacer for balance */}
            <View style={{ width: 120 }} />
        </View>
    )
}

export default function RiderLayout() {
    const { isLoggedIn, isLoading, userRole, riderOrders, activeDelivery } = useGlobalContext()

    if (!isLoggedIn && !isLoading) return <Redirect href="/sign-in" />
    if (isLoggedIn && userRole !== 'rider') return <Redirect href="/" />

    // ─── WEB LAYOUT ───────────────────────────────────────────────────────────
    if (Platform.OS === 'web') {
        return (
            <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
                <RiderWebNavbar />
                <View style={{ flex: 1 }}>
                    <Slot />
                </View>
            </View>
        )
    }

    // ─── MOBILE LAYOUT (unchanged) ────────────────────────────────────────────
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