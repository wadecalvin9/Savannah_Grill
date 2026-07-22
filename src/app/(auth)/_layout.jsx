import { Slot } from 'expo-router'
import { Dimensions, Image, ImageBackground, KeyboardAvoidingView, ScrollView, View } from 'react-native'
import { images } from "../../../constants/index"

export default function _layout() {
    return (
        <KeyboardAvoidingView behavior='height'>
            <ScrollView className=" bg-white h-full"
                keyboardShouldPersistTaps="handled">
                <View className="w-full relative" style={{ height: Dimensions.get('screen').height / 2.25 }}>
                    <ImageBackground source={images.loginGraphic} className="size-full rounded-b-lg" resizeMode='stretch' />
                    <Image source={images.logo} className="self-center size-40 absolute -bottom-7 z-10" />
                </View>
                <Slot />
            </ScrollView>

        </KeyboardAvoidingView>
    )
}