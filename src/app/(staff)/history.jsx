import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, RefreshControl, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getStaffOrderHistory } from '../../../lib/appwrite';

export default function StaffHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const data = await getStaffOrderHistory();
      setOrders(data);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const renderOrder = ({ item }) => (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#F3F4F6',
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
          #{item.id.slice(-6).toUpperCase()}
        </Text>
        <Text style={{
          fontSize: 13,
          fontFamily: 'QuickSand-Bold',
          color: item.status === 'Cancelled' ? '#EF4444' : '#10B981',
        }}>
          {item.status}
        </Text>
      </View>

      <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Medium', color: '#1C1C2E', marginTop: 8 }}>
        {item.customerName}
      </Text>

      <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Bold', color: '#FE8C00', marginTop: 4 }}>
        KSh {item.totalPrice?.toLocaleString()}
      </Text>

      <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Regular', color: '#9CA3AF', marginTop: 6 }}>
        {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
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
      <View style={{
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
      }}>
        <Text style={{ fontSize: 24, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
          Order History
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
              No completed orders yet
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}