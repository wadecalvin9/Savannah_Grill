import { Link, router } from 'expo-router'
import { useState } from 'react'
import { Alert, Text, View } from 'react-native'
import CustomButton from "../../../components/CustomButton"
import CustomInput from "../../../components/CustomInput"
import { useGlobalContext } from '../../context/GlobalProvider'
import { createUser, getCurrentUser } from '../../../lib/appwrite'

export default function sign_up() {
    const { setIsLoggedIn, setUser, setUserRole } = useGlobalContext()

    const [isSubmiting, setSubmiting] = useState(false)
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: ''
    })
    const submit = async () => {

        const { name, email, password } = form
        if (!form.email || !form.password || !form.name) return Alert.alert("Error", 'Please Enter Valid Username,  Email Address & Password')
        setSubmiting(true)
        try {
            await createUser({ name, email, password })
            const res = await getCurrentUser()
            setUser(res)
            setIsLoggedIn(true)
            // New accounts are always 'customer' — reset any stale role state
            setUserRole('customer')
            router.replace('/')
        } catch (error) {
            Alert.alert("Error", error.message || "Error Signing Up")
        } finally {
            setSubmiting(false)
        }
    }
    return (
        <View className="bg-white gap-10 rounded-lg p-5 mt-5">
            <CustomInput
                placeholder="Enter your username"
                value={form.name}
                onChangeText={(value) => {
                    setForm({
                        ...form, name: value
                    })
                }}
                label="Name"
            />
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
                onChangeText={(text) => {
                    setForm({
                        ...form, password: text
                    })
                }}

                label="Password"
                secureTextEntry={true}

            />
            <CustomButton
                title="Sign Up"
                onPress={submit}
                isLoading={isSubmiting}
            />
            <View className="flex-row items-center justify-center gap-1 mt-2">
                <Text className="base-regular text-gray-100">
                    Already have an account?
                </Text>
                <Link href='sign-in'>
                    <Text className='base-bold text-primary'>Sign In</Text>
                </Link>
            </View>
        </View>
    )
}