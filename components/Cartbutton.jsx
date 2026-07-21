import { Image, Text, TouchableOpacity, View } from 'react-native'
import { images } from '../constants'

const Cartbutton = () => {
    const totalItems = 10
    return (
        <TouchableOpacity className='cart-btn'>
            <Image source={images.bag} className='size-5' resizeMode='contain' />
            {totalItems > 0 && (
                <View className='cart-badge'>
                    <Text className='small-bold text-white'>{totalItems}</Text>
                </View>
            )}


        </TouchableOpacity>


    )
}

export default Cartbutton