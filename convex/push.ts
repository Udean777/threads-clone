import { v } from "convex/values";
import { internalAction } from "./_generated/server";

const EXPO_ACCESS_TOKEN = process.env.EXPO_ACCESS_TOKEN;

export const sendPushNotifications = internalAction({
  args: {
    pushToken: v.string(),
    threadTitle: v.string(),
    threadBody: v.string(),
    threadId: v.id("messages"),
  },
  handler: async ({}, { pushToken, threadTitle, threadBody, threadId }) => {
    console.log("Notification pushed");

    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${EXPO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: pushToken,
        sound: "default",
        body: threadBody,
        title: threadTitle,
        data: {
          threadId,
        },
      }),
    }).then((res) => res.json());

    return res;
  },
});
