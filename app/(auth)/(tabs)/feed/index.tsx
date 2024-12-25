import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThreadComposer from "@/components/ThreadComposer";
import Thread from "@/components/Thread";
import { Doc } from "@/convex/_generated/dataModel";
import { Link, useNavigation } from "expo-router";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useIsFocused } from "@react-navigation/native";

const Page = () => {
  const [refresh, setRefresh] = useState(false);
  const { top } = useSafeAreaInsets();

  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.getThreads,
    {},
    { initialNumItems: 5 }
  );

  const onLoadMore = () => {
    loadMore(5);
  };

  const onRefresh = () => {
    setRefresh(true);

    setTimeout(() => {
      setRefresh(false);
    }, 2000);
  };

  // Animation for bottomtabs here...
  // const navigation = useNavigation();
  // const scrollOffset = useSharedValue(0);
  // const tabBarHeight = useBottomTabBarHeight();
  // const isFocused = useIsFocused();

  // const updateTabBar = () => {
  //   let newMarginBottom = 0;
  //   if (scrollOffset.value >= 0 && scrollOffset.value <= tabBarHeight) {
  //     newMarginBottom = -scrollOffset.value;
  //   } else if (scrollOffset.value > tabBarHeight) {
  //     newMarginBottom = -tabBarHeight;
  //   }

  //   navigation.getParent()?.setOptions({
  //     tabBarStyle: {
  //       marginBottom: newMarginBottom,
  //     },
  //   });
  // };

  // const scrollHandler = useAnimatedScrollHandler({
  //   onScroll: (event) => {
  //     if (isFocused) {
  //       scrollOffset.value = event.contentOffset.y;
  //       runOnJS(updateTabBar)();
  //     }
  //   },
  // });

  return (
    <Animated.FlatList
      // onScroll={scrollHandler}
      // scrollEventThrottle={16}
      data={results}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <Link href={`/(auth)/(tabs)/feed/${item._id}`} asChild>
          <TouchableOpacity>
            <Thread
              thread={
                item as Doc<"messages"> & {
                  creator: Doc<"users">;
                  isLiked: boolean;
                }
              }
            />
          </TouchableOpacity>
        </Link>
      )}
      onEndReached={onLoadMore}
      refreshControl={
        <RefreshControl refreshing={refresh} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
      onEndReachedThreshold={0.5}
      ItemSeparatorComponent={() => (
        <View
          style={{
            height: StyleSheet.hairlineWidth,
            backgroundColor: Colors.border,
          }}
        />
      )}
      contentContainerStyle={{ paddingVertical: top }}
      ListHeaderComponent={
        <View style={{ paddingBottom: 16 }}>
          <Image
            source={require("@/assets/images/threads-logo-black.png")}
            style={{
              width: 40,
              height: 40,
              alignSelf: "center",
            }}
          />
          <ThreadComposer isPreview />
        </View>
      }
    />
  );
};

export default Page;
