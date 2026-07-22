import cn from "clsx"
import { useState } from 'react'
import { Text, TextInput, View } from 'react-native'

const CustomInput = ({
    placeholder = "Enter text",
    value,
    onChangeText,
    label,
    secureTextEntry = false,
    keyboardType = "default"
}) => {
    const [isFocused, setFocused] = useState(false)

    return (
        <View className="w-full">
            <Text className="label">{label}</Text>
            <TextInput
                autoCapitalize='none'
                autoCorrect={false}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                placeholder={placeholder}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={cn('input', isFocused ? 'border-primary ' : 'border-gray-300')}
            />
        </View>
    )
}

export default CustomInput
