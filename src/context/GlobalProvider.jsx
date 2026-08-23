import { createContext, useContext, useEffect, useRef, useState } from 'react';

import { Alert, View, Text, Platform } from 'react-native';
import {
    acceptDelivery,
    createOrder,
    getCurrentUser,
    getMyOrders,
    getOrders,
    getReadyOrders,
    getRiderDeliveries,
    generateDeliveryCode,
    setOrderConfirmationCode,
    verifyDeliveryCodeAndComplete,
    updateOrderStatusDB,

    signOut
} from '../../lib/appwrite';

const GlobalContext = createContext();

export const useGlobalContext = () => useContext(GlobalContext);

const POLL_INTERVAL_MS = 12000; // refresh every 12 seconds

const GlobalProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState('customer');
    const [isLoading, setIsLoading] = useState(true);
    const [cartItems, setCartItems] = useState([]);
    const [pendingConfirmations, setPendingConfirmations] = useState([]);

    const [deliveryLocation, setDeliveryLocation] = useState('Karen, Nairobi');

    // Orders state
    const [orders, setOrders] = useState([]);
    const [myOrders, setMyOrders] = useState([]);
    const [riderOrders, setRiderOrders] = useState([]);
    const [riderHistory, setRiderHistory] = useState([]);
    const [activeDelivery, setActiveDelivery] = useState(null);

    //Toast state.
    const [toast, setToast] = useState(null) // { message: string }

    const showToast = (message, duration = 2000) => {
        setToast({ message })
        setTimeout(() => setToast(null), duration)
    }
    
    const pollRef = useRef(null);

    // ── Auth ──────────────────────────────────────────────
    const fetchUser = async () => {
        setIsLoading(true);
        try {
            const res = await getCurrentUser();

            if (res?.missingProfile) {
                // Auth user exists but database document was deleted
                Alert.alert(
                    'Account Incomplete',
                    'Your account exists but the profile data is missing. Please contact support or sign up again with a different email.',
                    [
                        {
                            text: 'Sign Out',
                            onPress: async () => {
                                try { await signOut(); } catch (_) {}
                                setIsLoggedIn(false);
                                setUser(null);
                                setUserRole('customer');
                            }
                        }
                    ]
                );
                setIsLoggedIn(false);
                setUser(null);
                setUserRole('customer');
                return;
            }

            if (res) {
                setIsLoggedIn(true);
                setUser(res);
                setUserRole(res.role || 'customer');
            } else {
                setIsLoggedIn(false);
                setUser(null);
                setUserRole('customer');
            }
        } catch (error) {
            console.error('GlobalProvider fetchUser error:', error);
            setIsLoggedIn(false);
            setUser(null);
            setUserRole('customer');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);


    const fetchOrders = async () => {
        try {
            const dbOrders = await getOrders();
            setOrders(dbOrders || []);
        } catch (error) {
            console.error('GlobalProvider fetchOrders error:', error);
        }
    };

    const fetchMyOrders = async () => {
        if (!user?.$id) return;
        try {
            const result = await getMyOrders(user.$id);
            setMyOrders(result || []);
        } catch (error) {
            console.warn('fetchMyOrders skipped:', error?.message);
        }
    };

    const fetchRiderData = async () => {
        if (!user?.$id) return;

        try {
            const ready = await getReadyOrders();
            setRiderOrders(ready || []);
        } catch (error) {
            console.warn('fetchRiderData (ready orders) error:', error?.message);
        }

        try {
            const history = await getRiderDeliveries(user.$id);
            setRiderHistory(history || []);

            // Currently delivering
            const active = (history || []).find(o => o.status === 'Out for Delivery');
            setActiveDelivery(active || null);

            // Waiting for customer to confirm receipt
            const pending = (history || []).filter(o => o.status === 'Delivered');
            setPendingConfirmations(pending);
        } catch (error) {
            console.warn('fetchRiderData (history) skipped — add rider_id attribute to orders collection:', error?.message);
        }
    };


    useEffect(() => {
        if (!user) return;

        const role = user.role || 'customer';


        if (role === 'admin') {
            fetchOrders();
        } else if (role === 'rider') {
            fetchRiderData();
        } else {
            fetchOrders();
            fetchMyOrders();
        }


        pollRef.current = setInterval(() => {
            if (role === 'admin') {
                fetchOrders();
            } else if (role === 'rider') {
                fetchRiderData();
            } else {
                fetchOrders();
                fetchMyOrders();
            }
        }, POLL_INTERVAL_MS);

        return () => {
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
        };
    }, [user]);


    const addToCart = (item, quantity = 1) => {
        setCartItems((prev) => {
            const existingIndex = prev.findIndex((ci) => ci.item.$id === item.$id);
            if (existingIndex > -1) {
                const updated = [...prev];
                updated[existingIndex].quantity += quantity;
                return updated;
            } else {
                return [...prev, { item, quantity }];
            }
        });
    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => prev.filter((ci) => ci.item.$id !== itemId));
    };

    const updateQuantity = (itemId, newQty) => {
        if (newQty <= 0) {
            removeFromCart(itemId);
        } else {
            setCartItems((prev) =>
                prev.map((ci) =>
                    ci.item.$id === itemId ? { ...ci, quantity: newQty } : ci
                )
            );
        }
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalCartItems = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

    const totalCartPrice = cartItems.reduce(
        (acc, curr) => acc + (curr.item.price ?? 0) * curr.quantity,
        0
    );


    const placeOrder = async ({ note, address }) => {
        if (cartItems.length === 0) return null;
        const items = cartItems.map(ci => ({
            name: ci.item.name,
            quantity: ci.quantity,
            price: ci.item.price,
            image_url: ci.item.image_url,
        }));
        const totalPrice = totalCartPrice + (totalCartPrice > 1000 ? 0 : 150);

        try {
            const doc = await createOrder({
                customerName: user?.name || 'Guest User',
                customerId: user?.$id || '',
                address: address || deliveryLocation || user?.address || 'Karen, Nairobi',
                note: note || '',
                items,
                totalPrice,
            });

            const newOrderObj = {
                id: doc.$id,
                $id: doc.$id,
                createdAt: doc.$createdAt,
                customerName: doc.customer_name || user?.name || 'Guest User',
                address: doc.address || deliveryLocation || 'Karen, Nairobi',
                note: doc.note || '',
                items,
                totalPrice,
                status: 'Pending',
                riderId: '',
                riderName: '',
            };

            setOrders(prev => [newOrderObj, ...prev]);
            setMyOrders(prev => [newOrderObj, ...prev]);
            clearCart();
            return newOrderObj;
        } catch (error) {
            console.error('Failed to persist order in Appwrite:', error);
            clearCart();
            return null;
        }
    };


    const updateOrderStatus = async (orderId, newStatus) => {
        const update = (o) =>
            o.id === orderId || o.$id === orderId ? { ...o, status: newStatus } : o;
        setOrders(prev => prev.map(update));
        setMyOrders(prev => prev.map(update));
        try {
            await updateOrderStatusDB(orderId, newStatus);
        } catch (error) {
            console.error('Failed to update order status in DB:', error);
        }
    };


    const acceptRiderDelivery = async (order) => {
        if (!user) return;
        try {
            await acceptDelivery(order.id, user.$id, user.name);
            const updatedOrder = {
                ...order,
                status: 'Out for Delivery',
                riderId: user.$id,
                riderName: user.name,
            };
            setActiveDelivery(updatedOrder);
            setRiderOrders(prev => prev.filter(o => o.id !== order.id));
            setOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o));
        } catch (error) {
            console.error('acceptRiderDelivery error:', error);
            throw error;
        }
    };


    // Called when rider taps “I’ve arrived – Get code”
    const prepareDeliveryCode = async (orderId) => {
    try {
        const code = generateDeliveryCode()
        await setOrderConfirmationCode(orderId, code)
        await fetchRiderData()
        return code
    } catch (error) {
        console.error('prepareDeliveryCode error:', error)
        throw error
    }
    }

    // Called when rider submits the code the customer showed them
    const verifyAndCompleteDelivery = async (orderId, enteredCode) => {
        try {
            await verifyDeliveryCodeAndComplete(orderId, enteredCode)

            const update = (o) =>
            o.id === orderId || o.$id === orderId
                ? { ...o, status: 'Completed', confirmation_code: '', code_generated_at: '' }
                : o

            setActiveDelivery(null)
            setPendingConfirmations(prev => prev.filter(o => o.id !== orderId))
            setOrders(prev => prev.map(update))
            setMyOrders(prev => prev.map(update))
            setRiderHistory(prev => prev.map(update))

            await fetchRiderData()
        }   catch (error) {
            console.error('verifyAndCompleteDelivery error:', error)
            throw error
        }
    }

    return (
        <GlobalContext.Provider
            value={{
                isLoggedIn,
                setIsLoggedIn,
                user,
                setUser,
                userRole,
                setUserRole,
                isLoading,
                fetchUser,
                deliveryLocation,
                setDeliveryLocation,
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                toast,
                showToast,
                totalCartItems,
                totalCartPrice,
                orders,
                myOrders,
                riderOrders,
                riderHistory,
                activeDelivery,
                placeOrder,
                updateOrderStatus,
                fetchOrders,
                fetchMyOrders,
                fetchRiderData,
                acceptRiderDelivery,
                prepareDeliveryCode,
                verifyAndCompleteDelivery,
                pendingConfirmations,
            }}
        >
            {children}

            {/* Global Toast */}
            {toast && (
                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        bottom: Platform.os === 'web' ? 32 : 110,
                        left: 20,
                        right: 20,
                        backgroundColor: '#FE8C00',
                        paddingVertical: 14,
                        paddingHorizontal: 20,
                        borderRadius: 14,
                        alignItems: 'center',
                        zIndex: 9999,
                        elevation: 10,
                        shadowColor: '#000',
                        shadowOpacity: 0.35,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 4 },
                    }}
                >
                    <Text style={{ color: '#FFFFFF', fontFamily: 'QuickSand-Bold', fontSize: 14, letterSpacing: 0.2,}}>
                        {toast.message}
                    </Text>
                </View>
            )}

        </GlobalContext.Provider>
    );
};

export default GlobalProvider;
