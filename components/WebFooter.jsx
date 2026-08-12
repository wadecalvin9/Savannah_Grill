import { Ionicons, FontAwesome } from '@expo/vector-icons'
import { Image, Text, View, Pressable, useWindowDimensions, Platform } from 'react-native'
import { images } from '../constants'

const WebFooter = () => {
    const { width } = useWindowDimensions()
    const isNarrow = width < 900

    return (
        <View
            style={{
                // Full-bleed breakout (works inside FlatList on web)
                width: '100vw',
                marginLeft: 'calc(50% - 50vw)',
                backgroundColor: '#111827',
                paddingVertical: isNarrow ? 20 : 16,
                paddingHorizontal: isNarrow ? 20 : 40,
                marginTop: 28,
            }}
        >
            <View
                style={{
                    maxWidth: 1100,
                    width: '100%',
                    alignSelf: 'center',
                }}
            >
                {/* Top section */}
                <View
                    style={{
                        flexDirection: isNarrow ? 'column' : 'row',
                        alignItems: isNarrow ? 'flex-start' : 'flex-start',
                        justifyContent: 'space-between',
                        gap: isNarrow ? 24 : 16,
                    }}
                >
                    {/* Brand */}
                    <View style={{ minWidth: isNarrow ? '100%' : 180 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <Image
                                source={images.logo}
                                style={{ width: 26, height: 26 }}
                                resizeMode="contain"
                            />
                            <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'QuickSand-Bold' }}>
                                Savannah Grill
                            </Text>
                        </View>
                        <Text style={{ color: '#9CA3AF', fontSize: 12, fontFamily: 'QuickSand-Regular' }}>
                            Fresh flavours, delivered fast.
                        </Text>
                    </View>

                    {/* Contact + Location */}
                    <View
                        style={{
                            flexDirection: isNarrow ? 'column' : 'row',
                            gap: isNarrow ? 20 : 48,
                        }}
                    >
                        <View>
                            <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'QuickSand-SemiBold', marginBottom: 8 }}>
                                Contact
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                <Ionicons name="call-outline" size={13} color="#D1D5DB" />
                                <Text style={{ color: '#D1D5DB', fontSize: 13, fontFamily: 'QuickSand-Regular' }}>
                                    +254 123-4567
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Ionicons name="mail-outline" size={13} color="#D1D5DB" />
                                <Text style={{ color: '#D1D5DB', fontSize: 13, fontFamily: 'QuickSand-Regular' }}>
                                    support@savannahgrill.com
                                </Text>
                            </View>
                        </View>

                        <View>
                            <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'QuickSand-SemiBold', marginBottom: 8 }}>
                                Location
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                                <Ionicons name="location-outline" size={13} color="#D1D5DB" style={{ marginTop: 2 }} />
                                <Text style={{ color: '#D1D5DB', fontSize: 13, fontFamily: 'QuickSand-Regular', lineHeight: 18 }}>
                                    124 River Street{'\n'}Savannah, Nairobi
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Social */}
                    <View>
                        <Text style={{ color: '#FFFFFF', fontSize: 12, fontFamily: 'QuickSand-SemiBold', marginBottom: 8 }}>
                            Follow Us
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                            <Pressable
                                style={({ hovered }) => [
                                    { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 4, borderRadius: 8 },
                                    hovered && { backgroundColor: 'rgba(254, 140, 0, 0.18)' },
                                ]}
                            >
                                <FontAwesome name="instagram" size={15} color="#FE8C00" />
                                <Text style={{ fontFamily: 'QuickSand-Medium', fontSize: 12, color: '#D1D5DB' }}>
                                    @savannahgrill
                                </Text>
                            </Pressable>

                            <Pressable
                                style={({ hovered }) => [
                                    { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 4, borderRadius: 8 },
                                    hovered && { backgroundColor: 'rgba(254, 140, 0, 0.18)' },
                                ]}
                            >
                                <FontAwesome name="twitter" size={15} color="#FE8C00" />
                                <Text style={{ fontFamily: 'QuickSand-Medium', fontSize: 12, color: '#D1D5DB' }}>
                                    @savannahgrill
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* Copyright */}
                <View style={{ borderTopWidth: 1, borderTopColor: '#1F2937', marginTop: 16, paddingTop: 12 }}>
                    <Text style={{ color: '#6B7280', fontSize: 11, fontFamily: 'QuickSand-Regular', textAlign: 'center' }}>
                        © {new Date().getFullYear()} Savannah Grill. All rights reserved.
                    </Text>
                </View>
            </View>
        </View>
    )
}

export default WebFooter