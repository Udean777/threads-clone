import {
  Alert,
  Image,
  InputAccessoryView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import useUserProfile from "@/hooks/useUserProfile";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { router, Stack } from "expo-router";
import { FontAwesome6, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Fonts } from "@/constants/Fonts";
import { Colors } from "@/constants/Colors";

type ThreadComposerProps = {
  isPreview?: boolean;
  isReply?: boolean;
  threadId?: Id<"messages">;
};

const ThreadComposer = ({
  isPreview,
  isReply,
  threadId,
}: ThreadComposerProps) => {
  const [threadContent, setThreadContent] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);

  const { userPrfl } = useUserProfile();

  const addThread = useMutation(api.messages.addThread);

  const handleSubmitThreads = async () => {
    addThread({
      threadId,
      content: threadContent,
      // mediaFiles,
    });

    setThreadContent("");
    setMediaFiles([]);

    router.dismiss();
  };

  const removeThread = () => {
    setThreadContent("");
    setMediaFiles([]);
  };

  const handleCancel = () => {
    setThreadContent("");
    Alert.alert("Discard thread?", "", [
      {
        text: "Discard",
        onPress: () => router.dismiss(),
        style: "destructive",
      },
      {
        text: "Save Draft",
        style: "cancel",
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{
        flex: 1,
      }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          ),
          headerTitleAlign: "center",
          headerTitleStyle: {
            fontFamily: Fonts.DM_BOLD,
            fontSize: 20,
          },
        }}
      />

      <View style={styles.topRow}>
        <Image
          source={{ uri: userPrfl?.imageUrl as string }}
          style={styles.avatar}
        />
        <View style={styles.centerContainer}>
          <Text style={styles.username}>{userPrfl?.username}</Text>
          <TextInput
            style={styles.input}
            placeholder={
              isReply ? "Reply to a thread" : "What's you gonna make?"
            }
            value={threadContent}
            onChangeText={setThreadContent}
            multiline
            autoFocus={!isPreview}
            inputAccessoryViewID="123456"
          />
          <View style={styles.iconRow}>
            <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
              <Ionicons name="images-outline" size={24} color={Colors.border} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
              <Ionicons name="camera-outline" size={24} color={Colors.border} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialIcons name="gif" size={24} color={Colors.border} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="mic-outline" size={24} color={Colors.border} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <FontAwesome6 name="hashtag" size={24} color={Colors.border} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons
                name="stats-chart-outline"
                size={24}
                color={Colors.border}
              />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.cancelButton, { opacity: isPreview ? 0 : 1 }]}
          onPress={removeThread}
        >
          <Ionicons name="close" size={24} color={Colors.border} />
        </TouchableOpacity>
      </View>
      {/* Custom Input Accessory for Android */}
      {Platform.OS === "android" ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: Colors.border,
            backgroundColor: "#f8f8f8",
          }}
        >
          <Text style={styles.keyboardAccessoryText}>
            {isReply
              ? "Everyone can reply and quote"
              : " Profiles that you follow can reply and quote"}
          </Text>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitThreads}
          >
            <Text style={styles.submitButtonText}>Post</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <InputAccessoryView nativeID="123456">
          <View style={styles.keyboardAccessory}>
            <Text style={styles.keyboardAccessoryText}>
              {isReply
                ? "Everyone can reply and quote"
                : " Profiles that you follow can reply and quote"}
            </Text>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitThreads}
            >
              <Text style={styles.submitButtonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </KeyboardAvoidingView>
  );
};

export default ThreadComposer;

const styles = StyleSheet.create({
  cancelText: {
    fontSize: 14,
    fontFamily: Fonts.DM_BOLD,
    color: "red",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 25,
    alignSelf: "flex-start",
  },
  username: {
    fontSize: 16,
    fontFamily: Fonts.DM_BOLD,
  },
  centerContainer: {
    flex: 1,
  },
  input: {
    fontSize: 14,
    maxHeight: 100,
  },
  cancelButton: {
    marginLeft: 12,
    alignSelf: "flex-start",
  },
  iconRow: {
    flexDirection: "row",
    paddingVertical: 12,
  },
  iconButton: {
    marginRight: 16,
  },
  keyboardAccessory: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingLeft: 64,
    gap: 12,
  },
  keyboardAccessoryText: {
    flex: 1,
    color: Colors.border,
  },
  submitButton: {
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  mediaContainer: {
    position: "relative",
    marginRight: 10,
    marginTop: 10,
  },
  deleteIconContainer: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    padding: 4,
  },
  mediaImage: {
    width: 100,
    height: 200,
    borderRadius: 6,
    marginRight: 10,
    marginTop: 10,
  },
});
