import cn from 'clsx';
import { Redirect, Tabs } from "expo-router";
import { Image, Text, View } from "react-native";
import { images } from "../../../constants";
import { useGlobalContext } from "../../context/GlobalProvider";
const TabBarIcon = ({ focused, title, icon }) => {
    return (
        <View className="flex flex-col items-center justify-center h-full w-full">
            <Image source={icon} className="size-6" resizeMode="contain" tintColor={focused ? '#FE8C00' : '#5D5F6D'} />
            <Text className={cn('text-xs font-bold mt-1', focused ? 'text-primary' : 'text-gray-200')}>{title}</Text>
        </View>
    )
}


export default function _layout() {
    const { isLoggedIn, isLoading } = useGlobalContext();

    if (!isLoggedIn && !isLoading) {
        return <Redirect href={"sign-in"} />;
    }

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