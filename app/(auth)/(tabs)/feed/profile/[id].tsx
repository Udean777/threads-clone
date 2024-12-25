import React from "react";
import { useLocalSearchParams } from "expo-router";
import Profile from "@/components/Profile";
import { Id } from "@/convex/_generated/dataModel";

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  //   console.log(id);

  return <Profile userId={id as Id<"users">} showBackBtn={true} />;
};

export default Page;
