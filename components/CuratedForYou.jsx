import { router } from 'expo-router'
import React, { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Image,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { images } from '../constants'
import { getPersonalizedRecommendations } from '../lib/gemini'
import { useGlobalContext } from '../src/context/GlobalProvider'

export default function CuratedForYou({ menuItems = [] }) {
    const { myOrders, addToCart, showToast } = useGlobalContext()
    const [curatedList, setCuratedList] = useState([])
    const [loading, setLoading] = useState(false)

    const hasPastOrders = (myOrders || []).some(
        (order) => Array.isArray(order.items) && order.items.length > 0
    )

    useEffect(() => {
        let isMounted = true

        const fetchRecommendations = async () => {
            if (!menuItems || menuItems.length === 0) return

            setLoading(true)
            try {
                const recs = await getPersonalizedRecommendations({
                    myOrders,
                    allMenuItems: menuItems,
                    limit: 4,
                })
                if (isMounted) {
                    setCuratedList(recs || [])
                }
            } catch (err) {
                console.warn('CuratedForYou fetch error:', err?.message)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchRecommendations()

        return () => {
            isMounted = false
        }
    }, [menuItems, myOrders?.length])

    if (!loading && curatedList.length === 0) {
        return null
    }

    const title = hasPastOrders ? 'Curated For You' : "Chef's Selections"
    const subtitle = hasPastOrders
        ? 'Handpicked pairings based on your favorites'
        : 'Signature grill pairings crafted for your palate'

    return (
        <View style={{ marginBottom: 24 }}>
            {/* ── SECTION HEADER ── */}
            <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
                <Text
                    style={{
                        fontSize: 18,
                        fontFamily: 'QuickSand-Bold',
                        color: '#1C1C2E',
                    }}
                >
                    {title}
                </Text>
                <Text
                    style={{
                        fontSize: 12,
                        fontFamily: 'QuickSand-Medium',
                        color: '#6B7280',
                        marginTop: 2,
                    }}
                >
                    {subtitle}
                </Text>
            </View>

            {/* ── CAROUSEL ── */}
            {loading && curatedList.length === 0 ? (
                <View
                    style={{
                        paddingHorizontal: 20,
                        paddingVertical: 24,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                    }}
                >
                    <ActivityIndicator size="small" color="#FE8C00" />
                    <Text
                        style={{
                            fontSize: 13,
                            fontFamily: 'QuickSand-Medium',
                            color: '#9CA3AF',
                        }}
                    >
                        Pairing selections...
                    </Text>
                </View>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        gap: 14,
                        paddingBottom: 6,
                    }}
                >
                    {curatedList.map((item) => (
                        <TouchableOpacity
                            key={item.$id}
                            activeOpacity={0.88}
                            onPress={() => router.push(`/menu/${item.$id}`)}
                            style={{
                                width: 190,
                                backgroundColor: '#FFFFFF',
                                borderRadius: 22,
                                padding: 12,
                                borderWidth: 1,
                                borderColor: '#F3F4F6',
                                shadowColor: '#000',
                                shadowOpacity: 0.04,
                                shadowRadius: 10,
                                elevation: 2,
                                justifyContent: 'space-between',
                            }}
                        >
                            {/* Top row: Pairing pill & Quick Add */}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: 8,
                                }}
                            >
                                <View
                                    style={{
                                        backgroundColor: '#FFF7ED',
                                        borderRadius: 99,
                                        paddingHorizontal: 8,
                                        paddingVertical: 3,
                                        maxWidth: '75%',
                                    }}
                                >
                                    <Text
                                        numberOfLines={1}
                                        style={{
                                            fontSize: 10,
                                            fontFamily: 'QuickSand-Bold',
                                            color: '#EA580C',
                                        }}
                                    >
                                        {item.curatedReason || 'Curated'}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={(e) => {
                                        e.stopPropagation?.()
                                        addToCart(item, 1)
                                        showToast?.(`${item.name} added to cart`)
                                    }}
                                    activeOpacity={0.75}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 14,
                                        backgroundColor: '#FE8C00',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Image
                                        source={images.plus}
                                        style={{ width: 12, height: 12 }}
                                        resizeMode="contain"
                                        tintColor="#FFFFFF"
                                    />
                                </TouchableOpacity>
                            </View>

                            {/* Food Image */}
                            <View
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: 100,
                                    marginVertical: 4,
                                }}
                            >
                                <Image
                                    source={{ uri: item.image_url }}
                                    style={{ width: 95, height: 95 }}
                                    resizeMode="contain"
                                />
                            </View>

                            {/* Food Details */}
                            <View style={{ marginTop: 6 }}>
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        fontSize: 14,
                                        fontFamily: 'QuickSand-Bold',
                                        color: '#1C1C2E',
                                    }}
                                >
                                    {item.name}
                                </Text>

                                <View
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginTop: 6,
                                    }}
                                >
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 3,
                                        }}
                                    >
                                        <Image
                                            source={images.star}
                                            style={{ width: 12, height: 12 }}
                                            resizeMode="contain"
                                            tintColor="#FE8C00"
                                        />
                                        <Text
                                            style={{
                                                fontSize: 12,
                                                fontFamily: 'QuickSand-Bold',
                                                color: '#FE8C00',
                                            }}
                                        >
                                            {item.rating ?? '4.8'}
                                        </Text>
                                    </View>

                                    <Text
                                        style={{
                                            fontSize: 13,
                                            fontFamily: 'QuickSand-Bold',
                                            color: '#1C1C2E',
                                        }}
                                    >
                                        KES {Number(item.price || 0).toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    )
}
