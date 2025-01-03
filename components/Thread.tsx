import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";
import { Link } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ThreadProps } from "@/utils/threadType";

const Thread: React.FC<ThreadProps> = ({
  thread,
  isComment = false,
  onDeleted,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteCommentMutation = useMutation(api.messages.deleteComment);
  const {
    content,
    mediaFiles,
    likeCount,
    commentCount,
    retweetCount,
    creator,
    isLiked,
  } = thread;
  const [isLoading, setIsLoading] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [localIsLiked, setLocalIsLiked] = useState<boolean | null>(isLiked);
  const toggleLikeMutation = useMutation(api.messages.likeThread);

  const handleToggleLike = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      const originalLikeCount = localLikeCount;

      const isNowLiked = await toggleLikeMutation({ threadId: thread._id });

      setLocalIsLiked(isNowLiked);
      setLocalLikeCount(
        isNowLiked ? originalLikeCount + 1 : originalLikeCount - 1
      );
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isComment || isDeleting) return;

    try {
      setIsDeleting(true);
      await deleteCommentMutation({ commentId: thread._id });
      onDeleted?.();
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const showDeleteOption = creator?._id === thread.creator._id;

  return (
    <View style={styles.container}>
      <Image source={{ uri: creator?.imageUrl }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Link href={`/feed/profile/${creator?._id}`} asChild>
              <Text style={styles.username}>{creator?.username}</Text>
            </Link>
            <Text style={styles.timestamp}>
              {new Date(thread._creationTime).toLocaleString()}
            </Text>
          </View>
          {showDeleteOption && isComment && (
            <TouchableOpacity
              onPress={handleDelete}
              disabled={isDeleting}
              style={{ padding: 8 }}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={"red"} />
              ) : (
                <Ionicons name="trash-outline" size={20} color={"red"} />
              )}
            </TouchableOpacity>
          )}
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color={Colors.border}
          />
        </View>
        <Text style={styles.content}>{content}</Text>
        {mediaFiles && mediaFiles.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.mediaContainer}
          >
            {mediaFiles.map((imageUrl, index) => (
              <Link
                href={`/(auth)/(modal)/image/${encodeURIComponent(imageUrl)}?threadId=${thread._id}&likeCount=${likeCount}&commentCount=${commentCount}&retweetCount=${retweetCount}`}
                key={index}
                asChild
              >
                <TouchableOpacity key={index}>
                  <Image source={{ uri: imageUrl }} style={styles.mediaImage} />
                </TouchableOpacity>
              </Link>
            ))}
          </ScrollView>
        )}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleToggleLike}
          >
            <Ionicons
              name={localIsLiked ? "heart" : "heart-outline"}
              size={isComment ? 20 : 24}
              color={localIsLiked ? "red" : "black"}
            />
            <Text style={[styles.actionText, isComment && styles.commentText]}>
              {localLikeCount}
            </Text>
          </TouchableOpacity>
          {!isComment && (
            <>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={24} color="black" />
                <Text style={styles.actionText}>{commentCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="repeat-outline" size={24} color="black" />
                <Text style={styles.actionText}>{retweetCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Feather name="send" size={22} color="black" />
              </TouchableOpacity>
            </>
          )}
          {isComment && thread.repliesCount! > 0 && (
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.replyCount}>
                {thread.repliesCount}{" "}
                {thread.repliesCount === 1 ? "reply" : "replies"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    flexDirection: "row",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  username: {
    fontFamily: Fonts.DM_BOLD,
    fontSize: 16,
  },
  timestamp: {
    color: "#777",
    fontSize: 12,
    fontFamily: Fonts.DM_MEDIUM,
  },
  content: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: Fonts.DM_REGULAR,
  },
  mediaImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  mediaContainer: {
    flexDirection: "row",
    gap: 14,
    paddingRight: 40,
  },
  actions: {
    flexDirection: "row",
    marginTop: 10,
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 5,
  },
  commentContainer: {
    paddingLeft: 30,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: Colors.border,
  },
  commentText: {
    fontSize: 12,
  },
  replyCount: {
    fontSize: 12,
    color: "#fff",
    fontFamily: Fonts.DM_MEDIUM,
  },
});

export default Thread;
