import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { databases, appwriteConfig, updateOrderStatus } from '../../../../lib/appwrite';

export default function StaffOrderDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const doc = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.ordersCollectionId,
          id
        );
        setOrder({
          ...doc,
          id: doc.$id,
          customerName: doc.customer_name,
          items: (doc.items_json || []).map(s => {
            try { return JSON.parse(s); } catch { return {}; }
          }),
        });
      } catch (e) {
        Alert.alert('Error', 'Could not load order');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const changeStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await updateOrderStatus(id, newStatus);
      setOrder(prev => ({ ...prev, status: newStatus }));
      Alert.alert('Success', `Order marked as ${newStatus}`);
    } catch (e) {
      Alert.alert('Error', e.message || 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  if (loading || !order) {
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
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#FE8C00' }}>
            ← Back
          </Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontFamily: 'QuickSand-Bold', color: '#1C1C2E' }}>
          Order #{order.id.slice(-6).toUpperCase()}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: '#F3F4F6',
        }}>
          <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF' }}>Status</Text>
          <Text style={{ fontSize: 18, fontFamily: 'QuickSand-Bold', color: '#FE8C00', marginTop: 2 }}>
            {order.status}
          </Text>

          <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', marginTop: 16 }}>Customer</Text>
          <Text style={{ fontSize: 16, fontFamily: 'QuickSand-Bold', color: '#1C1C2E', marginTop: 2 }}>
            {order.customerName}
          </Text>

          <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', marginTop: 16 }}>Address</Text>
          <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Regular', color: '#1C1C2E', marginTop: 2 }}>
            {order.address || '—'}
          </Text>

          {order.note ? (
            <>
              <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', marginTop: 16 }}>Note</Text>
              <Text style={{ fontSize: 15, fontFamily: 'QuickSand-Regular', color: '#1C1C2E', marginTop: 2 }}>
                {order.note}
              </Text>
            </>
          ) : null}

          <Text style={{ fontSize: 12, fontFamily: 'QuickSand-Medium', color: '#9CA3AF', marginTop: 16 }}>Items</Text>
          {order.items?.map((item, idx) => (
            <Text
              key={idx}
              style={{ fontSize: 15, fontFamily: 'QuickSand-Regular', color: '#1C1C2E', marginTop: 4 }}
            >
              {item.quantity || 1}× {item.name}
              {item.customizations ? ` (${item.customizations})` : ''}
            </Text>
          ))}

          <Text style={{
            fontSize: 18,
            fontFamily: 'QuickSand-Bold',
            color: '#1C1C2E',
            marginTop: 20,
          }}>
            Total: KSh {order.total_price?.toLocaleString()}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={{ marginTop: 24 }}>
          {order.status === 'Pending' && (
            <TouchableOpacity
              disabled={updating}
              onPress={() => changeStatus('Preparing')}
              style={{
                backgroundColor: '#F59E0B',
                paddingVertical: 16,
                borderRadius: 14,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontFamily: 'QuickSand-Bold', fontSize: 16 }}>
                Start Preparing
              </Text>
            </TouchableOpacity>
          )}

          {order.status === 'Preparing' && (
            <TouchableOpacity
              disabled={updating}
              onPress={() => changeStatus('Ready')}
              style={{
                backgroundColor: '#10B981',
                paddingVertical: 16,
                borderRadius: 14,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontFamily: 'QuickSand-Bold', fontSize: 16 }}>
                Mark as Ready
              </Text>
            </TouchableOpacity>
          )}

          {order.status === 'Ready' && (
            <Text style={{
              textAlign: 'center',
              color: '#10B981',
              fontFamily: 'QuickSand-Bold',
              fontSize: 16,
            }}>
              Order is ready for rider pickup
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}