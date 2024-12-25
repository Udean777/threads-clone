import { Button, StyleSheet, Text, View } from "react-native";
import React from "react";
import * as Sentry from "@sentry/react-native";

const Page = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Page</Text>
      <Button
        onPress={() => Sentry.captureException(new Error("Test error"))}
        title="Test Error"
      />
    </View>
  );
};

export default Page;

const styles = StyleSheet.create({});
