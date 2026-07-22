import cn from "clsx"
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
const CustomButton = ({
    onPress,
    title,
    style,
    textStyle,
    leftIcon,
    isLoading = false
}) => {
    return (
        <TouchableOpacity className={cn('custom-btn', style)} onPress={onPress}>
            {leftIcon}
            <View className="flex-center flex-row">

                {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                ) : (
                    <Text className={cn('text-white-100 paragraph-semibold', textStyle)}>{title}</Text>
                )}

            </View>

        </TouchableOpacity>
    )
}

export default CustomButton