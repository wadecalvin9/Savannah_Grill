import { router } from 'expo-router'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { images } from '../constants'
import { useGlobalContext } from '../src/context/GlobalProvider'

const Cartbutton = () => {
    const { totalCartItems } = useGlobalContext()

    return (
        <TouchableOpacity
            onPress={() => router.push('/cart')}
            activeOpacity={0.8}
            className='cart-btn'
        >
            <Image source={images.bag} className='size-5' resizeMode='contain' tintColor="#FFFFFF" />
            {totalCartItems > 0 && (
                <View className='cart-badge'>
                    <Text className='small-bold text-white'>{totalCartItems}</Text>
                </View>
            )}
        </TouchableOpacity>
    )
}

export default Cartbutton