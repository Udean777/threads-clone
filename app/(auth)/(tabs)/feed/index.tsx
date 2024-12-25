import {
  Button,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import * as Sentry from "@sentry/react-native";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThreadComposer from "@/components/ThreadComposer";
import Thread from "@/components/Thread";
import { Doc } from "@/convex/_generated/dataModel";

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

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <Thread thread={item as Doc<"messages"> & { creator: Doc<"users"> }} />
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
