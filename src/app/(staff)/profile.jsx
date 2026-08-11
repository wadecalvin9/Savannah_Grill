import { View, Text, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalContext } from '../../context/GlobalProvider';
import { signOut } from '../../../lib/appwrite';

const isWeb = Platform.OS === 'web';

export default function StaffProfile() {
  const { user, setUser, setIsLoggedIn, setUserRole } = useGlobalContext();
  const router = useRouter();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              setUser(null);
              if (typeof setIsLoggedIn === 'function') setIsLoggedIn(false);
              if (typeof setUserRole === 'function') setUserRole('customer');
              router.replace('/');
            } catch (e) {
              Alert.alert('Error', 'Could not sign out');
            }
          },
        },
      ]
    );
  };

  const initial = (user?.name || 'S').charAt(0).toUpperCase();

  // ─────────────────────────────────────────────
  // WEB UI
  // ─────────────────────────────────────────────
  if (isWeb) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: '#F8F9FB' }}
        contentContainerStyle={{
          paddingVertical: 40,
          paddingHorizontal: 24,
          maxWidth: 640,
          width: '100%',
          alignSelf: 'center',
        }}
      >
        {/* Identity card */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            padding: 32,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: '#FE8C00',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              shadowColor: '#FE8C00',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 40, fontFamily: 'QuickSand-Bold', color: '#FFFFFF' }}>
              {initial}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 24,
              fontFamily: 'QuickSand-Bold',
              color: '#1C1C2E',
              textAlign: 'center',
            }}
          >
            {user?.name || 'Staff Member'}
          </Text>

          <View
            style={{
              marginTop: 10,
              backgroundColor: '#ECFDF5',
              paddingHorizontal: 14,
              paddingVertical: 5,
              borderRadius: 999,
            }}
          >
            <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Bold', color: '#059669' }}>
              {user?.role || 'staff'}
            </Text>
          </View>
        </View>

        {/* Account Information */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            overflow: 'hidden',
            marginBottom: 28,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontFamily: 'QuickSand-Bold',
              color: '#9CA3AF',
              letterSpacing: 0.8,
              paddingHorizontal: 24,
              paddingTop: 20,
              paddingBottom: 12,
            }}
          >
            ACCOUNT INFORMATION
          </Text>

          <View style={{ paddingHorizontal: 24, paddingBottom: 8 }}>
            {/* Name */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 16 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: '#F3F4F6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="person-outline" size={20} color="#6B7280" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>
                  Name
                </Text>
                <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginTop: 2 }}>
                  {user?.name || '—'}
                </Text>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: '#F3F4F6', marginLeft: 60 }} />

            {/* Email */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 16 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: '#F3F4F6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="mail-outline" size={20} color="#6B7280" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>
                  Email
                </Text>
                <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginTop: 2 }}>
                  {user?.email || '—'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Centered Sign Out */}
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: '#FECACA',
              paddingVertical: 14,
              paddingHorizontal: 36,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={{ color: '#EF4444', fontFamily: 'QuickSand-Bold', fontSize: 15 }}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ─────────────────────────────────────────────
  // MOBILE UI
  // ─────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
      {/* Simple header – no settings icon */}
      <View
        style={{
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 14,
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6',
        }}
      >
        <Text style={{ fontSize: 24, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
          Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {/* Identity card – centered content */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            paddingVertical: 28,
            paddingHorizontal: 20,
            borderWidth: 1,
            borderColor: '#F3F4F6',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: '#FE8C00',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
              shadowColor: '#FE8C00',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.22,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Text style={{ fontSize: 32, fontFamily: 'QuickSand-Bold', color: '#FFFFFF' }}>
              {initial}
            </Text>
          </View>

          <Text
            style={{
              fontSize: 20,
              fontFamily: 'QuickSand-Bold',
              color: '#1C1C2E',
              textAlign: 'center',
            }}
            numberOfLines={1}
          >
            {user?.name || 'Staff Member'}
          </Text>

          <View
            style={{
              marginTop: 8,
              backgroundColor: '#ECFDF5',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 999,
            }}
          >
            <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Bold', color: '#059669' }}>
              {user?.role || 'staff'}
            </Text>
          </View>
        </View>

        {/* Account Information */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#F3F4F6',
            overflow: 'hidden',
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontFamily: 'QuickSand-Bold',
              color: '#9CA3AF',
              letterSpacing: 0.6,
              paddingHorizontal: 16,
              paddingTop: 14,
              paddingBottom: 8,
            }}
          >
            ACCOUNT INFORMATION
          </Text>

          <View style={{ paddingHorizontal: 16, paddingBottom: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#F3F4F6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="person-outline" size={18} color="#6B7280" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>
                  Name
                </Text>
                <Text
                  style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginTop: 1 }}
                  numberOfLines={1}
                >
                  {user?.name || '—'}
                </Text>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: '#F3F4F6', marginLeft: 54 }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#F3F4F6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="mail-outline" size={18} color="#6B7280" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>
                  Email
                </Text>
                <Text
                  style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginTop: 1 }}
                  numberOfLines={1}
                >
                  {user?.email || '—'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Centered Sign Out */}
        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: '#FEE2E2',
              paddingVertical: 14,
              paddingHorizontal: 32,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={{ color: '#EF4444', fontFamily: 'QuickSand-Bold', fontSize: 15 }}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}