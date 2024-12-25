import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Fonts } from "@/constants/Fonts";
import { Colors } from "@/constants/Colors";
import { ImagePickerAsset } from "expo-image-picker";
import * as ImagePicker from "expo-image-picker";
import * as Sentry from "@sentry/react-native";

const Page = () => {
  const {
    bio: _bio,
    link: _link,
    userId,
    imageUrl,
  } = useLocalSearchParams<{
    bio: string;
    link: string;
    userId: string;
    imageUrl: string;
  }>();
  const [bio, setBio] = useState(_bio);
  const [link, setLink] = useState(_link);
  const [image, setImage] = useState(imageUrl);
  const [selectedImage, setSelectedImage] = useState<ImagePickerAsset | null>(
    null
  );

  const updateUser = useMutation(api.users.updateUser);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);
  const updateImage = useMutation(api.users.updateImage);

  const onSubmit = async () => {
    await updateUser({
      _id: userId as Id<"users">,
      bio,
      websiteUrl: link,
    });

    Sentry.captureEvent({
      message: "User Profile updated",
      extra: {
        bio,
        link,
      },
    });

    if (selectedImage) {
      await updateProfilePicture();
    }

    router.dismiss();
  };

  const updateProfilePicture = async () => {
    const upUrl = await generateUploadUrl();

    const response = await fetch(selectedImage!.uri);
    const blob = await response.blob();

    const res = await fetch(upUrl, {
      method: "POST",
      body: blob,
      headers: {
        "Content-Type": selectedImage!.mimeType!,
      },
    });

    console.log("updateProfilePicture result: ", res);

    const { storageId } = await res.json();
    console.log("Storage id", storageId);

    return updateImage({ storageId, _id: userId as Id<"users"> });
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!res.canceled) {
      setSelectedImage(res.assets[0]);
    }
  };

  //   console.log(JSON.stringify({ bio, link, userId, imageUrl }, null, 2));
  return (
    <View>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={onSubmit}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <TouchableOpacity onPress={pickImage}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage.uri }} style={styles.image} />
        ) : (
          <Image source={{ uri: image }} style={styles.image} />
        )}
      </TouchableOpacity>
      <View style={styles.section}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Hello, im a..."
          numberOfLines={4}
          multiline
          textAlignVertical="top"
          style={styles.bioInput}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Link</Text>
        <TextInput
          value={link}
          onChangeText={setLink}
          placeholder="Your website link"
          autoCapitalize="none"
        />
      </View>
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 5,
    padding: 8,
    margin: 16,
  },
  bioInput: {
    height: 100,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.DM_BOLD,
    marginBottom: 4,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
  },
  doneText: {
    fontFamily: Fonts.DM_BOLD,
    color: Colors.blue,
    fontSize: 16,
  },
});
