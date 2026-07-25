import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
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
import { createMenuItem, getCategories, uploadImageFile } from '../../../lib/appwrite'

const SAMPLE_FOOD_IMAGES = [
    { label: 'Burger 1', url: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png' },
    { label: 'Burger 2', url: 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png' },
    { label: 'Pizza 1', url: 'https://cdn-icons-png.flaticon.com/512/3595/3595455.png' },
    { label: 'Pizza 2', url: 'https://cdn-icons-png.flaticon.com/512/1404/1404945.png' },
    { label: 'Fries', url: 'https://cdn-icons-png.flaticon.com/512/1046/1046786.png' },
    { label: 'Wrap/Burrito', url: 'https://cdn-icons-png.flaticon.com/512/590/590685.png' },
]

export default function AddProduct() {
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [description, setDescription] = useState('')
    const [imageUrl, setImageUrl] = useState(SAMPLE_FOOD_IMAGES[0].url)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [calories, setCalories] = useState('')
    const [protein, setProtein] = useState('')

    const [categories, setCategories] = useState([])
    const [isLoadingCategories, setIsLoadingCategories] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)

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

                // Upload file to Appwrite Storage
                const fileUrl = await uploadImageFile(
                    selectedAsset.uri,
                    selectedAsset.fileName || `product_${Date.now()}.jpg`,
                    selectedAsset.mimeType || 'image/jpeg'
                )

                setImageUrl(fileUrl)
                Alert.alert('Image Uploaded', 'Product image uploaded successfully to Appwrite Storage.')
            }
        } catch (error) {
            console.error('Pick/upload image error:', error)
            Alert.alert('Upload Failed', error.message || 'Could not upload image. You can still use a sample or URL.')
        } finally {
            setIsUploadingImage(false)
        }
    }

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const docs = await getCategories()
                setCategories(docs)
                if (docs && docs.length > 0) {
                    setSelectedCategory(docs[0].$id)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setIsLoadingCategories(false)
            }
        }
        fetchCats()
    }, [])

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Please enter a product name.')
            return
        }
        if (!price || isNaN(Number(price))) {
            Alert.alert('Validation Error', 'Please enter a valid price.')
            return
        }
        if (!selectedCategory) {
            Alert.alert('Validation Error', 'Please select a category.')
            return
        }

        setIsSubmitting(true)
        try {
            await createMenuItem({
                name: name.trim(),
                description: description.trim(),
                price: Number(price),
                categoryId: selectedCategory,
                image_url: imageUrl,
                calories: calories ? Number(calories) : undefined,
                protein: protein ? Number(protein) : undefined,
            })

            Alert.alert(
                'Success',
                `"${name}" has been added to the menu!`,
                [
                    {
                        text: 'Add Another',
                        onPress: () => {
                            setName('')
                            setPrice('')
                            setDescription('')
                            setCalories('')
                            setProtein('')
                        },
                    },
                    {
                        text: 'Manage Products',
                        onPress: () => router.replace('/admin/products'),
                    },
                ]
            )
        } catch (error) {
            Alert.alert('Error', error.message || 'Failed to create product.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: 14,
                backgroundColor: '#FFFFFF',
                borderBottomWidth: 1,
                borderBottomColor: '#F3F4F6',
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
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

                    <Text style={{ fontSize: 20, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
                        Add New Product
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
                            <Image source={{ uri: imageUrl }} style={{ width: 90, height: 90 }} resizeMode="contain" />
                        )}
                    </View>

                    {/* Upload from Device Gallery Button */}
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
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                            fontSize: 12,
                            fontFamily: 'QuickSand-Regular',
                            color: '#1C1C2E',
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                            marginTop: 12,
                        }}
                        placeholder="Or paste custom Image URL..."
                        placeholderTextColor="#9CA3AF"
                        value={imageUrl}
                        onChangeText={setImageUrl}
                    />
                </View>

                {/* Form Fields */}
                <View style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 20,
                    padding: 18,
                    gap: 16,
                    borderWidth: 1,
                    borderColor: '#F3F4F6',
                }}>
                    {/* Dish Name */}
                    <View>
                        <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginBottom: 6 }}>
                            Dish Name *
                        </Text>
                        <TextInput
                            style={{
                                backgroundColor: '#F9FAFB',
                                borderRadius: 12,
                                paddingHorizontal: 14,
                                paddingVertical: 12,
                                fontSize: 14,
                                fontFamily: 'QuickSand-Medium',
                                color: '#1C1C2E',
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                            }}
                            placeholder="e.g. Classic Beef Burger"
                            placeholderTextColor="#9CA3AF"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Price */}
                    <View>
                        <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginBottom: 6 }}>
                            Price (KES) *
                        </Text>
                        <TextInput
                            style={{
                                backgroundColor: '#F9FAFB',
                                borderRadius: 12,
                                paddingHorizontal: 14,
                                paddingVertical: 12,
                                fontSize: 14,
                                fontFamily: 'QuickSand-Medium',
                                color: '#1C1C2E',
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                            }}
                            placeholder="e.g. 750"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            value={price}
                            onChangeText={setPrice}
                        />
                    </View>

                    {/* Category Selector */}
                    <View>
                        <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginBottom: 8 }}>
                            Category *
                        </Text>

                        {isLoadingCategories ? (
                            <ActivityIndicator size="small" color="#FE8C00" />
                        ) : (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                {categories.map((cat) => {
                                    const isSelected = selectedCategory === cat.$id
                                    return (
                                        <TouchableOpacity
                                            key={cat.$id}
                                            onPress={() => setSelectedCategory(cat.$id)}
                                            style={{
                                                paddingHorizontal: 16,
                                                paddingVertical: 10,
                                                borderRadius: 99,
                                                backgroundColor: isSelected ? '#FE8C00' : '#F3F4F6',
                                            }}
                                        >
                                            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: isSelected ? '#FFF' : '#6B7280' }}>
                                                {cat.name}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </ScrollView>
                        )}
                    </View>

                    {/* Description */}
                    <View>
                        <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginBottom: 6 }}>
                            Description
                        </Text>
                        <TextInput
                            style={{
                                backgroundColor: '#F9FAFB',
                                borderRadius: 12,
                                paddingHorizontal: 14,
                                paddingVertical: 12,
                                fontSize: 13,
                                fontFamily: 'QuickSand-Regular',
                                color: '#1C1C2E',
                                borderWidth: 1,
                                borderColor: '#E5E7EB',
                                minHeight: 80,
                                textAlignVertical: 'top',
                            }}
                            placeholder="Juicy flame-grilled beef patty with fresh lettuce, tomatoes..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={3}
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    {/* Optional Calories & Protein Row */}
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', marginBottom: 4 }}>
                                Calories (Optional)
                            </Text>
                            <TextInput
                                style={{
                                    backgroundColor: '#F9FAFB',
                                    borderRadius: 12,
                                    paddingHorizontal: 14,
                                    paddingVertical: 10,
                                    fontSize: 13,
                                    fontFamily: 'QuickSand-Regular',
                                    color: '#1C1C2E',
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                }}
                                placeholder="e.g. 550"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                value={calories}
                                onChangeText={setCalories}
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', marginBottom: 4 }}>
                                Protein (Optional)
                            </Text>
                            <TextInput
                                style={{
                                    backgroundColor: '#F9FAFB',
                                    borderRadius: 12,
                                    paddingHorizontal: 14,
                                    paddingVertical: 10,
                                    fontSize: 13,
                                    fontFamily: 'QuickSand-Regular',
                                    color: '#1C1C2E',
                                    borderWidth: 1,
                                    borderColor: '#E5E7EB',
                                }}
                                placeholder="e.g. 24"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                value={protein}
                                onChangeText={setProtein}
                            />
                        </View>
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    activeOpacity={0.85}
                    style={{
                        backgroundColor: '#FE8C00',
                        borderRadius: 99,
                        paddingVertical: 16,
                        marginTop: 20,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        shadowColor: '#FE8C00',
                        shadowOpacity: 0.25,
                        shadowRadius: 8,
                        elevation: 3,
                    }}
                >
                    <Image source={images.plus} style={{ width: 16, height: 16 }} resizeMode="contain" tintColor="#FFFFFF" />
                    <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#FFFFFF' }}>
                        {isSubmitting ? 'Creating Product...' : 'Add Product to Menu'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    )
}
