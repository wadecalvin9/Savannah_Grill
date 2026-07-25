import { router } from 'expo-router'
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../../constants'
import { signOut } from '../../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'

const MenuListItem = ({ icon, title, subtitle, onPress, isLast = false, titleColor = '#1C1C2E' }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderBottomWidth: isLast ? 0 : 1,
            borderBottomColor: '#F3F4F6',
        }}
    >
        <View style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: '#F3F4F6',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
        }}>
            <Image source={icon} style={{ width: 18, height: 18 }} resizeMode="contain" tintColor={titleColor === '#EF4444' ? '#EF4444' : '#1C1C2E'} />
        </View>

        <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: titleColor }}>
                {title}
            </Text>
            {subtitle ? (
                <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Regular', color: '#6B7280', marginTop: 1 }}>
                    {subtitle}
                </Text>
            ) : null}
        </View>

        {onPress && (
            <Image source={images.arrowRight} style={{ width: 14, height: 14 }} resizeMode="contain" tintColor="#9CA3AF" />
        )}
    </TouchableOpacity>
)

export default function Profile() {
    const { user, setIsLoggedIn, setUser } = useGlobalContext()

    const handleSignOut = async () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await signOut()
                            setUser(null)
                            setIsLoggedIn(false)
                            router.replace('/sign-in')
                        } catch (error) {
                            Alert.alert('Error', error.message || 'Failed to sign out')
                        }
                    }
                }
            ]
        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Title */}
                <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
                    <Text style={{ fontSize: 24, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                        Profile
                    </Text>
                </View>

                {/* User Info Card */}
                <View style={{
                    backgroundColor: '#FFFFFF',
                    marginHorizontal: 20,
                    borderRadius: 20,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                }}>
                    <Image
                        source={
                            user?.profile
                                ? { uri: user.profile }
                                : images.avatar
                        }
                        style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#F3F4F6' }}
                        resizeMode="cover"
                    />

                    <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={{ fontSize: 18, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                            {user?.name || 'User'}
                        </Text>
                        <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Medium', color: '#6B7280', marginTop: 2 }}>
                            {user?.email || 'No email attached'}
                        </Text>
                    </View>
                </View>

                {/* Account Details Group */}
                <View style={{
                    backgroundColor: '#FFFFFF',
                    marginHorizontal: 20,
                    marginTop: 20,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    overflow: 'hidden',
                }}>
                    <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>
                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Account Information
                        </Text>
                    </View>

                    <MenuListItem
                        icon={images.person}
                        title="Name"
                        subtitle={user?.name || '—'}
                    />
                    <MenuListItem
                        icon={images.envelope}
                        title="Email"
                        subtitle={user?.email || '—'}
                        isLast
                    />
                </View>

                {/* Quick Navigation Group */}
                <View style={{
                    backgroundColor: '#FFFFFF',
                    marginHorizontal: 20,
                    marginTop: 16,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    overflow: 'hidden',
                }}>
                    <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>
                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Quick Access
                        </Text>
                    </View>

                    <MenuListItem
                        icon={images.search}
                        title="Explore Menu"
                        subtitle="Browse and search food items"
                        onPress={() => router.push('/search')}
                    />
                    <MenuListItem
                        icon={images.bag}
                        title="View Cart"
                        subtitle="Check items in your shopping cart"
                        onPress={() => router.push('/cart')}
                    />
                    <MenuListItem
                        icon={images.pencil}
                        title="Admin Panel"
                        subtitle="Manage products, orders & catalog"
                        onPress={() => router.push('/admin')}
                        isLast
                    />
                </View>

                {/* Sign Out Group */}
                <View style={{
                    backgroundColor: '#FFFFFF',
                    marginHorizontal: 20,
                    marginTop: 16,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    overflow: 'hidden',
                }}>
                    <MenuListItem
                        icon={images.logout}
                        title="Sign Out"
                        titleColor="#EF4444"
                        onPress={handleSignOut}
                        isLast
                    />
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}