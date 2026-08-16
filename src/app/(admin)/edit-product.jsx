import * as ImagePicker from 'expo-image-picker'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../../constants'
import { getCategories, getMenuItem, updateMenuItem, uploadImageFile } from '../../../lib/appwrite'

const SAMPLE_FOOD_IMAGES = [
    { label: 'Burger 1', url: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png' },
    { label: 'Burger 2', url: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png' },
    { label: 'Pizza 1', url: 'https://cdn-icons-png.flaticon.com/512/3595/3595455.png' },
    { label: 'Pizza 2', url: 'https://cdn-icons-png.flaticon.com/512/1404/1404945.png' },
    { label: 'Fries', url: 'https://cdn-icons-png.flaticon.com/512/1046/1046786.png' },
    { label: 'Wrap/Burrito', url: 'https://cdn-icons-png.flaticon.com/512/590/590685.png' },
]

export default function EditProduct() {
    const { id } = useLocalSearchParams()

    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [description, setDescription] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [calories, setCalories] = useState('')
    const [protein, setProtein] = useState('')

    const [categories, setCategories] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            try {
                const [cats, item] = await Promise.all([
                    getCategories(),
                    getMenuItem(id),
                ])
                setCategories(cats || [])

                if (item) {
                    setName(item.name || '')
                    setPrice(item.price ? String(item.price) : '')
                    setDescription(item.description || '')
                    setImageUrl(item.image_url || '')
                    setSelectedCategory(item.categories?.$id || cats[0]?.$id || '')
                    setCalories(item.calories ? String(item.calories) : '')
                    setProtein(item.protein ? String(item.protein) : '')
                }
            } catch (error) {
                console.error('Error loading item for edit:', error)
                Alert.alert('Error', 'Failed to load product details.')
            } finally {
                setIsLoading(false)
            }
        }
        if (id) loadData()
    }, [id])

    const pickImageFromDevice = async () => {
        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
            if (!permission.granted) {
                Alert.alert('Permission Denied', 'Permission to access gallery is required to pick an image.')
                return
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            })

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedAsset = result.assets[0]
                setIsUploadingImage(true)

                const fileUrl = await uploadImageFile(
                    selectedAsset.uri,
                    selectedAsset.fileName || `product_${Date.now()}.jpg`,
                    selectedAsset.mimeType || 'image/jpeg'
                )

                setImageUrl(fileUrl)
                Alert.alert('Image Uploaded', 'Updated product image saved to Appwrite Storage.')
            }
        } catch (error) {
            console.error('Pick/upload image error:', error)
            Alert.alert('Upload Failed', error.message || 'Could not upload image.')
        } finally {
            setIsUploadingImage(false)
        }
    }

    const handleSubmit = async () => {
        if (!name.trim()) return Alert.alert('Validation Error', 'Product Name is required.')
        if (!price || isNaN(Number(price))) return Alert.alert('Validation Error', 'Valid Price is required.')
        if (!selectedCategory) return Alert.alert('Validation Error', 'Category is required.')
        if (!imageUrl) return Alert.alert('Validation Error', 'Image URL is required.')

        setIsSubmitting(true)
        try {
            await updateMenuItem(id, {
                name: name.trim(),
                price: Number(price),
                description: description.trim(),
                categories: selectedCategory,
                image_url: imageUrl,
                calories: calories ? Number(calories) : null,
                protein: protein ? Number(protein) : null,
            })

            Alert.alert('Success', `"${name.trim()}" has been updated successfully!`, [
                { text: 'OK', onPress: () => router.canGoBack() ? router.back() : router.replace('/admin/products') }
            ])
        } catch (error) {
            console.error('Failed to update menuItem:', error)
            Alert.alert('Update Failed', error.message || 'Could not save product changes.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#FE8C00" />
                <Text style={{ marginTop: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>Loading product details...</Text>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 14,
                backgroundColor: '#FFFFFF',
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6',
                gap: 12,
            }}>
                <TouchableOpacity
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/admin/products')}
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: '#F9FAFB',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                    }}
                >
                    <Image source={images.arrowBack} style={{ width: 16, height: 16 }} resizeMode="contain" tintColor="#1C1C2E" />
                </TouchableOpacity>

                <View>
                    <Text style={{ fontSize: 20, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                        Edit Product
                    </Text>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
                {/* Image Preview & Picker */}
                <View style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    padding: 16,
                    alignItems: 'center',
                    marginBottom: 20,
                    borderWidth: 1,
                    borderColor: '#F3F4F6',
                }}>
                    <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
                        Product Image Preview
                    </Text>

                    <View style={{
                        width: 120,
                        height: 120,
                        borderRadius: 20,
                        backgroundColor: '#F9FAFB',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 14,
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                    }}>
                        {isUploadingImage ? (
                            <ActivityIndicator size="small" color="#FE8C00" />
                        ) : (
                            <Image source={{ uri: imageUrl || 'https://via.placeholder.com/150' }} style={{ width: 90, height: 90 }} resizeMode="contain" />
                        )}
                    </View>

                    {/* Upload from Device Button */}
                    <TouchableOpacity
                        onPress={pickImageFromDevice}
                        disabled={isUploadingImage}
                        activeOpacity={0.8}
                        style={{
                            backgroundColor: '#1C1C2E',
                            paddingHorizontal: 18,
                            paddingVertical: 11,
                            borderRadius: 99,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 14,
                        }}
                    >
                        <Image source={images.plus} style={{ width: 14, height: 14 }} resizeMode="contain" tintColor="#FFFFFF" />
                        <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#FFFFFF' }}>
                            {isUploadingImage ? 'Uploading Image...' : 'Choose Photo from Device'}
                        </Text>
                    </TouchableOpacity>

                    <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginBottom: 8 }}>
                        Or Select Preset Sample Icon:
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                        {SAMPLE_FOOD_IMAGES.map((img, idx) => (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => setImageUrl(img.url)}
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 99,
                                    backgroundColor: imageUrl === img.url ? '#FE8C00' : '#F3F4F6',
                                }}
                            >
                                <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Bold', color: imageUrl === img.url ? '#FFF' : '#6B7280' }}>
                                    {img.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Custom Image URL */}
                    <TextInput
                        style={{
                            width: '100%',
                            backgroundColor: '#F9FAFB',
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                            fontSize: 12,
                            fontFamily: 'QuickSand-Medium',
                            color: '#1C1C2E',
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                            marginTop: 12,
                        }}
                        placeholder="Or enter direct Image URL..."
                        placeholderTextColor="#9CA3AF"
                        value={imageUrl}
                        onChangeText={setImageUrl}
                    />
                </View>

                {/* Main Product Info Form */}
                <View style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    padding: 18,
                    gap: 16,
                    borderWidth: 1,
                    borderColor: '#F3F4F6',
                }}>
                    {/* Name */}
                    <View>
                        <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#374151', marginBottom: 6 }}>
                            Product Name *
                        </Text>
                        <TextInput
                            style={{
                                backgroundColor: '#F9FAFB',
                                borderRadius: 14,
                                paddingHorizontal: 14,
                                paddingVertical: 12,
                                fontSize: 14,
                                fontFamily: 'QuickSand-Medium',
                                color: '#1C1C2E',
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                            }}
                            placeholder="e.g. Flame Grill Burger"
                            placeholderTextColor="#9CA3AF"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Price */}
                    <View>
                        <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#374151', marginBottom: 6 }}>
                            Price (KES) *
                        </Text>
                        <TextInput
                            style={{
                                backgroundColor: '#F9FAFB',
                                borderRadius: 14,
                                paddingHorizontal: 14,
                                paddingVertical: 12,
                                fontSize: 14,
                                fontFamily: 'QuickSand-Medium',
                                color: '#1C1C2E',
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                            }}
                            placeholder="e.g. 650"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={price}
                            onChangeText={setPrice}
                        />
                    </View>

                    {/* Category Selection */}
                    <View>
                        <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#374151', marginBottom: 6 }}>
                            Category *
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                            {categories.map((cat) => {
                                const isSel = selectedCategory === cat.$id
                                return (
                                    <TouchableOpacity
                                        key={cat.$id}
                                        onPress={() => setSelectedCategory(cat.$id)}
                                        style={{
                                            paddingHorizontal: 14,
                                            paddingVertical: 8,
                                            borderRadius: 12,
                                            backgroundColor: isSel ? '#FE8C00' : '#F3F4F6',
                                            borderWidth: 1,
                                            borderColor: isSel ? '#FE8C00' : '#E5E7EB',
                                        }}
                                    >
                                        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: isSel ? '#FFF' : '#4B5563' }}>
                                            {cat.name}
                                        </Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>
                    </View>

                    {/* Description */}
                    <View>
                        <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#374151', marginBottom: 6 }}>
                            Description
                        </Text>
                        <TextInput
                            style={{
                                backgroundColor: '#F9FAFB',
                                borderRadius: 14,
                                paddingHorizontal: 14,
                                paddingVertical: 12,
                                fontSize: 14,
                                fontFamily: 'QuickSand-Medium',
                                color: '#1C1C2E',
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                                minHeight: 80,
                                textAlignVertical: 'top',
                            }}
                            placeholder="Describe ingredients, taste, etc..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={3}
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    {/* Nutritional Info (Calories & Protein) */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#6B7280', marginBottom: 6 }}>
                                Calories (kcal)
                            </Text>
                            <TextInput
                                style={{
                                    backgroundColor: '#F9FAFB',
                                    borderRadius: 12,
                                    paddingHorizontal: 12,
                                    paddingVertical: 10,
                                    fontSize: 13,
                                    fontFamily: 'QuickSand-Medium',
                                    color: '#1C1C2E',
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                }}
                                placeholder="e.g. 520"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                value={calories}
                                onChangeText={setCalories}
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#6B7280', marginBottom: 6 }}>
                                Protein (g)
                            </Text>
                            <TextInput
                                style={{
                                    backgroundColor: '#F9FAFB',
                                    borderRadius: 12,
                                    paddingHorizontal: 12,
                                    paddingVertical: 10,
                                    fontSize: 13,
                                    fontFamily: 'QuickSand-Medium',
                                    color: '#1C1C2E',
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                }}
                                placeholder="e.g. 35"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                value={protein}
                                onChangeText={setProtein}
                            />
                        </View>
                    </View>
                </View>

                {/* Save Changes Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    activeOpacity={0.85}
                    style={{
                        backgroundColor: '#FE8C00',
                        borderRadius: 18,
                        paddingVertical: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 24,
                        shadowColor: '#FE8C00',
                        shadowOpacity: 0.3,
                        shadowRadius: 10,
                        elevation: 5,
                    }}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Image source={images.check} style={{ width: 16, height: 16 }} resizeMode="contain" tintColor="#FFFFFF" />
                            <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#FFFFFF' }}>
                                Save Changes
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}
