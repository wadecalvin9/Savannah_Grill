import { Link, router } from 'expo-router'
import { useState } from 'react'
import { Alert, Text, View } from 'react-native'
import CustomButton from "../../../components/CustomButton"
import CustomInput from "../../../components/CustomInput"
import { useGlobalContext } from '../../context/GlobalProvider'
import { getCurrentUser, signin } from '../../../lib/appwrite'

export default function SignIn() {
  const { setIsLoggedIn, setUser, setUserRole } = useGlobalContext()

  const [isSubmitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const submit = async () => {
    if (!form.email || !form.password) {
      return Alert.alert("Error", "Please enter a valid email and password")
    }

    setSubmitting(true)
    try {
      await signin({ email: form.email, password: form.password })
      const res = await getCurrentUser()
      setUser(res)
      setIsLoggedIn(true)
      const role = res?.role || 'customer'
      setUserRole(role)

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
      setSubmitting(false)
    }
  }

  return (
    <View className="w-full gap-6">
      <CustomInput
        label="Email"
        placeholder="Enter your email"
        value={form.email}
        onChangeText={(value) => setForm({ ...form, email: value })}
        keyboardType="email-address"
      />

      <CustomInput
        label="Password"
        placeholder="Enter your password"
        value={form.password}
        onChangeText={(value) => setForm({ ...form, password: value })}
        secureTextEntry
      />

      <CustomButton
        title="Sign In"
        onPress={submit}
        isLoading={isSubmitting}
        style="mt-2"
      />

      <View className="flex-row items-center justify-center gap-1 mt-4">
        <Text className="base-regular text-dark-100">
          Don't have an account?
        </Text>
        <Link href="/sign-up">
          <Text className="base-bold text-primary">Sign Up</Text>
        </Link>
      </View>
    </View>
  )
}