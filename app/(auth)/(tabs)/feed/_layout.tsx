import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: "#fff",
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="profile/[id]" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Thread",
          headerTitleAlign: "center",
          headerShadowVisible: false,
          headerRight: () => (
            <Ionicons name="notifications-outline" size={24} color="#000" />
          ),
          headerTintColor: "#000",
          headerBackTitle: "Back",
        }}
      />
    </Stack>
  );
};

export default Layout;
