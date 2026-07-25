import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../../constants'
import { getMenuItem, submitRating } from '../../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'

const SectionTitle = ({ title }) => (
    <Text style={{
        fontSize: 18,
        fontFamily: 'QuickSand-Bold',
        color: '#1C1C2E',
        marginBottom: 12,
    }}>
        {title}
    </Text>
)

const RecommendationCard = ({ rec }) => (
    <TouchableOpacity
        onPress={() => router.push(`/menu/${rec.$id}`)}
        activeOpacity={0.85}
        style={{
            width: 145,
            marginRight: 14,
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            padding: 12,
            shadowColor: '#000',
            shadowOpacity: 0.04,
            shadowRadius: 10,
            elevation: 2,
            borderWidth: 1,
            borderColor: '#F3F4F6',
            alignItems: 'center',
        }}
    >
        <Image
            source={{ uri: rec.image_url }}
            style={{ width: 100, height: 100 }}
            resizeMode="contain"
        />
        <Text
            numberOfLines={1}
            style={{
                fontSize: 13,
                fontFamily: 'QuickSand-Bold',
                color: '#1C1C2E',
                marginTop: 8,
                textAlign: 'center',
                width: '100%',
            }}
        >
            {rec.name}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Image source={images.star} style={{ width: 12, height: 12 }} resizeMode="contain" tintColor="#FE8C00" />
                <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>
                    {rec.rating ?? '—'}
                </Text>
            </View>
            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>
                KES {rec.price}
            </Text>
        </View>
    </TouchableOpacity>
)

export default function MenuDetail() {
    const { id } = useLocalSearchParams()
    const { addToCart } = useGlobalContext()
    const [item, setItem] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [qty, setQty] = useState(1)
    const [showToast, setShowToast] = useState(false)

    useEffect(() => {
        const load = async () => {
            setIsLoading(true)
            try {
                const doc = await getMenuItem(id)
                setItem(doc)
            } catch (e) {
                console.error(e)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [id])

    const [toastMessage, setToastMessage] = useState('')

    const handleAddToCart = () => {
        if (!item) return
        addToCart(item, qty)
        setToastMessage(`${qty}x ${item.name} added`)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 2500)
    }

    const handleRate = async (score) => {
        if (!item) return
        try {
            const updated = await submitRating(item.$id, score)
            setItem(prev => ({ ...prev, rating: updated.rating ?? score }))
            setToastMessage(`Rated ${score} ★! Thanks for your feedback.`)
            setShowToast(true)
            setTimeout(() => setShowToast(false), 2500)
        } catch (error) {
            console.error(error)
            // Local fallback
            setItem(prev => ({ ...prev, rating: score }))
            setToastMessage(`Rated ${score} ★!`)
            setShowToast(true)
            setTimeout(() => setShowToast(false), 2500)
        }
    }

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
                <ActivityIndicator size="large" color="#FE8C00" />
            </SafeAreaView>
        )
    }

    if (!item) {
        return (
            <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
                <Image source={images.emptyState} style={{ width: 160, height: 160 }} resizeMode="contain" />
                <Text style={{ fontFamily: 'QuickSand-Bold', color: '#9CA3AF', marginTop: 16 }}>Item not found</Text>
                <TouchableOpacity
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
                    style={{ marginTop: 16, backgroundColor: '#FE8C00', borderRadius: 99, paddingHorizontal: 24, paddingVertical: 12 }}
                >
                    <Text style={{ fontFamily: 'QuickSand-Bold', color: '#FFFFFF' }}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }

    const recommendations = item.recommendations ?? []
    const totalPrice = (item.price ?? 0) * qty

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
            {/* ── TOAST NOTIFICATION ── */}
            {showToast && (
                <View style={{
                    position: 'absolute',
                    top: 60,
                    left: 20,
                    right: 20,
                    zIndex: 999,
                    backgroundColor: '#1C1C2E',
                    borderRadius: 16,
                    paddingVertical: 14,
                    paddingHorizontal: 18,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    shadowColor: '#000',
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 10,
                }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                        <View style={{
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            backgroundColor: '#22C55E',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Image source={images.check} style={{ width: 14, height: 14 }} resizeMode="contain" tintColor="#FFFFFF" />
                        </View>
                        <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#FFFFFF', flex: 1 }}>
                            {toastMessage || `${qty}x ${item.name} added`}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => { setShowToast(false); router.push('/cart') }}>
                        <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>
                            View Cart
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

                {/* ── TOP SECTION: Side-by-Side Header (Text Left, Image Right) ── */}
                <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
                    {/* Navigation bar */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <TouchableOpacity
                            onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
                            hitSlop={8}
                            style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F3F4F6' }}
                        >
                            <Image source={images.arrowBack} style={{ width: 18, height: 18 }} resizeMode="contain" tintColor="#1C1C2E" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/search')}
                            hitSlop={8}
                            style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F3F4F6' }}
                        >
                            <Image source={images.search} style={{ width: 18, height: 18 }} resizeMode="contain" tintColor="#1C1C2E" />
                        </TouchableOpacity>
                    </View>

                    {/* Side-by-side content */}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        {/* Left column: Text details */}
                        <View style={{ flex: 1, paddingRight: 8, paddingTop: 4 }}>
                            <Text style={{ fontSize: 22, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', lineHeight: 28 }}>
                                {item.name}
                            </Text>

                            {item.categories?.name && (
                                <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', marginTop: 3 }}>
                                    {item.categories.name}
                                </Text>
                            )}

                            {/* Stars Rating Row - Interactive */}
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 2 }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <TouchableOpacity key={s} onPress={() => handleRate(s)} activeOpacity={0.7} hitSlop={6}>
                                        <Image
                                            source={images.star}
                                            style={{ width: 18, height: 18 }}
                                            resizeMode="contain"
                                            tintColor={s <= Math.round(item.rating ?? 0) ? '#FE8C00' : '#D1D5DB'}
                                        />
                                    </TouchableOpacity>
                                ))}
                                <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#FE8C00', marginLeft: 4 }}>
                                    {item.rating ?? '—'}
                                </Text>
                            </View>

                            {/* Big Price */}
                            <Text style={{ fontSize: 26, fontFamily: 'QuickSand-Bold', color: '#FE8C00', marginTop: 10 }}>
                                KES {(item.price ?? 0).toLocaleString()}
                            </Text>

                            {/* Calories / Protein stats */}
                            <View style={{ flexDirection: 'row', gap: 20, marginTop: 12 }}>
                                {item.calories != null && (
                                    <View>
                                        <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>Calories</Text>
                                        <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>{item.calories} Cal</Text>
                                    </View>
                                )}
                                {item.protein != null && (
                                    <View>
                                        <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>Protein</Text>
                                        <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>{item.protein}g</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Right column: Large food image */}
                        <Image
                            source={{ uri: item.image_url }}
                            style={{ width: 170, height: 170, marginTop: -10 }}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* ── DELIVERY INFO PILLS ── */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginHorizontal: 20,
                    marginTop: 18,
                    marginBottom: 20,
                    backgroundColor: '#F9FAFB',
                    borderRadius: 16,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderWidth: 1,
                    borderColor: '#F3F4F6',
                }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Image source={images.location} style={{ width: 15, height: 15 }} resizeMode="contain" tintColor="#22C55E" />
                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#22C55E' }}>Free Delivery</Text>
                    </View>
                    <View style={{ width: 1, height: 16, backgroundColor: '#E5E7EB' }} />
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Image source={images.clock} style={{ width: 15, height: 15 }} resizeMode="contain" tintColor="#F97316" />
                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#F97316' }}>20–35 mins</Text>
                    </View>
                    <View style={{ width: 1, height: 16, backgroundColor: '#E5E7EB' }} />
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                        <Image source={images.star} style={{ width: 13, height: 13 }} resizeMode="contain" tintColor="#FE8C00" />
                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>{item.rating}</Text>
                    </View>
                </View>

                {/* ── DESCRIPTION ── */}
                <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
                    <SectionTitle title="About this dish" />
                    <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Regular', color: '#6B7280', lineHeight: 22 }}>
                        {item.description}
                    </Text>
                </View>

                {/* ── YOU MIGHT ALSO LIKE ── */}
                {recommendations.length > 0 && (
                    <View style={{ marginBottom: 20 }}>
                        <View style={{ paddingHorizontal: 20 }}>
                            <SectionTitle title="You might also like" />
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 }}
                        >
                            {recommendations.map(rec => (
                                <RecommendationCard key={rec.$id} rec={rec} />
                            ))}
                        </ScrollView>
                    </View>
                )}

            </ScrollView>

            {/* ── STICKY BOTTOM ACTION BAR ── */}
            <View style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                backgroundColor: '#FFFFFF',
                borderTopWidth: 1,
                borderTopColor: '#F3F4F6',
                paddingHorizontal: 20,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 10,
                elevation: 10,
            }}>
                {/* Quantity Stepper */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#F9FAFB',
                    borderRadius: 99,
                    paddingHorizontal: 8,
                    paddingVertical: 6,
                    borderWidth: 1,
                    borderColor: '#E5E7EB',
                    gap: 12,
                }}>
                    <TouchableOpacity
                        onPress={() => setQty(q => Math.max(1, q - 1))}
                        activeOpacity={0.7}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: '#FFFFFF',
                            alignItems: 'center',
                            justifyContent: 'center',
                            shadowColor: '#000',
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 1,
                        }}
                    >
                        <Image source={images.minus} style={{ width: 12, height: 12 }} resizeMode="contain" tintColor="#FE8C00" />
                    </TouchableOpacity>

                    <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', minWidth: 18, textAlign: 'center' }}>
                        {qty}
                    </Text>

                    <TouchableOpacity
                        onPress={() => setQty(q => q + 1)}
                        activeOpacity={0.7}
                        style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: '#FE8C00',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Image source={images.plus} style={{ width: 12, height: 12 }} resizeMode="contain" tintColor="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Add to Cart Button */}
                <TouchableOpacity
                    onPress={handleAddToCart}
                    activeOpacity={0.85}
                    style={{
                        flex: 1,
                        backgroundColor: '#FE8C00',
                        borderRadius: 99,
                        paddingVertical: 15,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        shadowColor: '#FE8C00',
                        shadowOpacity: 0.25,
                        shadowRadius: 8,
                        elevation: 3,
                    }}
                >
                    <Image source={images.bag} style={{ width: 18, height: 18 }} resizeMode="contain" tintColor="#FFFFFF" />
                    <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#FFFFFF' }}>
                        Add to Cart · KES {totalPrice.toLocaleString()}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}
