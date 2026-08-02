import { Slot } from 'expo-router'
import {
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native'
import { images } from '../../../constants/index'

export default function AuthLayout() {
  const isWeb = Platform.OS === 'web'
  const screenHeight = Dimensions.get('window').height

  // ===== WEB VERSION (Frosted Card) =====
    if (isWeb) {
        return (
            <View style={{ flex: 1, width: '100%', height: '100%', position: 'relative' }}>
            {/* Full-bleed background – forces 100% coverage */}
            <ImageBackground
                source={images.loginGraphic}
                style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                }}
                resizeMode="cover"
            />

            {/* Subtle dark overlay */}
            <View
                style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.18)',
                }}
            />

            <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
                <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 40,
                    paddingHorizontal: 16,
                    minHeight: '100%',
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                >
                {/* Frosted Glass Card */}
                <View
                    className="w-full max-w-md rounded-3xl overflow-hidden"
                    style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.65)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 20 },
                    shadowOpacity: 0.22,
                    shadowRadius: 40,
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    }}
                >
                    <View className="px-8 pt-10 pb-8 items-center">
                    <Image
                        source={images.logo}
                        style={{ width: 120, height: 120, marginBottom: 28 }}
                        resizeMode="contain"
                    />
                    <View className="w-full">
                        <Slot />
                    </View>
                    </View>
                </View>
                </ScrollView>
            </KeyboardAvoidingView>
            </View>
        )
    }

  // ===== MOBILE VERSION (original style – unchanged) =====
  return (
    <KeyboardAvoidingView behavior="height" className="flex-1 bg-white">
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          className="w-full relative"
          style={{ height: screenHeight / 2.25 }}
        >
          <ImageBackground
            source={images.loginGraphic}
            className="size-full rounded-b-3xl"
            resizeMode="cover"
          />
          <Image
            source={images.logo}
            className="self-center absolute z-10"
            style={{ width: 160, height: 160, bottom: -30 }}
            resizeMode="contain"
          />
        </View>

        <View className="flex-1 w-full px-5 pt-12 pb-10">
          <Slot />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}