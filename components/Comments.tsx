import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Thread from "./Thread";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";

interface CommentsProps {
  threadId: Id<"messages">;
  onCommentAdded?: () => void;
}

const Comments: React.FC<CommentsProps> = ({ threadId, onCommentAdded }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const comments = useQuery(api.messages.getComments, {
    threadId,
    paginationOpts: { numItems: pageSize, cursor: null },
  }) as {
    page: {
      mediaFiles: string[];
      creator: {
        _id: Id<"users">;
        _creationTime: number;
        imageUrl?: string | undefined;
        first_name?: string | undefined;
        last_name?: string | undefined;
        bio?: string | undefined;
        followersCount: number;
      } | null;
      retweetCount: number;
    }[];
    continuePagination?: () => void;
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(0);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (comments?.continuePagination) {
      setPage((prev) => prev + 1);
      comments.continuePagination();
    }
  };

  if (!comments) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.blue} />
      </View>
    );
  }

  const handleCommentDeleted = () => {
    handleRefresh();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comments</Text>
      <FlatList
        data={comments.page}
        renderItem={({ item }) => (
          <Thread
            key={item.creator?._id}
            thread={
              item as Doc<"messages"> & {
                creator: Doc<"users">;
                isLiked: boolean;
                repliesCount: number;
              }
            }
            isComment={true}
            onDeleted={handleCommentDeleted}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No comments yet</Text>
            <Text style={styles.emptySubtext}>Be the first to comment!</Text>
          </View>
        )}
        ListFooterComponent={() =>
          comments.page.length > 0 && comments.continuePagination ? (
            <ActivityIndicator
              size="small"
              color={Colors.blue}
              style={styles.footer}
            />
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.DM_BOLD,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.DM_BOLD,
    color: Colors.border,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: Fonts.DM_REGULAR,
    color: "#fff",
    marginTop: 5,
  },
  footer: {
    padding: 10,
  },
});

export default Comments;
