import { router, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../../constants'
import { deleteMenuItem, getMenu } from '../../../lib/appwrite'

export default function ManageProducts() {
    const [products, setProducts] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [deletingId, setDeletingId] = useState(null)

    const fetchProducts = async () => {
        setIsLoading(true)
        try {
            const docs = await getMenu()
            setProducts(docs || [])
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchProducts()
        }, [])
    )

    const handleDelete = (item) => {
        Alert.alert(
            'Delete Product',
            `Are you sure you want to delete "${item.name}" from the menu?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeletingId(item.$id)
                        try {
                            await deleteMenuItem(item.$id)
                            setProducts(prev => prev.filter(p => p.$id !== item.$id))
                            Alert.alert('Deleted', `"${item.name}" has been removed.`)
                        } catch (err) {
                            Alert.alert('Error', err.message || 'Failed to delete item.')
                        } finally {
                            setDeletingId(null)
                        }
                    },
                },
            ]
        )
    }

    const filteredProducts = products.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
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
                        onPress={() => router.back()}
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

                    <Text style={{ fontSize: 20, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                        Manage Products
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => router.push('/admin/add-product')}
                    style={{
                        backgroundColor: '#FE8C00',
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Image source={images.plus} style={{ width: 16, height: 16 }} resizeMode="contain" tintColor="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={{ paddingHorizontal: 20, paddingTop: 14, paddingBottom: 10 }}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    gap: 10,
                }}>
                    <Image source={images.search} style={{ width: 16, height: 16 }} resizeMode="contain" tintColor="#9CA3AF" />
                    <TextInput
                        style={{ flex: 1, fontSize: 13, fontFamily: 'QuickSand-Medium', color: '#1C1C2E' }}
                        placeholder="Search products by name..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#9CA3AF' }}>Clear</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Products List */}
            {isLoading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#FE8C00" />
                </View>
            ) : filteredProducts.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
                    <Image source={images.emptyState} style={{ width: 140, height: 140 }} resizeMode="contain" />
                    <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#9CA3AF', marginTop: 16 }}>
                        No products found
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(p) => p.$id}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 6 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item: p }) => (
                        <View style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 18,
                            padding: 14,
                            marginBottom: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#F3F4F6',
                            shadowColor: '#000',
                            shadowOpacity: 0.03,
                            shadowRadius: 8,
                            elevation: 2,
                        }}>
                            {/* Image */}
                            <Image
                                source={{ uri: p.image_url }}
                                style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: '#F9FAFB' }}
                                resizeMode="contain"
                            />

                            {/* Info */}
                            <View style={{ flex: 1, marginLeft: 12, paddingRight: 6 }}>
                                <Text numberOfLines={1} style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                                    {p.name}
                                </Text>
                                {p.categories?.name && (
                                    <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', marginTop: 1 }}>
                                        {p.categories.name}
                                    </Text>
                                )}
                                <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#FE8C00', marginTop: 4 }}>
                                    KES {(p.price ?? 0).toLocaleString()}
                                </Text>
                            </View>

                            {/* Action Buttons */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <TouchableOpacity
                                    onPress={() => router.push(`/menu/${p.$id}`)}
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 10,
                                        backgroundColor: '#F3F4F6',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Image source={images.search} style={{ width: 14, height: 14 }} resizeMode="contain" tintColor="#6B7280" />
                                </TouchableOpacity>

                                {/* Edit Button */}
                                <TouchableOpacity
                                    onPress={() => router.push({ pathname: '/admin/edit-product', params: { id: p.$id } })}
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 10,
                                        backgroundColor: '#FFF7ED',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderWidth: 1,
                                        borderColor: '#FFEDD5',
                                    }}
                                >
                                    <Image source={images.pencil} style={{ width: 14, height: 14 }} resizeMode="contain" tintColor="#F97316" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleDelete(p)}
                                    disabled={deletingId === p.$id}
                                    style={{
                                        width: 34,
                                        height: 34,
                                        borderRadius: 10,
                                        backgroundColor: '#FEF2F2',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {deletingId === p.$id ? (
                                        <ActivityIndicator size="small" color="#EF4444" />
                                    ) : (
                                        <Image source={images.trash} style={{ width: 15, height: 15 }} resizeMode="contain" tintColor="#EF4444" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    )
}
