import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState, useCallback } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ThreadComposer from "@/components/ThreadComposer";
import Thread from "@/components/Thread";
import { Doc } from "@/convex/_generated/dataModel";
import { useRouter } from "expo-router";
import { Text } from "react-native";
import { Fonts } from "@/constants/Fonts";

const ITEMS_PER_PAGE = 10;

const Page = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { top } = useSafeAreaInsets();
  const router = useRouter();

  const { results, status, loadMore, isLoading } = usePaginatedQuery(
    api.messages.getThreads,
    {},
    { initialNumItems: ITEMS_PER_PAGE }
  );

  // console.log(results);

  const handleLoadMore = useCallback(() => {
    if (!isLoading) {
      loadMore(ITEMS_PER_PAGE);
    }
  }, [, isLoading, loadMore]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Reset will be handled by the RefreshControl component
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleThreadPress = useCallback(
    (threadId: string) => {
      router.push(`/(auth)/(tabs)/feed/${threadId}`);
    },
    [router]
  );

  const renderItem = useCallback(
    ({
      item,
    }: {
      item: Doc<"messages"> & {
        creator: Doc<"users"> | null;
        isLiked: boolean;
      };
    }) => (
      <TouchableOpacity onPress={() => handleThreadPress(item._id)}>
        <Thread thread={item as any} />
      </TouchableOpacity>
    ),
    [handleThreadPress]
  );

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    []
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/threads-logo-black.png")}
          style={styles.logo}
        />
        <ThreadComposer isPreview />
      </View>
    ),
    []
  );

  // const renderFooter = useCallback(() => {
  //   if (status === "LoadingFirstPage") return null;
  //   return (
  //     <View style={styles.footer}>
  //       <ActivityIndicator size="small" color={Colors.blue} />
  //     </View>
  //   );
  // }, []);

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No threads yet</Text>
        <Text style={styles.emptySubtext}>Start a conversation!</Text>
      </View>
    ),
    []
  );

  // if (status === "Exhausted") {
  //   return (
  //     <View style={styles.errorContainer}>
  //       <Text style={styles.errorText}>Something went wrong</Text>
  //       <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
  //         <Text style={styles.retryText}>Try Again</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }

  return (
    <FlatList
      data={results as any}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.blue}
        />
      }
      ItemSeparatorComponent={renderSeparator}
      ListHeaderComponent={renderHeader}
      // ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        { paddingTop: top },
        !results?.length && styles.emptyList,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
  },
  header: {
    paddingBottom: 16,
  },
  logo: {
    width: 40,
    height: 40,
    alignSelf: "center",
    marginVertical: 10,
  },
  footer: {
    padding: 16,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: Fonts.DM_BOLD,
    color: "#333",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: Fonts.DM_REGULAR,
    color: "#333",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: Fonts.DM_MEDIUM,
    color: "red",
    marginBottom: 12,
  },
  retryButton: {
    padding: 12,
    backgroundColor: Colors.blue,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontFamily: Fonts.DM_BOLD,
    fontSize: 14,
  },
});

export default Page;
