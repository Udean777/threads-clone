import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Fonts";

const Thread = ({
  thread,
}: {
  thread: Doc<"messages"> & { creator: Doc<"users"> };
}) => {
  const {
    content,
    mediaFiles,
    likeCount,
    commentCount,
    retweetCount,
    creator,
  } = thread;

  //   console.log(creator.imageUrl);

  return (
    <View style={styles.container}>
      <Image source={{ uri: creator?.imageUrl }} style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.username}>{creator.username}</Text>
            <Text style={styles.timestamp}>
              {new Date(thread._creationTime).toLocaleString()}
            </Text>
          </View>
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color={Colors.border}
          />
        </View>
        <Text style={styles.content}>{content}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
            <Ionicons name="heart-outline" size={24} color="black" />
            <Text style={styles.actionText}>{likeCount}</Text>
          </TouchableOpacity>
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
});

export default Thread;
