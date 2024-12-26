import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Link, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import Thread from "@/components/Thread";
import useUserProfile from "@/hooks/useUserProfile";
import Comments from "@/components/Comments";

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const thread = useQuery(api.messages.getThreadById, {
    threadId: id as Id<"messages">,
  });
  const { userPrfl } = useUserProfile();

  //   console.log(id);

  return (
    <View style={{ flexGrow: 1 }}>
      <ScrollView>
        {thread ? (
          <Thread
            thread={
              thread as Doc<"messages"> & {
                creator: Doc<"users">;
                isLiked: boolean;
              }
            }
          />
        ) : (
          <ActivityIndicator color={Colors.blue} size={"large"} />
        )}

        <Comments threadId={id as Id<"messages">} />
      </ScrollView>

      <View style={styles.border} />
      <Link href={`/(auth)/(modal)/reply/${id}`} asChild>
        <TouchableOpacity style={styles.replyButton}>
          <Image
            source={{ uri: userPrfl?.imageUrl as string }}
            style={styles.replyButtonImage}
          />
          <Text>Reply to @{thread?.creator?.username}</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  border: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  replyButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    margin: 6,
    backgroundColor: Colors.itemBackground,
    borderRadius: 100,
    gap: 10,
  },
  replyButtonImage: {
    width: 25,
    height: 25,
    borderRadius: 15,
  },
});
