import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Thread from "./Thread";

const Comments = ({ threadId }: { threadId: Id<"messages"> }) => {
  const comments = useQuery(api.messages.getComments, {
    threadId: threadId as Id<"messages">,
  });

  return (
    <View>
      {comments?.map((comment) => (
        <Thread
          thread={
            comment as Doc<"messages"> & {
              creator: Doc<"users">;
              isLiked: boolean;
            }
          }
        />
      ))}
    </View>
  );
};

export default Comments;

const styles = StyleSheet.create({});
