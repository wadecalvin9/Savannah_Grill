import cn from "clsx";
import { FlatList, Image, Pressable, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Fragment } from "react/jsx-runtime";
import Cart from "../../../components/Cartbutton";
import { images, offers } from "../../../constants/index";
export default function Index() {
  return (
    <SafeAreaView className="flex-1">


      <FlatList
        data={offers}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item, index }) => {
          const isEven = index % 2 == 0;


          return (
            <View>
              <Pressable className={cn("offer-card p-1", isEven ? 'flex-row-reverse' : 'flex-row')} style={{ backgroundColor: item.color }}
                android_ripple={{ color: "fffff22" }}>
                {({ pressed }) => (
                  <Fragment>
                    <View className="h-full w-1/2">
                      <Image source={item.image} className={'size-full'} resizeMode={'contain'} />
                    </View>
                    <View className="offer-card__info">
                      <Text className="h1-bold leading-tight text-white">{item.title}</Text>
                      <Image source={images.arrowRight} />
                    </View>
                  </Fragment>

                )}
              </Pressable>


            </View>
          )

        }
        }
        ListHeaderComponent={() => (

          <View className="flex-between flex-row w-full my-5 px-5">
            <View className="flex-start">
              <Text className="small-bold text-primary">DELIVER TO</Text>
              <TouchableOpacity className="flex-center flex-row gap-x-1 mt-0.5">
                <Text className="paragraph-bold text-dark-100">Karen</Text>

                <Image source={images.arrowDown} className="size-3" resizeMode="contain" />
              </TouchableOpacity>

            </View>
            <Cart />
          </View>

        )}
      />


    </SafeAreaView>

  );
}