import { router } from 'expo-router'
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../../constants'
import { signOut } from '../../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'

const COLORS = {
  background: '#FAFAFA',
  white: '#FFFFFF',
  primary: '#FE8C00',
  primaryLight: '#FFF7ED',
  dark: '#1C1C2E',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
  border: '#E5E7EB',
  divider: '#F3F4F6',
  danger: '#EF4444',
  dangerLight: '#FEF2F2',
}

const MenuListItem = ({
  icon,
  title,
  subtitle,
  onPress,
  isLast = false,
  titleColor = COLORS.dark,
}) => {
  const isDanger = titleColor === COLORS.danger

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 5, bottom: 5 }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: COLORS.divider,
        borderBottomLeftRadius: isLast ? 20 : 0,
        borderBottomRightRadius: isLast ? 20 : 0,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: isDanger ? COLORS.dangerLight : COLORS.primaryLight,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Image
          source={icon}
          style={{ width: 19, height: 19 }}
          resizeMode="contain"
          tintColor={isDanger ? COLORS.danger : COLORS.primary}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontFamily: 'QuickSand-Bold',
            color: titleColor,
          }}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            style={{
              fontSize: 12.5,
              fontFamily: 'QuickSand-Regular',
              color: COLORS.gray,
              marginTop: 3,
              lineHeight: 18,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {onPress && (
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: COLORS.background,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            source={images.arrowRight}
            style={{ width: 13, height: 13 }}
            resizeMode="contain"
            tintColor={COLORS.lightGray}
          />
        </View>
      )}
    </TouchableOpacity>
  )
}

const SectionCard = ({ title, children, style }) => (
  <View
    style={[
      {
        backgroundColor: COLORS.white,
        marginHorizontal: 20,
        marginTop: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.025,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      },
      style,
    ]}
  >
    {title && (
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 15,
          paddingBottom: 7,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            fontFamily: 'QuickSand-Bold',
            color: COLORS.lightGray,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }}
        >
          {title}
        </Text>
      </View>
    )}

    {children}
  </View>
)

export default function Profile() {
  const {
    user,
    isLoggedIn,
    setIsLoggedIn,
    setUser,
    setUserRole,
    userRole,
  } = useGlobalContext()

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut()
              setUser(null)
              setIsLoggedIn(false)
              setUserRole('customer')
              router.replace('/')
            } catch (error) {
              Alert.alert(
                'Error',
                error.message || 'Failed to sign out'
              )
            }
          },
        },
      ]
    )
  }

  // ─── GUEST STATE ───────────────────────────────────────
  if (!isLoggedIn || !user) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
        }}
        edges={['top']}
      >
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontFamily: 'QuickSand-Bold',
              color: COLORS.dark,
            }}
          >
            Profile
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
            marginTop: -35,
          }}
        >
          <View
            style={{
              width: 92,
              height: 92,
              borderRadius: 46,
              backgroundColor: COLORS.primaryLight,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 22,
              borderWidth: 1,
              borderColor: '#FFEDD5',
            }}
          >
            <Image
              source={images.person}
              style={{
                width: 42,
                height: 42,
              }}
              resizeMode="contain"
              tintColor={COLORS.primary}
            />
          </View>

          <Text
            style={{
              fontSize: 21,
              fontFamily: 'QuickSand-Bold',
              color: COLORS.dark,
              textAlign: 'center',
            }}
          >
            You're browsing as a guest
          </Text>

          <Text
            style={{
              fontSize: 14,
              fontFamily: 'QuickSand-Medium',
              color: COLORS.gray,
              textAlign: 'center',
              marginTop: 9,
              lineHeight: 21,
              maxWidth: 310,
            }}
          >
            Sign in to place orders, track deliveries and save your favourites.
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/sign-in')}
            activeOpacity={0.85}
            style={{
              backgroundColor: COLORS.primary,
              paddingVertical: 14,
              paddingHorizontal: 44,
              borderRadius: 14,
              marginTop: 28,
              shadowColor: COLORS.primary,
              shadowOpacity: 0.18,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontFamily: 'QuickSand-Bold',
                color: COLORS.white,
              }}
            >
              Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/sign-up')}
            activeOpacity={0.7}
            style={{
              marginTop: 17,
              padding: 4,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: 'QuickSand-SemiBold',
                color: COLORS.primary,
              }}
            >
              Create an account
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // ─── LOGGED-IN STATE ───────────────────────────────────
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
      }}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 14,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontFamily: 'QuickSand-Bold',
              color: COLORS.dark,
            }}
          >
            Profile
          </Text>

          <Text
            style={{
              fontSize: 13,
              fontFamily: 'QuickSand-Regular',
              color: COLORS.gray,
              marginTop: 3,
            }}
          >
            Manage your account and preferences
          </Text>
        </View>

        {/* User Info Card */}
        <View
          style={{
            backgroundColor: COLORS.white,
            marginHorizontal: 20,
            borderRadius: 20,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: COLORS.border,
            shadowColor: '#000',
            shadowOpacity: 0.035,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 3 },
            elevation: 2,
          }}
        >
          <View
            style={{
              padding: 3,
              borderRadius: 34,
              backgroundColor: COLORS.primaryLight,
            }}
          >
            <Image
              source={
                user?.profile
                  ? { uri: user.profile }
                  : images.avatar
              }
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: COLORS.divider,
              }}
              resizeMode="cover"
            />
          </View>

          <View
            style={{
              flex: 1,
              marginLeft: 14,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: 'QuickSand-Bold',
                color: COLORS.dark,
              }}
              numberOfLines={1}
            >
              {user?.name || 'User'}
            </Text>

            <Text
              style={{
                fontSize: 13,
                fontFamily: 'QuickSand-Medium',
                color: COLORS.gray,
                marginTop: 3,
              }}
              numberOfLines={1}
            >
              {user?.email || 'No email attached'}
            </Text>

            {userRole === 'admin' && (
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: COLORS.primaryLight,
                  paddingHorizontal: 9,
                  paddingVertical: 3,
                  borderRadius: 8,
                  marginTop: 7,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: 'QuickSand-Bold',
                    color: COLORS.primary,
                    textTransform: 'uppercase',
                    letterSpacing: 0.4,
                  }}
                >
                  Administrator
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Account Information */}
        <SectionCard title="Account Information">
          <MenuListItem
            icon={images.person}
            title="Name"
            subtitle={user?.name || '—'}
          />

          <MenuListItem
            icon={images.envelope}
            title="Email"
            subtitle={user?.email || '—'}
            isLast
          />
        </SectionCard>

        {/* Quick Access */}
        <SectionCard title="Quick Access">
          <MenuListItem
            icon={images.search}
            title="Explore Menu"
            subtitle="Browse and search food items"
            onPress={() => router.push('/search')}
          />

          <MenuListItem
            icon={images.bag}
            title="View Cart"
            subtitle="Check items in your shopping cart"
            onPress={() => router.push('/cart')}
          />

          {userRole === 'admin' ? (
            <MenuListItem
              icon={images.pencil}
              title="Admin Panel"
              subtitle="Manage products, orders & catalog"
              onPress={() => router.push('/(admin)/dashboard')}
              isLast
            />
          ) : (
            <MenuListItem
              icon={images.search}
              title="My Orders"
              subtitle="View order history and track deliveries"
              onPress={() => router.push('/orders')}
              isLast
            />
          )}
        </SectionCard>

        {/* Sign Out */}
        <SectionCard style={{ marginTop: 16 }}>
          <MenuListItem
            icon={images.logout}
            title="Sign Out"
            titleColor={COLORS.danger}
            onPress={handleSignOut}
            isLast
          />
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  )
}
