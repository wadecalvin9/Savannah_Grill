import { Stack, Redirect, usePathname, useRouter } from 'expo-router'
import { useGlobalContext } from '../../context/GlobalProvider'
import { View, Text, TouchableOpacity, Platform, Image, ScrollView } from 'react-native'
import { images } from '../../../constants'
import { signOut } from '../../../lib/appwrite'

const isWeb = Platform.OS === 'web'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/(admin)/dashboard', match: 'dashboard' },
  { label: 'Products', href: '/(admin)/products', match: 'products' },
  { label: 'Orders', href: '/(admin)/orders', match: 'orders' },
  { label: 'Users', href: '/(admin)/users', match: 'users' },
]

function AdminSideNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { setUser, setIsLoggedIn, setUserRole } = useGlobalContext()

  const isActive = (match) => pathname?.includes(match)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (e) {}
    setUser(null)
    setIsLoggedIn(false)
    setUserRole('customer')
    router.replace('/')
  }

  return (
    <View style={{
      width: 240,
      backgroundColor: '#1C1C2E',
      paddingTop: 24,
      paddingBottom: 24,
      paddingHorizontal: 16,
      justifyContent: 'space-between',
    }}>
      {/* Brand */}
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32, paddingHorizontal: 8 }}>
          <Image
            source={images.logo}
            style={{ width: 36, height: 36, borderRadius: 10 }}
            resizeMode="contain"
          />
          <View>
            <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#FFFFFF' }}>Savannah Grill</Text>
            <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>Admin Portal</Text>
          </View>
        </View>

        {/* Nav links */}
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.match)
          return (
            <TouchableOpacity
              key={item.label}
              onPress={() => router.push(item.href)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 12,
                marginBottom: 4,
                backgroundColor: active ? '#FE8C00' : 'transparent',
              }}
            >
              <Text style={{
                fontSize: 14,
                fontFamily: active ? 'QuickSand-Bold' : 'QuickSand-Medium',
                color: active ? '#FFFFFF' : '#D1D5DB',
              }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        onPress={handleSignOut}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 12,
          backgroundColor: '#EF444415',
          marginTop: 20,
        }}
      >
        <Text style={{ fontSize: 14, fontFamily: 'QuickSand-Bold', color: '#EF4444' }}>
          Sign Out
        </Text>
      </TouchableOpacity>
    </View>
  )
}

function AdminMobileHeader() {
  const router = useRouter()
  const { setUser, setIsLoggedIn, setUserRole } = useGlobalContext()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (e) {}
    setUser(null)
    setIsLoggedIn(false)
    setUserRole('customer')
    router.replace('/')
  }

  return (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{
          width: 32, height: 32, borderRadius: 8,
          backgroundColor: '#FE8C00',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: '#fff', fontFamily: 'QuickSand-Bold', fontSize: 14 }}>S</Text>
        </View>
        <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>Admin</Text>
      </View>

      <TouchableOpacity onPress={handleSignOut} hitSlop={10}>
        <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#EF4444' }}>
          Sign Out
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default function AdminLayout() {
  const { user, isLoading } = useGlobalContext()

  if (!isLoading && (!user || user.role !== 'admin')) {
    return <Redirect href="/" />
  }

  return (
    <View style={{ flex: 1, flexDirection: isWeb ? 'row' : 'column', backgroundColor: '#FAFAFA' }}>
      {isWeb ? <AdminSideNav /> : <AdminMobileHeader />}

      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  )
}