import cn from 'clsx'
import { usePathname, useRouter } from 'expo-router'
import { Image, Text, View, Pressable } from 'react-native'
import { images } from '../constants'
import { useGlobalContext } from '../src/context/GlobalProvider'

const WebNavbar = () => {
    const { isLoggedIn, user, cartItems } = useGlobalContext()
    const pathname = usePathname()
    const router = useRouter()

    const cartCount = cartItems?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0

    const navItems = [
        { label: 'Home', href: '/(tabs)/', match: ['/', '/(tabs)', '/(tabs)/'] },
        { label: 'Search', href: '/(tabs)/search', match: ['/search', '/(tabs)/search'] },
        { label: 'Orders', href: '/(tabs)/orders', match: ['/orders', '/(tabs)/orders'] },
    ]

    const isActive = (item) => item.match.some(m => pathname === m || pathname.endsWith(m))

    return (
        <View
            className="w-full bg-white px-6 py-3 flex-row items-center justify-between"
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 4,
            }}
        >
            {/* Logo + Title + Tagline */}
            <Pressable
                onPress={() => router.push('/(tabs)/')}
                className="flex-row items-center gap-2.5"
            >
                <Image
                    source={images.logo}
                    style={{ width: 38, height: 38 }}
                    resizeMode="contain"
                />
                <View>
                    <Text
                        className="text-xl text-primary leading-6"
                        style={{ fontFamily: 'QuickSand-Bold' }}
                    >
                        Savannah Grill
                    </Text>
                    <Text
                        className="text-[11px] text-gray-400 leading-4"
                        style={{ fontFamily: 'QuickSand-Medium' }}
                    >
                        Fresh flavours, delivered fast
                    </Text>
                </View>
            </Pressable>

            {/* Center Nav Links */}
            <View className="flex-row items-center gap-1">
                {navItems.map((item) => {
                    const active = isActive(item)
                    return (
                        <Pressable
                            key={item.href}
                            onPress={() => router.push(item.href)}
                            className={cn(
                                'px-4 py-2 rounded-full',
                                active ? 'bg-orange-50' : 'bg-transparent'
                            )}
                            style={({ hovered }) => [
                                hovered && !active && { backgroundColor: '#F9FAFB' }
                            ]}
                        >
                            <Text
                                className={cn(
                                    'text-[15px]',
                                    active ? 'text-primary' : 'text-gray-600'
                                )}
                                style={{ fontFamily: active ? 'QuickSand-Bold' : 'QuickSand-SemiBold' }}
                            >
                                {item.label}
                            </Text>
                        </Pressable>
                    )
                })}
            </View>

            {/* Right side: Cart + Auth */}
            <View className="flex-row items-center gap-3">
                <Pressable
                    onPress={() => router.push('/(tabs)/cart')}
                    className="relative p-2 rounded-full"
                    style={({ hovered }) => [
                        hovered && { backgroundColor: '#FFF7ED' }
                    ]}
                >
                    <Image
                        source={images.bag}
                        style={{ width: 22, height: 22 }}
                        resizeMode="contain"
                        tintColor="#374151"
                    />
                    {cartCount > 0 && (
                        <View
                            style={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                backgroundColor: '#FE8C00',
                                borderRadius: 99,
                                minWidth: 16,
                                height: 16,
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingHorizontal: 3,
                            }}
                        >
                            <Text style={{ fontSize: 9, fontFamily: 'QuickSand-Bold', color: '#FFF' }}>
                                {cartCount > 9 ? '9+' : cartCount}
                            </Text>
                        </View>
                    )}
                </Pressable>

                {isLoggedIn ? (
                    <Pressable
                        onPress={() => router.push('/(tabs)/profile')}
                        className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50"
                        style={({ hovered }) => [
                            hovered && { backgroundColor: '#FFEDD5' }
                        ]}
                    >
                        <Image
                            source={images.person}
                            style={{ width: 16, height: 16 }}
                            resizeMode="contain"
                            tintColor="#FE8C00"
                        />
                        <Text
                            className="text-primary text-sm"
                            style={{ fontFamily: 'QuickSand-SemiBold' }}
                        >
                            {user?.name?.split(' ')[0] || 'Profile'}
                        </Text>
                    </Pressable>
                ) : (
                    <Pressable
                        onPress={() => router.push('/(tabs)/profile')}
                        className="bg-primary px-4 py-2 rounded-full"
                        style={({ hovered }) => [
                            hovered && { opacity: 0.9 }
                        ]}
                    >
                        <Text
                            className="text-white text-sm"
                            style={{ fontFamily: 'QuickSand-SemiBold' }}
                        >
                            Sign In
                        </Text>
                    </Pressable>
                )}
            </View>
        </View>
    )
}

export default WebNavbar