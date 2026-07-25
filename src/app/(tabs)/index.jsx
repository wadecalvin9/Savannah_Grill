import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    FlatList,
    Image,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Cartbutton from '../../../components/Cartbutton'
import MenuCard from '../../../components/MenuCard'
import { images, offers } from '../../../constants/index'
import { getCategories, getMenu } from '../../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'

export default function Index() {
    const { user } = useGlobalContext()
    const [menuItems, setMenuItems] = useState([])
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = async (categoryId = null) => {
        setIsLoading(true)
        try {
            const [menu, cats] = await Promise.all([
                getMenu({ category: categoryId }),
                categories.length === 0 ? getCategories() : Promise.resolve(categories),
            ])
            setMenuItems(menu)
            if (categories.length === 0) setCategories(cats)
        } catch (error) {
            console.error('Failed to fetch menu:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleCategoryPress = (cat) => {
        const newId = selectedCategory === cat.$id ? null : cat.$id
        setSelectedCategory(newId)
        fetchData(newId)
    }

    const firstName = user?.name?.split(' ')[0] || 'there'

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
            <FlatList
                data={menuItems}
                keyExtractor={(item) => item.$id}
                numColumns={2}
                contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 12 }}
                renderItem={({ item }) => (
                    <View style={{ flex: 1, maxWidth: '50%', paddingTop: 40 }}>
                        <MenuCard item={item} />
                    </View>
                )}
                ListEmptyComponent={() =>
                    isLoading ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 }}>
                            <ActivityIndicator size="large" color="#FE8C00" />
                        </View>
                    ) : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 }}>
                            <Image source={images.emptyState} style={{ width: 160, height: 160 }} resizeMode="contain" />
                            <Text style={{ fontFamily: 'QuickSand-Bold', color: '#9CA3AF', marginTop: 16, fontSize: 15 }}>
                                No items found
                            </Text>
                        </View>
                    )
                }
                ListHeaderComponent={() => (
                    <View>
                        {/* ── TOP BAR ── */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingHorizontal: 20,
                            marginBottom: 16,
                        }}>
                            <View>
                                <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#FE8C00', letterSpacing: 0.5 }}>
                                    DELIVER TO
                                </Text>
                                <TouchableOpacity
                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}
                                >
                                    <Image source={images.location} style={{ width: 14, height: 14 }} resizeMode="contain" tintColor="#1C1C2E" />
                                    <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                                        Karen, Nairobi
                                    </Text>
                                    <Image source={images.arrowDown} style={{ width: 10, height: 10 }} resizeMode="contain" tintColor="#1C1C2E" />
                                </TouchableOpacity>
                            </View>
                            <Cartbutton />
                        </View>

                        {/* ── SEARCH BAR ── */}
                        <TouchableOpacity
                            onPress={() => router.push('/search')}
                            activeOpacity={0.8}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#FFFFFF',
                                borderRadius: 16,
                                paddingHorizontal: 14,
                                paddingVertical: 12,
                                marginHorizontal: 16,
                                marginBottom: 20,
                                gap: 10,
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                            }}
                        >
                            <Image source={images.search} style={{ width: 18, height: 18 }} resizeMode="contain" tintColor="#9CA3AF" />
                            <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', flex: 1 }}>
                                Search for dishes...
                            </Text>
                        </TouchableOpacity>

                        {/* ── OFFERS BANNER ── */}
                        <View style={{ marginBottom: 20 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 }}>
                                <Text style={{ fontSize: 18, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                                    Special Offers
                                </Text>
                            </View>

                            <FlatList
                                data={offers}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                                renderItem={({ item, index }) => {
                                    const isEven = index % 2 === 0
                                    return (
                                        <Pressable
                                            style={{
                                                backgroundColor: item.color,
                                                borderRadius: 20,
                                                width: 260,
                                                height: 130,
                                                padding: 8,
                                                flexDirection: isEven ? 'row-reverse' : 'row',
                                                alignItems: 'center',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <View style={{ width: '50%', height: '100%' }}>
                                                <Image
                                                    source={item.image}
                                                    style={{ width: '100%', height: '100%' }}
                                                    resizeMode="contain"
                                                />
                                            </View>
                                            <View style={{ flex: 1, paddingHorizontal: 8, justifyContent: 'center', gap: 8 }}>
                                                <Text style={{ fontSize: 18, fontFamily: 'QuickSand-Bold', color: '#FFFFFF', lineHeight: 22 }}>
                                                    {item.title}
                                                </Text>
                                                <Image source={images.arrowRight} style={{ width: 16, height: 16 }} resizeMode="contain" tintColor="#FFFFFF" />
                                            </View>
                                        </Pressable>
                                    )
                                }}
                            />
                        </View>

                        {/* ── CATEGORY FILTERS ── */}
                        {categories.length > 0 && (
                            <FlatList
                                data={categories}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item) => item.$id}
                                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}
                                renderItem={({ item }) => {
                                    const isActive = selectedCategory === item.$id
                                    return (
                                        <TouchableOpacity
                                            onPress={() => handleCategoryPress(item)}
                                            activeOpacity={0.8}
                                            style={{
                                                backgroundColor: isActive ? '#FE8C00' : '#FFFFFF',
                                                paddingHorizontal: 18,
                                                paddingVertical: 10,
                                                borderRadius: 99,
                                                borderWidth: 1,
                                                borderColor: isActive ? '#FE8C00' : '#E5E7EB',
                                            }}
                                        >
                                            <Text style={{
                                                fontSize: 13,
                                                fontFamily: 'QuickSand-Bold',
                                                color: isActive ? '#FFFFFF' : '#6B7280',
                                            }}>
                                                {item.name}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                }}
                            />
                        )}

                        {/* ── SECTION HEADING ── */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingHorizontal: 20,
                            marginBottom: 4,
                        }}>
                            <Text style={{ fontSize: 18, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                                {selectedCategory
                                    ? categories.find(c => c.$id === selectedCategory)?.name || 'Menu'
                                    : 'Popular Dishes'}
                            </Text>
                            <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>
                                {menuItems.length} items
                            </Text>
                        </View>
                    </View>
                )}
            />
        </SafeAreaView>
    )
}