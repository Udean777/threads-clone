import { View, Text } from "react-native";
import React from "react";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const useUserProfile = () => {
  const { user } = useUser();
  const clerkId = user?.id;

  const userPrfl = useQuery(api.users.getUserByClerkId, { clerkId });

  return {
    userPrfl,
    isLoading: userPrfl === undefined,
    error: userPrfl === null,
  };
};

export default useUserProfile;
