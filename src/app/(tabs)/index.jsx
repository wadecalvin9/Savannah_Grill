import { router } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
    ActivityIndicator,
    FlatList,
    Image,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Cartbutton from '../../../components/Cartbutton'
import CuratedForYou from '../../../components/CuratedForYou'
import LocationModal from '../../../components/LocationModal'
import MenuCard from '../../../components/MenuCard'
import WebFooter from '../../../components/WebFooter'
import { images, offers } from '../../../constants/index'
import { getCategories, getMenu } from '../../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'

export default function Index() {
    const { deliveryLocation } = useGlobalContext()
    const [allMenuItems, setAllMenuItems] = useState([])
    const [categories, setCategories] = useState([])
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isLocationModalVisible, setIsLocationModalVisible] = useState(false)
    const isWeb = Platform.OS === 'web'

    // Fetch initial menu and categories once
    const fetchData = useCallback(async () => {
        setIsLoading(true)
        try {
            const [menuRes, catsRes] = await Promise.all([
                getMenu(),
                getCategories().catch(catErr => {
                    console.warn('Could not fetch categories:', catErr?.message)
                    return []
                })
            ])
            setAllMenuItems(menuRes || [])
            setCategories(catsRes || [])
        } catch (error) {
            console.error('Failed to fetch menu:', error)
            setAllMenuItems([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Instant in-memory category selection - no network flash or jump
    const handleCategoryPress = useCallback((cat) => {
        setSelectedCategory(prev => (prev === cat.$id ? null : cat.$id))
    }, [])

    // Smooth client-side filtering
    const displayedMenuItems = useMemo(() => {
        if (!selectedCategory) return allMenuItems
        return allMenuItems.filter(item => {
            const cat = item.categories
            if (typeof cat === 'string') return cat === selectedCategory
            if (cat && typeof cat === 'object') {
                if (cat.$id) return cat.$id === selectedCategory
                if (Array.isArray(cat)) {
                    return cat.some(c => (typeof c === 'string' ? c === selectedCategory : c?.$id === selectedCategory))
                }
            }
            return item.category_name === selectedCategory
        })
    }, [allMenuItems, selectedCategory])

    const keyExtractor = useCallback((item) => item.$id, [])

    const renderItem = useCallback(({ item }) => (
        <View style={{ flex: 1, maxWidth: '50%', paddingTop: 40 }}>
            <MenuCard item={item} />
        </View>
    ), [])

    // Empty state memoized to avoid re-creating components
    const listEmptyComponent = useMemo(() => (
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
    ), [isLoading])

    // Memoized Header: passing this directly as a JSX Element avoids FlatList remounting the header on every render
    const renderHeader = useMemo(() => {
        const currentCategoryName = selectedCategory
            ? categories.find(c => c.$id === selectedCategory)?.name || 'Menu'
            : 'Popular Dishes'

        return (
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
                            onPress={() => setIsLocationModalVisible(true)}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}
                        >
                            <Image source={images.location} style={{ width: 14, height: 14 }} resizeMode="contain" tintColor="#1C1C2E" />
                            <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }} numberOfLines={1}>
                                {deliveryLocation}
                            </Text>
                            <Image source={images.arrowDown} style={{ width: 10, height: 10 }} resizeMode="contain" tintColor="#1C1C2E" />
                        </TouchableOpacity>
                    </View>
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

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                    >
                        {offers.map((item, index) => {
                            const isEven = index % 2 === 0
                            return (
                                <Pressable
                                    key={item.id}
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
                        })}
                    </ScrollView>
                </View>

                {/* ── CURATED FOR YOU (fed allMenuItems so recommendations remain rock-solid and never jump) ── */}
                <CuratedForYou menuItems={allMenuItems} />

                {/* ── CATEGORY FILTERS ── */}
                {categories.length > 0 && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}
                    >
                        {categories.map((item) => {
                            const isActive = selectedCategory === item.$id
                            return (
                                <TouchableOpacity
                                    key={item.$id}
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
                        })}
                    </ScrollView>
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
                        {currentCategoryName}
                    </Text>
                    <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>
                        {displayedMenuItems.length} items
                    </Text>
                </View>
            </View>
        )
    }, [deliveryLocation, categories, selectedCategory, allMenuItems, displayedMenuItems.length, handleCategoryPress])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
            <FlatList
                data={displayedMenuItems}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                numColumns={2}
                contentContainerStyle={{ paddingBottom: isWeb ? 10 : 120, paddingTop: 8 }}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 12 }}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={listEmptyComponent}
                ListFooterComponent={isWeb ? <WebFooter /> : null}
                initialNumToRender={6}
                maxToRenderPerBatch={6}
                windowSize={5}
                removeClippedSubviews={Platform.OS !== 'web'}
            />
            <LocationModal
                visible={isLocationModalVisible}
                onClose={() => setIsLocationModalVisible(false)}
            />
        </SafeAreaView>
    )
}