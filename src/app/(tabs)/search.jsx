import { useCallback, useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MenuCard from '../../../components/MenuCard'
import { images } from '../../../constants'
import { getMenu } from '../../../lib/appwrite'
import seed from '../../../lib/seed'

export default function Search() {
    const [query, setQuery] = useState('')
    const [menuItems, setMenuItems] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSeeding, setIsSeeding] = useState(false)
    const debounceRef = useRef(null)

    const fetchMenu = async (q = '') => {
        setIsLoading(true)
        try {
            const items = await getMenu({ query: q || undefined })
            setMenuItems(items)
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchMenu()
    }, [])

    const handleQueryChange = (text) => {
        setQuery(text)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            fetchMenu(text)
        }, 400)
    }

    const handleSeed = async () => {
        setIsSeeding(true)
        try {
            await seed()
            fetchMenu()
        } finally {
            setIsSeeding(false)
        }
    }

    const renderItem = useCallback(({ item }) => (
        <View style={{ flex: 1, maxWidth: '50%', paddingTop: 40 }}>
            <MenuCard item={item} />
        </View>
    ), [])

    const keyExtractor = useCallback((item) => item.$id, [])

    return (
        <SafeAreaView className="flex-1 bg-gray-50">

            <View className="px-4 pt-4 pb-2 bg-gray-50">
                <Text className="h3-bold text-dark-100 mb-3">Search Menu</Text>

                <View className="searchbar px-4 py-3 mb-3">
                    <Image
                        source={images.search}
                        className="size-5"
                        resizeMode="contain"
                        tintColor="#5D5F6D"
                    />
                    <TextInput
                        className="flex-1 paragraph-medium text-dark-100"
                        placeholder="Search dishes..."
                        placeholderTextColor="#9CA3AF"
                        value={query}
                        onChangeText={handleQueryChange}
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => { setQuery(''); fetchMenu('') }}>
                            <Text className="small-bold text-primary">Clear</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View className="flex-row items-center justify-between mb-1">
                    {menuItems.length > 0 && (
                        <Text className="paragraph-bold text-dark-100">
                            {query ? `Results for "${query}"` : 'All Items'}
                        </Text>
                    )}
                </View>
            </View>

            {/* Results */}
            <FlatList
                data={menuItems}
                keyExtractor={keyExtractor}
                numColumns={2}
                contentContainerStyle={{ paddingBottom: 120, paddingTop: 8 }}
                columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 8 }}
                renderItem={renderItem}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={() =>
                    isLoading ? (
                        <View className="flex-1 justify-center items-center py-20">
                            <ActivityIndicator size="large" color="#FE8C00" />
                        </View>
                    ) : (
                        <View className="flex-1 justify-center items-center py-20">
                            <Image source={images.emptyState} className="size-40" resizeMode="contain" />
                            <Text className="paragraph-bold text-gray-400 mt-4">No items found</Text>
                        </View>
                    )
                }
            />
        </SafeAreaView>
    )
}