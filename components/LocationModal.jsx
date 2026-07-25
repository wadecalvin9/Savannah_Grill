import * as Location from 'expo-location'
import { useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { images } from '../constants'
import { useGlobalContext } from '../src/context/GlobalProvider'

const POPULAR_NEIGHBORHOODS = [
    { id: '1', name: 'Karen, Nairobi', tag: 'Popular' },
    { id: '2', name: 'Westlands, Nairobi', tag: 'Popular' },
    { id: '3', name: 'Kilimani, Nairobi', tag: 'Popular' },
    { id: '4', name: 'Lavington, Nairobi', tag: 'Popular' },
    { id: '5', name: 'Kileleshwa, Nairobi', tag: 'Popular' },
    { id: '6', name: 'Nairobi CBD', tag: 'Central' },
    { id: '7', name: 'Gigiri, Nairobi', tag: 'North' },
    { id: '8', name: 'Runda, Nairobi', tag: 'North' },
    { id: '9', name: 'Lang’ata, Nairobi', tag: 'South' },
    { id: '10', name: 'South C, Nairobi', tag: 'South' },
    { id: '11', name: 'Parklands, Nairobi', tag: 'North' },
]

export default function LocationModal({ visible, onClose }) {
    const { deliveryLocation, setDeliveryLocation } = useGlobalContext()
    const [customAddress, setCustomAddress] = useState('')
    const [isLocating, setIsLocating] = useState(false)

    const handleSelectLocation = (locName) => {
        setDeliveryLocation(locName)
        onClose()
    }

    const handleSaveCustom = () => {
        if (!customAddress.trim()) {
            Alert.alert('Required', 'Please enter a valid address or building name.')
            return
        }
        const fullAddr = customAddress.trim().includes('Nairobi')
            ? customAddress.trim()
            : `${customAddress.trim()}, Nairobi`
        setDeliveryLocation(fullAddr)
        setCustomAddress('')
        onClose()
    }

    const handleGPSDetect = async () => {
        setIsLocating(true)
        try {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'Location permission is required to detect your position automatically.'
                )
                setIsLocating(false)
                return
            }

            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            })

            const [address] = await Location.reverseGeocodeAsync({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            })

            if (address) {
                const parts = [
                    address.name || address.street,
                    address.district || address.subregion || address.city,
                    'Nairobi'
                ].filter(Boolean)
                const formatted = parts.join(', ')
                setDeliveryLocation(formatted || 'Karen, Nairobi')
            } else {
                setDeliveryLocation('Karen, Nairobi')
            }
            onClose()
        } catch (error) {
            console.error('GPS detect error:', error)
            Alert.alert('Location Error', 'Could not detect position. Please choose a neighborhood below.')
        } finally {
            setIsLocating(false)
        }
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={onClose}
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={{
                        backgroundColor: '#FFFFFF',
                        borderTopLeftRadius: 28,
                        borderTopRightRadius: 28,
                        paddingTop: 20,
                        paddingHorizontal: 20,
                        paddingBottom: 40,
                        maxHeight: '85%',
                    }}
                >
                    {/* Handle bar */}
                    <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 16 }} />

                    {/* Header */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <View>
                            <Text style={{ fontSize: 20, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                                Select Delivery Location
                            </Text>
                            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', marginTop: 2 }}>
                                Current: {deliveryLocation}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#6B7280' }}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* GPS Button */}
                    <TouchableOpacity
                        onPress={handleGPSDetect}
                        disabled={isLocating}
                        style={{
                            backgroundColor: '#FFF7ED',
                            borderWidth: 1,
                            borderColor: '#FED7AA',
                            borderRadius: 16,
                            paddingVertical: 14,
                            paddingHorizontal: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10,
                            marginBottom: 16,
                        }}
                    >
                        {isLocating ? (
                            <ActivityIndicator size="small" color="#FE8C00" />
                        ) : (
                            <Image source={images.location} style={{ width: 18, height: 18 }} resizeMode="contain" tintColor="#FE8C00" />
                        )}
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>
                                {isLocating ? 'Detecting your position...' : 'Use Current GPS Location'}
                            </Text>
                            <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Medium', color: '#F97316', marginTop: 1 }}>
                                Auto-detect via GPS coordinates
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Custom Address Input */}
                    <View style={{ marginBottom: 16 }}>
                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginBottom: 6 }}>
                            Or enter specific building / house:
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TextInput
                                placeholder="e.g. House 14, Acacia Court, Kilimani"
                                value={customAddress}
                                onChangeText={setCustomAddress}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#F9FAFB',
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                    borderRadius: 12,
                                    paddingHorizontal: 14,
                                    paddingVertical: 10,
                                    fontSize: 13,
                                    fontFamily: 'QuickSand-Medium',
                                    color: '#1C1C2E',
                                }}
                            />
                            <TouchableOpacity
                                onPress={handleSaveCustom}
                                style={{
                                    backgroundColor: '#FE8C00',
                                    borderRadius: 12,
                                    paddingHorizontal: 16,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#FFF' }}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Popular Neighborhoods List */}
                    <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
                        Popular Delivery Areas
                    </Text>

                    <FlatList
                        data={POPULAR_NEIGHBORHOODS}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => {
                            const isSelected = deliveryLocation === item.name
                            return (
                                <TouchableOpacity
                                    onPress={() => handleSelectLocation(item.name)}
                                    style={{
                                        paddingVertical: 12,
                                        paddingHorizontal: 14,
                                        borderRadius: 12,
                                        backgroundColor: isSelected ? '#FFF7ED' : '#FFFFFF',
                                        borderWidth: 1,
                                        borderColor: isSelected ? '#FED7AA' : '#F3F4F6',
                                        marginBottom: 8,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                        <Image
                                            source={images.location}
                                            style={{ width: 16, height: 16 }}
                                            resizeMode="contain"
                                            tintColor={isSelected ? '#FE8C00' : '#9CA3AF'}
                                        />
                                        <Text style={{ fontSize: 14, fontFamily: isSelected ? 'QuickSand-Bold' : 'QuickSand-Medium', color: isSelected ? '#FE8C00' : '#1C1C2E' }}>
                                            {item.name}
                                        </Text>
                                    </View>
                                    {isSelected && (
                                        <Image source={images.check} style={{ width: 14, height: 14 }} resizeMode="contain" tintColor="#FE8C00" />
                                    )}
                                </TouchableOpacity>
                            )
                        }}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    )
}
