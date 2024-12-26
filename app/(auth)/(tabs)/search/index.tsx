import { FlatList, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Fonts } from "@/constants/Fonts";
import { Stack } from "expo-router";
import SearchComponent from "@/components/SearchComponent";
import { Colors } from "@/constants/Colors";
import { Doc } from "@/convex/_generated/dataModel";

const Page = () => {
  const [search, setSearch] = useState("");
  const usersList = useQuery(api.users.searchUserByUsername, { search });

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Search",
          headerTitle: (props) => (
            <View style={{ flex: 1, flexDirection: "row" }}>
              <Text style={{ fontSize: 24, fontFamily: Fonts.DM_BOLD }}>
                {props.children}
              </Text>
            </View>
          ),
          headerSearchBarOptions: {
            placeholder: "Search",
            onChangeText: (event) => setSearch(event.nativeEvent.text),
            tintColor: "#000",
            autoFocus: true,
            hideWhenScrolling: false,
            onCancelButtonPress: () => {},
          },
        }}
      />

      <FlatList
        data={usersList}
        contentInsetAdjustmentBehavior="automatic"
        ItemSeparatorComponent={() => (
          <View
            style={{
              height: StyleSheet.hairlineWidth,
              backgroundColor: Colors.border,
            }}
          />
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>No users found</Text>
        )}
        renderItem={({ item }) => (
          <SearchComponent key={item?._id} user={item as Doc<"users">} />
        )}
      />
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.DM_BOLD,
  },
  user: {
    fontSize: 16,
    fontFamily: Fonts.DM_BOLD,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: Fonts.DM_REGULAR,
    marginTop: 16,
  },
});
