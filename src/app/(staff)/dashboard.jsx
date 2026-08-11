import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getStaffOrders } from '../../../lib/appwrite';

const STATUS_COLORS = {
  Pending: '#EF4444',
  Preparing: '#F59E0B',
  Ready: '#10B981',
};

export default function StaffDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getStaffOrders();
      setOrders(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 12000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const renderOrder = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => router.push(`/(staff)/order/${item.id}`)}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
          #{item.id.slice(-6).toUpperCase()}
        </Text>
        <View style={{
          backgroundColor: STATUS_COLORS[item.status] || '#9CA3AF',
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 99,
        }}>
          <Text style={{ fontSize: 11, fontFamily: 'QuickSand-Bold', color: '#fff' }}>
            {item.status}
          </Text>
        </View>
      </View>

      <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginTop: 10 }}>
        {item.customerName}
      </Text>

      <Text
        numberOfLines={2}
        style={{ fontSize: 13, fontFamily: 'QuickSand-Regular', color: '#6B7280', marginTop: 4 }}
      >
        {item.items?.map(i => `${i.quantity || 1}× ${i.name}`).join(', ')}
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
        <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>
          KSh {item.totalPrice?.toLocaleString()}
        </Text>
        <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
        <ActivityIndicator size="large" color="#FE8C00" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
      {/* Header */}
      <View style={{
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
      }}>
        <Text style={{ fontSize: 24, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
          Kitchen Queue
        </Text>
        <Text style={{ fontSize: 13, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', marginTop: 2 }}>
          Active orders
        </Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FE8C00']} />
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>
              No active orders right now 🎉
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}