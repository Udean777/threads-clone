import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const AuthLayout = () => {
  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: "#fff",
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(modal)"
        options={{
          presentation: "modal",
          title: "New Thread",
          headerRight: () => (
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal-circle" size={24} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
};

export default AuthLayout;
