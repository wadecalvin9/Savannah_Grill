import { Tabs, Redirect, usePathname, useRouter } from 'expo-router';
import { Image, Text, View, Platform, TouchableOpacity, Pressable } from 'react-native';
import { useGlobalContext } from '../../context/GlobalProvider';
import { images } from '../../../constants';
import cn from 'clsx';

const isWeb = Platform.OS === 'web';

const TabBarIcon = ({ focused, title, icon }) => (
  <View className="flex flex-col items-center justify-center h-full w-full px-1">
    <Image
      source={icon}
      className="size-6"
      resizeMode="contain"
      tintColor={focused ? '#FE8C00' : '#5D5F6D'}
    />
    <Text
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.75}
      className={cn(
        'text-[11px] font-bold mt-1 text-center',
        focused ? 'text-primary' : 'text-gray-200'
      )}
    >
      {title}
    </Text>
  </View>
);

// Minimal staff web top navigation
function StaffWebNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { label: 'Kitchen', href: '/dashboard', match: 'dashboard' },
    { label: 'History', href: '/history', match: 'history' },
    { label: 'Profile', href: '/profile', match: 'profile' },
  ];

  const isActive = (match) => pathname?.includes(match);

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingHorizontal: 24,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // sticky on web
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: '#FE8C00',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontFamily: 'QuickSand-Bold', fontSize: 16 }}>S</Text>
        </View>
        <View>
          <Text style={{ fontSize: 17, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
            Savannah Grill
          </Text>
          <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>
            Staff Portal
          </Text>
        </View>
      </View>

      {/* Nav links */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {links.map((link) => {
          const active = isActive(link.match);
          return (
            <Pressable
              key={link.label}
              onPress={() => router.push(link.href)}
              style={({ hovered }) => ({
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: active ? '#FFF7ED' : hovered ? '#F9FAFB' : 'transparent',
              })}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: active ? 'QuickSand-Bold' : 'QuickSand-Medium',
                  color: active ? '#FE8C00' : '#4B5563',
                }}
              >
                {link.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function StaffLayout() {
  const { user, isLoading } = useGlobalContext();

  if (!isLoading && (!user || user.role !== 'staff')) {
    return <Redirect href="/" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Web-only top navbar – present on every staff page */}
      {isWeb && <StaffWebNavbar />}

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarItemStyle: {
            flex: 1,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          },
          tabBarStyle: isWeb
            ? { display: 'none' }
            : {
                backgroundColor: '#ffffff',
                borderRadius: 50,
                height: 70,
                position: 'absolute',
                bottom: 30,
                left: 20,
                right: 20,
                shadowColor: '#1a1a1a',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 5,
                borderTopWidth: 0,
                paddingBottom: 0,
              },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Kitchen',
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                title="Kitchen"
                icon={images.bag || images.home}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                title="History"
                icon={images.clock}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                title="Profile"
                icon={images.person}
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="order/[id]"
          options={{ href: null }}
        />
      </Tabs>
    </View>
  );
}