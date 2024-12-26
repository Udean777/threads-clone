import { useState, useEffect, useRef } from "react";
import { Text, View, Button, Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import useUserProfile from "./useUserProfile";
import { Id } from "@/convex/_generated/dataModel";
import { router } from "expo-router";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      handleRegistrationError(
        "Permission not granted to get push token for push notification!"
      );
      return;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }

    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      console.log(`String token: ${pushTokenString}`);

      return pushTokenString;
    } catch (e) {
      handleRegistrationError(
        `Error in try catch inside registerForPushNotificationsAsync: ${e}`
      );
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
};

export const usePushNotifications = () => {
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  const updateUser = useMutation(api.users.updateUser);
  const { userPrfl } = useUserProfile();

  useEffect(() => {
    if (!Device.isDevice) return;

    registerForPushNotificationsAsync()
      .then((token) => {
        if (token && userPrfl?._id) {
          updateUser({ pushToken: token, _id: userPrfl?._id as Id<"users"> });
        }
      })
      .catch((e) =>
        console.log("Error in useeffect inside usePushNotifications", e)
      );

    // This is for received the notifications
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log(`Notifications received: ${notification}`);
      });

    // When tapped to the notifications, it will received the listener and navigate to feed details
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((res) => {
        const threadId = res.notification.request.content.data.threadId;

        console.log(`ThreadId: ${threadId}`);

        router.push(`/feed/${threadId}`);
      });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );

      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [userPrfl?._id]);
};

const handleRegistrationError = (errorMsg: string) => {
  alert(errorMsg);
  throw new Error(errorMsg);
};
