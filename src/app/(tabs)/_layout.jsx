import cn from 'clsx';
import { Redirect, Tabs } from "expo-router";
import { Image, Text, View } from "react-native";
import { images } from "../../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";

const TabBarIcon = ({ focused, title, icon, badge }) => {
    return (
        <View className="flex flex-col items-center justify-center h-full w-full">
            <View style={{ position: 'relative' }}>
                <Image source={icon} className="size-6" resizeMode="contain" tintColor={focused ? '#FE8C00' : '#5D5F6D'} />
                {badge > 0 && (
                    <View style={{
                        position: 'absolute',
                        top: -4,
                        right: -6,
                        backgroundColor: '#EF4444',
                        borderRadius: 99,
                        minWidth: 14,
                        height: 14,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingHorizontal: 3,
                    }}>
                        <Text style={{ fontSize: 8, fontFamily: 'QuickSand-Bold', color: '#FFF' }}>{badge > 9 ? '9+' : badge}</Text>
                    </View>
                )}
            </View>
            <Text className={cn('text-xs font-bold mt-1', focused ? 'text-primary' : 'text-gray-200')}>{title}</Text>
        </View>
    )
}


export default function _layout() {
    const { isLoggedIn, isLoading, userRole, myOrders } = useGlobalContext();

    if (!isLoading && !isLoggedIn) {
        return <Redirect href="/sign-in" />;
    }


    if (!isLoading && isLoggedIn && userRole === 'rider') {
        return <Redirect href="/(rider)/dashboard" />;
    }


    const activeOrderCount = myOrders.filter(
        o => o.status !== 'Completed' && o.status !== 'Cancelled'
    ).length;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarItemStyle: {
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 0,
                    margin: 0,
                },
                tabBarIconStyle: {
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderRadius: 50,
                    height: 70,
                    position: 'absolute',
                    bottom: 30,
                    left: 20,
                    right: 20,
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                    shadowColor: '#1a1a1a',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 5,
                }
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused }) => <TabBarIcon
                        title={'home'}
                        icon={images.home}
                        focused={focused}
                    />
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: 'Search',
                    tabBarIcon: ({ focused }) => <TabBarIcon
                        title={'search'}
                        icon={images.search}
                        focused={focused}
                    />

                }}
            />

            <Tabs.Screen
                name="cart"
                options={{
                    title: 'Cart',
                    tabBarIcon: ({ focused }) => <TabBarIcon
                        title={'cart'}
                        icon={images.bag}
                        focused={focused}
                    />
                }}
            />

            <Tabs.Screen
                name="orders"
                options={{
                    title: 'Orders',
                    tabBarIcon: ({ focused }) => <TabBarIcon
                        title={'orders'}
                        icon={images.clock}
                        focused={focused}
                        badge={activeOrderCount}
                    />
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused }) => <TabBarIcon
                        title={'profile'}
                        icon={images.person}
                        focused={focused}
                    />
                }}
            />
        </Tabs>
    );
}