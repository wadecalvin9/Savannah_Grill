import { router } from 'expo-router'
import { useState } from 'react'
import {
    Alert,
    FlatList,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../../constants'
import { useGlobalContext } from '../../context/GlobalProvider'

export default function Cart() {
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCartItems,
        totalCartPrice,
        placeOrder,
    } = useGlobalContext()

    const [note, setNote] = useState('')
    const [isPlacingOrder, setIsPlacingOrder] = useState(false)

    const deliveryFee = totalCartPrice > 1000 || totalCartItems === 0 ? 0 : 150
    const grandTotal = totalCartPrice + deliveryFee

    const handleCheckout = () => {
        if (cartItems.length === 0) return

        setIsPlacingOrder(true)
        Alert.alert(
            'Confirm Order',
            `Place order for KES ${grandTotal.toLocaleString()} to Karen, Nairobi?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => setIsPlacingOrder(false),
                },
                {
                    text: 'Place Order',
                    style: 'default',
                    onPress: async () => {
                        try {
                            const newOrder = await placeOrder({ note, address: 'Karen, Nairobi' })
                            setIsPlacingOrder(false)
                            if (newOrder?.id) {
                                router.push(`/order-tracking/${newOrder.id}`)
                            } else {
                                router.push('/')
                            }
                        } catch (e) {
                            setIsPlacingOrder(false)
                            Alert.alert('Error', 'Could not place order. Please try again.')
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
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 12,
                backgroundColor: '#FFFFFF',
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6',
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 24, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                        My Cart
                    </Text>
                    {totalCartItems > 0 && (
                        <View style={{
                            backgroundColor: '#FE8C0015',
                            paddingHorizontal: 10,
                            paddingVertical: 3,
                            borderRadius: 99,
                        }}>
                            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>
                                {totalCartItems} items
                            </Text>
                        </View>
                    )}
                </View>

                {cartItems.length > 0 && (
                    <TouchableOpacity onPress={() => clearCart()} hitSlop={8}>
                        <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#EF4444' }}>
                            Clear
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {cartItems.length === 0 ? (
                /* Empty Cart State */
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
                    <Image
                        source={images.emptyState}
                        style={{ width: 180, height: 180 }}
                        resizeMode="contain"
                    />
                    <Text style={{ fontSize: 20, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginTop: 20 }}>
                        Your cart is empty
                    </Text>
                    <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Regular', color: '#9CA3AF', textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
                        Looks like you haven't added any delicious meals yet.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/search')}
                        activeOpacity={0.85}
                        style={{
                            marginTop: 24,
                            backgroundColor: '#FE8C00',
                            borderRadius: 99,
                            paddingHorizontal: 28,
                            paddingVertical: 14,
                            shadowColor: '#FE8C00',
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                            elevation: 3,
                        }}
                    >
                        <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#FFFFFF' }}>
                            Explore Menu
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                /* Cart Items List & Checkout */
                <FlatList
                    data={cartItems}
                    keyExtractor={(ci) => ci.item.$id}
                    contentContainerStyle={{ paddingBottom: 140, paddingTop: 16 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item: ci }) => (
                        <View style={{
                            backgroundColor: '#FFFFFF',
                            marginHorizontal: 16,
                            marginBottom: 12,
                            borderRadius: 20,
                            padding: 14,
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#F3F4F6',
                            shadowColor: '#000',
                            shadowOpacity: 0.03,
                            shadowRadius: 8,
                            elevation: 1,
                        }}>
                            {/* Food Thumbnail */}
                            <Image
                                source={{ uri: ci.item.image_url }}
                                style={{ width: 70, height: 70, borderRadius: 14, backgroundColor: '#F9FAFB' }}
                                resizeMode="contain"
                            />

                            {/* Info */}
                            <View style={{ flex: 1, marginLeft: 12, paddingRight: 4 }}>
                                <Text numberOfLines={1} style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                                    {ci.item.name}
                                </Text>
                                <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#FE8C00', marginTop: 4 }}>
                                    KES {(ci.item.price ?? 0).toLocaleString()}
                                </Text>
                            </View>

                            {/* Stepper + Delete */}
                            <View style={{ alignItems: 'flex-end', gap: 10 }}>
                                <TouchableOpacity
                                    onPress={() => removeFromCart(ci.item.$id)}
                                    hitSlop={8}
                                >
                                    <Image source={images.trash} style={{ width: 16, height: 16 }} resizeMode="contain" tintColor="#9CA3AF" />
                                </TouchableOpacity>

                                <View style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    backgroundColor: '#F9FAFB',
                                    borderRadius: 99,
                                    paddingHorizontal: 6,
                                    paddingVertical: 4,
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    gap: 8,
                                }}>
                                    <TouchableOpacity
                                        onPress={() => updateQuantity(ci.item.$id, ci.quantity - 1)}
                                        activeOpacity={0.7}
                                        style={{
                                            width: 26,
                                            height: 26,
                                            borderRadius: 13,
                                            backgroundColor: '#FFFFFF',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderWidth: 1,
                                            borderColor: '#E5E7EB',
                                        }}
                                    >
                                        <Image source={images.minus} style={{ width: 10, height: 10 }} resizeMode="contain" tintColor="#FE8C00" />
                                    </TouchableOpacity>

                                    <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', minWidth: 14, textAlign: 'center' }}>
                                        {ci.quantity}
                                    </Text>

                                    <TouchableOpacity
                                        onPress={() => updateQuantity(ci.item.$id, ci.quantity + 1)}
                                        activeOpacity={0.7}
                                        style={{
                                            width: 26,
                                            height: 26,
                                            borderRadius: 13,
                                            backgroundColor: '#FE8C00',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Image source={images.plus} style={{ width: 10, height: 10 }} resizeMode="contain" tintColor="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                    ListFooterComponent={() => (
                        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
                            {/* Special Note / Delivery Instructions */}
                            <View style={{
                                backgroundColor: '#FFFFFF',
                                borderRadius: 20,
                                padding: 16,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: '#F3F4F6',
                            }}>
                                <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginBottom: 8 }}>
                                    Delivery Instructions (Optional)
                                </Text>
                                <TextInput
                                    style={{
                                        backgroundColor: '#F9FAFB',
                                        borderRadius: 12,
                                        paddingHorizontal: 14,
                                        paddingVertical: 10,
                                        fontSize: 13,
                                        fontFamily: 'QuickSand-Regular',
                                        color: '#1C1C2E',
                                        borderWidth: 1,
                                        borderColor: '#E5E7EB',
                                    }}
                                    placeholder="e.g. Please leave at front door, extra cutlery..."
                                    placeholderTextColor="#9CA3AF"
                                    value={note}
                                    onChangeText={setNote}
                                />
                            </View>

                            {/* Summary Card */}
                            <View style={{
                                backgroundColor: '#FFFFFF',
                                borderRadius: 20,
                                padding: 18,
                                borderWidth: 1,
                                borderColor: '#F3F4F6',
                                shadowColor: '#000',
                                shadowOpacity: 0.03,
                                shadowRadius: 8,
                                elevation: 1,
                            }}>
                                <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginBottom: 14 }}>
                                    Bill Summary
                                </Text>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Medium', color: '#6B7280' }}>Item Subtotal</Text>
                                    <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                                        KES {totalCartPrice.toLocaleString()}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Medium', color: '#6B7280' }}>Delivery Fee</Text>
                                    <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: deliveryFee === 0 ? '#22C55E' : '#1C1C2E' }}>
                                        {deliveryFee === 0 ? 'FREE' : `KES ${deliveryFee}`}
                                    </Text>
                                </View>

                                <View style={{ height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 }} />

                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>Grand Total</Text>
                                    <Text style={{ fontSize: 20, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>
                                        KES {grandTotal.toLocaleString()}
                                    </Text>
                                </View>

                                {/* Place Order Button */}
                                <TouchableOpacity
                                    onPress={handleCheckout}
                                    disabled={isPlacingOrder}
                                    activeOpacity={0.85}
                                    style={{
                                        backgroundColor: '#FE8C00',
                                        borderRadius: 99,
                                        paddingVertical: 16,
                                        marginTop: 20,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 10,
                                        shadowColor: '#FE8C00',
                                        shadowOpacity: 0.3,
                                        shadowRadius: 8,
                                        elevation: 4,
                                    }}
                                >
                                    <Image source={images.bag} style={{ width: 18, height: 18 }} resizeMode="contain" tintColor="#FFFFFF" />
                                    <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#FFFFFF' }}>
                                        {isPlacingOrder ? 'Processing...' : `Place Order · KES ${grandTotal.toLocaleString()}`}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    )
}