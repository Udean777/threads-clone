import { View, Text, ActivityIndicator } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import Thread from "@/components/Thread";
import { Colors } from "@/constants/Colors";
import ThreadComposer from "../create";

const Page = () => {
  const { id } = useLocalSearchParams();
  const thread = useQuery(api.messages.getThreadById, {
    threadId: id as Id<"messages">,
  });

  return (
    <View style={{ flex: 1 }}>
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

      <ThreadComposer isReply={true} threadId={id as Id<"messages">} />
    </View>
  );
};

export default Page;
