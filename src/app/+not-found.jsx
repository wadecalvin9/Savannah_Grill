import { Link, Stack, router } from 'expo-router'
import React from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../constants'

export default function NotFoundScreen() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Stack.Screen options={{ title: 'Not Found', headerShown: false }} />
            
            <Image
                source={images.emptyState}
                style={{ width: 180, height: 180, marginBottom: 20 }}
                resizeMode="contain"
            />

            <Text style={{ fontSize: 22, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', textAlign: 'center' }}>
                Page Not Found
            </Text>

            <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Regular', color: '#6B7280', textAlign: 'center', marginTop: 8, maxWidth: 280 }}>
                The page you are looking for doesn't exist or has moved.
            </Text>

            <TouchableOpacity
                onPress={() => router.replace('/(tabs)')}
                activeOpacity={0.85}
                style={{
                    marginTop: 24,
                    backgroundColor: '#FE8C00',
                    borderRadius: 99,
                    paddingHorizontal: 28,
                    paddingVertical: 14,
                    shadowColor: '#FE8C00',
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 3,
                }}
            >
                <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#FFFFFF' }}>
                    Back to Savannah Grill
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}
