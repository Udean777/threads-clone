import {
  Alert,
  Image,
  InputAccessoryView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { ImagePickerAsset } from "expo-image-picker";
import * as ImagePicker from "expo-image-picker";

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
  const [mediaFiles, setMediaFiles] = useState<ImagePicker.ImagePickerAsset[]>(
    []
  );

  const { userPrfl } = useUserProfile();

  const addThread = useMutation(api.messages.addThread);
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);

  const handleSubmitThreads = async () => {
    const mediaIds = await Promise.all(mediaFiles.map(uploadMediaThread));
    console.log("Media images", mediaIds);

    addThread({
      threadId,
      content: threadContent,
      mediaFiles: mediaIds,
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

  const pickImage = async (source: "camera" | "library") => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
    };

    let result;

    if (source === "library") {
      result = await ImagePicker.launchImageLibraryAsync(options);
    } else {
      result = await ImagePicker.launchCameraAsync(options);
    }

    if (!result.canceled) {
      setMediaFiles([result.assets[0], ...mediaFiles]);
    }
  };

  const removeImage = (index: number) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  const uploadMediaThread = async (image: ImagePickerAsset) => {
    const uploadUrl = await generateUploadUrl();

    const response = await fetch(image!.uri);
    const blob = await response.blob();

    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": image!.mimeType! },
      body: blob,
    });
    const { storageId } = await result.json();

    return storageId;
  };

  return (
    <TouchableOpacity
      style={[
        isPreview && {
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          pointerEvents: "box-only",
        },
        {
          flex: 1,
        },
      ]}
      onPress={() => router.push("/(auth)/(modal)/create")}
    >
      <KeyboardAvoidingView
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
            {mediaFiles.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {mediaFiles.map((file, index) => (
                  <View style={styles.mediaContainer} key={file.assetId}>
                    <Image
                      source={{ uri: file.uri }}
                      style={styles.mediaImage}
                    />
                    <TouchableOpacity
                      style={styles.deleteIconContainer}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close" size={24} color={"#fff"} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            <View style={styles.iconRow}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => pickImage("library")}
              >
                <Ionicons
                  name="images-outline"
                  size={24}
                  color={Colors.border}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => pickImage("camera")}
              >
                <Ionicons
                  name="camera-outline"
                  size={24}
                  color={Colors.border}
                />
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
          isPreview ? null : (
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
          )
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
    </TouchableOpacity>
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
