import { Link, router } from 'expo-router'
import { useState } from 'react'
import { Alert, Text, View } from 'react-native'
import CustomButton from "../../../components/CustomButton"
import CustomInput from "../../../components/CustomInput"
import { useGlobalContext } from '../../context/GlobalProvider'
import { createUser, getCurrentUser } from '../../../lib/appwrite'

export default function SignUp() {
  const { setIsLoggedIn, setUser, setUserRole } = useGlobalContext()

  const [isSubmitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const submit = async () => {
    const { name, email, password, confirmPassword } = form

    if (!name || !email || !password || !confirmPassword) {
      return Alert.alert("Error", "Please fill in all fields")
    }

    if (password !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match")
    }

    if (password.length < 8) {
      return Alert.alert("Error", "Password must be at least 8 characters")
    }

    setSubmitting(true)
    try {
      await createUser({ name, email, password })
      const res = await getCurrentUser()
      setUser(res)
      setIsLoggedIn(true)
      setUserRole('customer')
      router.replace('/')
    } catch (error) {
      Alert.alert("Error", error.message || "Error Signing Up")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className="w-full gap-6">
      <CustomInput
        label="Name"
        placeholder="Enter your username"
        value={form.name}
        onChangeText={(value) => setForm({ ...form, name: value })}
      />

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

      <CustomInput
        label="Confirm Password"
        placeholder="Re-enter your password"
        value={form.confirmPassword}
        onChangeText={(value) => setForm({ ...form, confirmPassword: value })}
        secureTextEntry
      />
      
      <CustomButton
        title="Sign Up"
        onPress={submit}
        isLoading={isSubmitting}
        style="mt-2"
      />

      <View className="flex-row items-center justify-center gap-1 mt-4">
        <Text className="base-regular text-dark-100">
          Already have an account?
        </Text>
        <Link href="/sign-in">
          <Text className="base-bold text-primary">Sign In</Text>
        </Link>
      </View>
    </View>
  )
}