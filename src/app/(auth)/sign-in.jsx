import { Link, router } from 'expo-router'
import { useState } from 'react'
import { Alert, Text, View } from 'react-native'
import CustomButton from "../../../components/CustomButton"
import CustomInput from "../../../components/CustomInput"
import { useGlobalContext } from '../../context/GlobalProvider'
import { getCurrentUser, signin } from '../../../lib/appwrite'

export default function sign_in() {
    const { setIsLoggedIn, setUser, setUserRole } = useGlobalContext()

    const [isSubmiting, setSubmiting] = useState(false)
    const [form, setForm] = useState({
        email: '',
        password: ''
    })
    const submit = async () => {
        if (!form.email || !form.password) return Alert.alert("Error", 'Please Enter Valid Email Address & Password')

        setSubmiting(true)
        try {
            await signin({ email: form.email, password: form.password })
            const res = await getCurrentUser()
            setUser(res)
            setIsLoggedIn(true)
            setUserRole(res?.role || 'customer')

            // Role-based navigation
            const role = res?.role || 'customer'
            if (role === 'rider') {
                router.replace('/(rider)/dashboard')
            } else if (role === 'admin') {
                router.replace('/admin')
            } else {
                router.replace('/')
            }
        } catch (error) {
            Alert.alert("Error", error.message || "Error Signing in")
        } finally {
            setSubmiting(false)
        }
    }

    return (
        <View className="bg-white gap-10 rounded-lg p-5 mt-5">

            <CustomInput
                placeholder="Enter your email"
                value={form.email}
                onChangeText={(value) => {
                    setForm({
                        ...form, email: value
                    })
                }}

                label="Email"
                keyboardType="email-address"

            />
            <CustomInput
                placeholder="Enter your password"
                value={form.password}
                onChangeText={(value) => setForm({

                    ...form, password: value
                })


                }

                label="Password"
                secureTextEntry={true}

            />
            <CustomButton
                title="Sign In"
                onPress={submit}
                isLoading={isSubmiting}
            />

            <View className="flex-row items-center justify-center gap-1 mt-2">
                <Text className="base-regular text-gray-100">
                    Don't have an account?
                </Text>
                <Link href='sign-up'>
                    <Text className='base-bold text-primary'>Sign Up</Text>
                </Link>
            </View>
        </View>
    )
}