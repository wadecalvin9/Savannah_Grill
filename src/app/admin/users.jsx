import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../../constants'
import { getUsers, updateUserRole } from '../../../lib/appwrite'

const ROLE_STYLES = {
    admin:    { bg: '#FFF7ED', text: '#F97316', label: '👑 Admin' },
    rider:    { bg: '#F5F3FF', text: '#8B5CF6', label: '🛵 Rider' },
    customer: { bg: '#EFF6FF', text: '#3B82F6', label: '👤 Customer' },
}

export default function ManageUsers() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState(null)

    const loadUsers = async () => {
        setLoading(true)
        try {
            const result = await getUsers()
            setUsers(result || [])
        } catch (e) {
            Alert.alert('Error', 'Could not load users.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadUsers() }, [])

    const handleUpdateRole = async (userId, currentRole, newRole) => {
        Alert.alert(
            'Change Role',
            `Change this user from "${currentRole}" to "${newRole}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setUpdatingId(userId)
                        try {
                            await updateUserRole(userId, newRole)
                            setUsers(prev => prev.map(u => u.$id === userId ? { ...u, role: newRole } : u))
                        } catch (e) {
                            Alert.alert('Error', 'Could not update role. Make sure the "role" attribute exists in your Appwrite user collection.')
                        } finally {
                            setUpdatingId(null)
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
                flexDirection: 'row', alignItems: 'center', gap: 12,
                paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14,
                backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
            }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{
                        width: 36, height: 36, borderRadius: 18,
                        backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center',
                        borderWidth: 1, borderColor: '#E5E7EB',
                    }}
                >
                    <Image source={images.arrowBack} style={{ width: 16, height: 16 }} resizeMode="contain" tintColor="#1C1C2E" />
                </TouchableOpacity>
                <View>
                    <Text style={{ fontSize: 20, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>Manage Users</Text>
                    <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>
                        {users.length} registered user{users.length !== 1 ? 's' : ''}
                    </Text>
                </View>
            </View>

            {loading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#FE8C00" />
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={u => u.$id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item: u }) => {
                        const role = u.role || 'customer'
                        const roleStyle = ROLE_STYLES[role] || ROLE_STYLES.customer
                        const isUpdating = updatingId === u.$id

                        return (
                            <View style={{
                                backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
                                marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6',
                                shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                    {/* Avatar */}
                                    <View style={{
                                        width: 44, height: 44, borderRadius: 22,
                                        backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
                                        marginRight: 12,
                                    }}>
                                        {u.profile ? (
                                            <Image source={{ uri: u.profile }} style={{ width: 44, height: 44, borderRadius: 22 }} />
                                        ) : (
                                            <Image source={images.person} style={{ width: 20, height: 20 }} resizeMode="contain" tintColor="#9CA3AF" />
                                        )}
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                                            {u.name || 'Unknown'}
                                        </Text>
                                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Regular', color: '#9CA3AF', marginTop: 1 }}>
                                            {u.email}
                                        </Text>
                                    </View>

                                    {/* Role badge */}
                                    <View style={{ backgroundColor: roleStyle.bg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 }}>
                                        <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Bold', color: roleStyle.text }}>
                                            {roleStyle.label}
                                        </Text>
                                    </View>
                                </View>

                                {/* Role action buttons */}
                                {isUpdating ? (
                                    <ActivityIndicator size="small" color="#FE8C00" />
                                ) : (
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        {role !== 'rider' && (
                                            <TouchableOpacity
                                                onPress={() => handleUpdateRole(u.$id, role, 'rider')}
                                                style={{
                                                    flex: 1, backgroundColor: '#F5F3FF', borderRadius: 10,
                                                    paddingVertical: 9, alignItems: 'center',
                                                    borderWidth: 1, borderColor: '#DDD6FE',
                                                }}
                                            >
                                                <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#8B5CF6' }}>
                                                    🛵 Make Rider
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                        {role !== 'customer' && (
                                            <TouchableOpacity
                                                onPress={() => handleUpdateRole(u.$id, role, 'customer')}
                                                style={{
                                                    flex: 1, backgroundColor: '#EFF6FF', borderRadius: 10,
                                                    paddingVertical: 9, alignItems: 'center',
                                                    borderWidth: 1, borderColor: '#BFDBFE',
                                                }}
                                            >
                                                <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#3B82F6' }}>
                                                    👤 Make Customer
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                        {role !== 'admin' && (
                                            <TouchableOpacity
                                                onPress={() => handleUpdateRole(u.$id, role, 'admin')}
                                                style={{
                                                    flex: 1, backgroundColor: '#FFF7ED', borderRadius: 10,
                                                    paddingVertical: 9, alignItems: 'center',
                                                    borderWidth: 1, borderColor: '#FED7AA',
                                                }}
                                            >
                                                <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#F97316' }}>
                                                    👑 Make Admin
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            </View>
                        )
                    }}
                />
            )}
        </SafeAreaView>
    )
}
