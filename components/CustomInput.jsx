import cn from "clsx"
import { useState } from 'react'
import { Text, TextInput, View, TouchableOpacity } from 'react-native'

const CustomInput = ({
    placeholder = "Enter text",
    value,
    onChangeText,
    label,
    secureTextEntry = false,
    keyboardType = "default"
}) => {
    const [isFocused, setFocused] = useState(false)
    const [isPasswordVisible, setPasswordVisible] = useState(false)

    const isPassword = secureTextEntry

    return (
        <View className="w-full">
            <Text className="label">{label}</Text>

            <View className="relative">
                <TextInput
                    autoCapitalize='none'
                    autoCorrect={false}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={isPassword && !isPasswordVisible}
                    keyboardType={keyboardType}
                    placeholder={placeholder}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    className={cn(
                        'input',
                        isFocused ? 'border-primary' : 'border-gray-300',
                        isPassword && 'pr-12'          // leave space for the eye
                    )}
                />

                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setPasswordVisible(prev => !prev)}
                        activeOpacity={0.7}
                        style={{
                            position: 'absolute',
                            right: 14,
                            top: 0,
                            bottom: 0,
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={{
                            fontSize: 13,
                            fontFamily: 'QuickSand-Bold',
                            color: '#FE8C00',
                        }}>
                            {isPasswordVisible ? 'Hide' : 'Show'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

export default CustomInput