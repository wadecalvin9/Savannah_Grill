import { router } from 'expo-router'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { images } from '../constants'
import { useGlobalContext } from '../src/context/GlobalProvider'

const MenuCard = ({ item }) => {
    const { addToCart } = useGlobalContext()
    const handlePress = () => router.push(`/menu/${item.$id}`)

    const handleQuickAdd = (e) => {
        e.stopPropagation?.()
        addToCart(item, 1)
    }

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.85}
            style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 20,
                paddingTop: 50,
                paddingBottom: 14,
                paddingHorizontal: 12,
                marginBottom: 16,
                marginHorizontal: 4,
                borderWidth: 1,
                borderColor: '#F3F4F6',
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
                position: 'relative',
                alignItems: 'center',
            }}
        >
            {/* Floating food image */}
            <Image
                source={{ uri: item.image_url }}
                style={{
                    width: 110,
                    height: 110,
                    position: 'absolute',
                    top: -40,
                    alignSelf: 'center',
                }}
                resizeMode="contain"
            />

            {/* Quick Add Button */}
            <TouchableOpacity
                onPress={handleQuickAdd}
                activeOpacity={0.8}
                style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: '#FE8C00',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#FE8C00',
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3,
                    zIndex: 10,
                }}
            >
                <Image source={images.plus} style={{ width: 12, height: 12 }} resizeMode="contain" tintColor="#FFFFFF" />
            </TouchableOpacity>

            {/* Dish Name */}
            <Text
                numberOfLines={1}
                style={{
                    fontSize: 14,
                    fontFamily: 'QuickSand-Bold',
                    color: '#1C1C2E',
                    textAlign: 'center',
                    marginTop: 16,
                    width: '100%',
                }}
            >
                {item.name}
            </Text>

            {/* Description */}
            <Text
                numberOfLines={2}
                style={{
                    fontSize: 12,
                    fontFamily: 'QuickSand-Regular',
                    color: '#9CA3AF',
                    textAlign: 'center',
                    lineHeight: 16,
                    marginTop: 4,
                }}
            >
                {item.description}
            </Text>

            {/* Rating & Price */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                marginTop: 10,
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Image
                        source={images.star}
                        style={{ width: 14, height: 14 }}
                        resizeMode="contain"
                        tintColor="#FE8C00"
                    />
                    <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>
                        {item.rating ?? '—'}
                    </Text>
                </View>
                <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>
                    KES {item.price?.toLocaleString()}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

export default MenuCard
