import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../../constants'
import { signOut } from '../../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'
import { router } from 'expo-router'

export default function RiderProfile() {
    const { user, setIsLoggedIn, setUser, setUserRole, riderHistory } = useGlobalContext()

    const completed = riderHistory.filter(o => o.status === 'Completed')

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
                            setUserRole('customer')
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
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
                    <Text style={{ fontSize: 24, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>Profile</Text>
                </View>

                {/* Rider Avatar Card */}
                <View style={{
                    backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 20,
                    padding: 20, borderWidth: 1, borderColor: '#E5E7EB',
                    alignItems: 'center',
                }}>
                    <View style={{
                        width: 80, height: 80, borderRadius: 40,
                        backgroundColor: '#FFF7ED', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 12, borderWidth: 3, borderColor: '#FED7AA',
                    }}>
                        <Image source={images.location} style={{ width: 36, height: 36 }} resizeMode="contain" tintColor="#FE8C00" />
                    </View>
                    <Text style={{ fontSize: 20, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                        {user?.name || 'Rider'}
                    </Text>
                    <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Medium', color: '#6B7280', marginTop: 2 }}>
                        {user?.email}
                    </Text>
                    <View style={{
                        marginTop: 10, backgroundColor: '#FFF7ED',
                        paddingHorizontal: 14, paddingVertical: 5,
                        borderRadius: 99, borderWidth: 1, borderColor: '#FED7AA',
                        flexDirection: 'row', alignItems: 'center', gap: 6,
                    }}>
                        <Image source={images.location} style={{ width: 12, height: 12 }} resizeMode="contain" tintColor="#FE8C00" />
                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>Rider</Text>
                    </View>
                </View>

                {/* Stats */}
                <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginTop: 16, gap: 10 }}>
                    <View style={{
                        flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
                        borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center',
                    }}>
                        <Text style={{ fontSize: 26, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>{completed.length}</Text>
                        <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', marginTop: 2 }}>Deliveries</Text>
                    </View>
                    <View style={{
                        flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14,
                        borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center',
                    }}>
                        <Text style={{ fontSize: 22, fontFamily: 'QuickSand-Bold', color: '#10B981' }}>
                            {completed.length > 0
                                ? `${Math.round((completed.length / Math.max(riderHistory.length, 1)) * 100)}%`
                                : '—'}
                        </Text>
                        <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', marginTop: 2 }}>Success Rate</Text>
                    </View>
                </View>

                {/* Account Info */}
                <View style={{
                    backgroundColor: '#FFFFFF', marginHorizontal: 20, marginTop: 16,
                    borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden',
                }}>
                    <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>
                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            Account
                        </Text>
                    </View>
                    <View style={{ paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>Name</Text>
                        <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginTop: 2 }}>{user?.name || '—'}</Text>
                    </View>
                    <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>Email</Text>
                        <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginTop: 2 }}>{user?.email || '—'}</Text>
                    </View>
                </View>

                {/* Sign Out */}
                <View style={{
                    backgroundColor: '#FFFFFF', marginHorizontal: 20, marginTop: 16,
                    borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden',
                }}>
                    <TouchableOpacity
                        onPress={handleSignOut}
                        activeOpacity={0.7}
                        style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 16, gap: 14 }}
                    >
                        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEF2F2', alignItems: 'center', justifyContent: 'center' }}>
                            <Image source={images.logout} style={{ width: 18, height: 18 }} resizeMode="contain" tintColor="#EF4444" />
                        </View>
                        <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#EF4444', flex: 1 }}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}
