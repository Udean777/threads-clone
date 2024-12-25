import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Fonts } from "@/constants/Fonts";
import { Colors } from "@/constants/Colors";
import useUserProfile from "@/hooks/useUserProfile";

const UserProfile = ({ userId }: { userId?: String }) => {
  const profileData = useQuery(api.users.getUserById, {
    userId: userId as Id<"users">,
  });
  const { userPrfl } = useUserProfile();
  const isMe = userId === userPrfl?._id;

  //   console.log(JSON.stringify(profileData, null, 2));

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <View style={styles.profileTextContainer}>
          <Text style={styles.name}>
            {profileData?.first_name} {profileData?.last_name}
          </Text>
          <Text style={styles.username}>@{profileData?.username}</Text>
        </View>
        <Image
          source={{ uri: profileData?.imageUrl + "?" + new Date().getTime() }}
          style={styles.profilePicture}
        />
      </View>
      <Text style={styles.bio}>{profileData?.bio || "No bio."}</Text>
      <Text style={{ fontFamily: Fonts.DM_REGULAR }}>
        {profileData?.followersCount} •{" "}
        {profileData?.websiteUrl || "No websites"}
      </Text>

      <View style={styles.btnRow}>
        {isMe ? (
          <>
            <TouchableOpacity style={styles.btn}>
              <Text style={styles.btnText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btn}>
              <Text style={styles.btnText}>Share Profile</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.solidBtn}>
              <Text style={styles.solidBtnText}>Follow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.solidBtn}>
              <Text style={styles.solidBtnText}>Chat</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileTextContainer: {
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontFamily: Fonts.DM_BOLD,
  },
  username: {
    fontSize: 14,
    fontFamily: Fonts.DM_MEDIUM,
    color: Colors.border,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  bio: {
    fontSize: 14,
    marginVertical: 16,
    fontFamily: Fonts.DM_MEDIUM,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    gap: 12,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    fontFamily: Fonts.DM_BOLD,
  },
  solidBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#09bcff",
  },
  solidBtnText: {
    color: "#fff",
    fontFamily: Fonts.DM_BOLD,
  },
});
