import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import useUserProfile from "@/hooks/useUserProfile";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import UserProfile from "./UserProfile";
import { Colors } from "@/constants/Colors";
import Tabs from "./Tabs";

type ProfileProps = {
  showBackBtn?: boolean;
  userId?: Id<"users">;
};

const Profile = ({ userId, showBackBtn = false }: ProfileProps) => {
  const { userPrfl } = useUserProfile();
  const { top } = useSafeAreaInsets();
  const { signOut } = useAuth();

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <FlatList
        data={[]}
        renderItem={() => <Text>Hello</Text>}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              {showBackBtn ? (
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => router.back()}
                >
                  <Ionicons name="chevron-back" size={24} />
                  <Text>Back</Text>
                </TouchableOpacity>
              ) : (
                <MaterialCommunityIcons name="web" size={24} />
              )}
              <View style={styles.headerIcons}>
                <Ionicons name="logo-instagram" size={24} />
                <TouchableOpacity onPress={() => signOut()}>
                  <Ionicons name="log-out-outline" size={24} />
                </TouchableOpacity>
              </View>
            </View>
            {userId ? (
              <UserProfile userId={userId} />
            ) : (
              <UserProfile userId={userPrfl?._id} />
            )}
            <Tabs onTabChange={() => {}} />
          </>
        }
        ListEmptyComponent={() => (
          <View
            style={[
              styles.container,
              { justifyContent: "center", alignItems: "center" },
            ]}
          >
            <Text style={styles.tabContentText}>No data found.</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  separator: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  tabContentText: {
    fontSize: 17,
    color: Colors.border,
    textAlign: "center",
    marginVertical: 16,
  },
});

export default Profile;
