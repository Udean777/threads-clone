import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Colors } from "@/components/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useOAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const LoginScreen = () => {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const data = useQuery(api.users.getAllUsers);

  // console.log(JSON.stringify(data, null, 2));

  const handleGoogleLogin = async () => {
    try {
      const { createdSessionId, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      }
    } catch (error) {
      console.error("Google login error:", error);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/threads-logo-black.png")}
          style={styles.loginBtnImg}
        />
        <Text style={styles.title}>Threads</Text>
      </View>
      <View style={styles.btnContainer}>
        <TouchableOpacity style={styles.btnLogin} onPress={handleGoogleLogin}>
          <View style={styles.loginBtnContent}>
            <Image
              source={require("@/assets/images/icons8-google-96.png")}
              style={styles.loginBtnImg}
            />
            <Text style={styles.loginBtnText}>Login with Google</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.border} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.btnContainer}>
        <TouchableOpacity style={styles.btnLogin} onPress={() => {}}>
          <View style={styles.loginBtnContent}>
            <Image
              source={require("@/assets/images/instagram_icon.webp")}
              style={styles.loginBtnImg}
            />
            <Text style={styles.loginBtnText}>Login with Instagram</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.border} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // gap: 20,
    // backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  title: {
    fontSize: 20,
    fontFamily: "DMSans_700Bold",
    // textAlign: "center",
    color: "#333",
  },
  btnContainer: {
    width: "100%",
    padding: 20,
  },
  btnLogin: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  loginBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    // flex: 1,
  },
  loginBtnImg: {
    width: 40,
    height: 40,
    // marginRight: 15,
  },
  loginBtnText: {
    color: "#000",
    fontSize: 16,
    fontFamily: "DMSans_500Medium",
    flex: 1,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default LoginScreen;
