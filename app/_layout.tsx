import {
  Slot,
  useNavigationContainerRef,
  useRouter,
  useSegments,
} from "expo-router";
import {
  ClerkLoaded,
  ClerkProvider,
  useAuth,
  useUser,
} from "@clerk/clerk-expo";
import { tokenCache } from "@/utils/cache";
import { LogBox } from "react-native";
import {
  useFonts,
  DMSans_400Regular,
  DMSans_700Bold,
  DMSans_500Medium,
} from "@expo-google-fonts/dm-sans";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import * as Sentry from "@sentry/react-native";

const navigationIntegration = Sentry.reactNavigationIntegration();

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  attachScreenshot: true,
  debug: false,
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // We recommend adjusting this value in production.
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
  _experiments: {
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 1.0,
  },
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  integrations: [navigationIntegration, Sentry.mobileReplayIntegration()],
  enableNativeFramesTracking: true,
});

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

if (!publishableKey) {
  throw new Error("Missing Publishable Key");
}

LogBox.ignoreLogs(["Clerk: Clerk has been loaded with development keys"]);

const InitialLayout = () => {
  const [fonstLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_700Bold,
    DMSans_500Medium,
  });
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    if (fonstLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fonstLoaded]);

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (isSignedIn && !inAuthGroup) {
      router.replace("/(auth)/(tabs)/feed");
    } else if (!isSignedIn && inAuthGroup) {
      router.replace("/(public)");
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (user && user.user) {
      Sentry.setUser({
        email: user.user.emailAddresses[0].emailAddress,
        id: user.user.id,
      });
    } else {
      Sentry.setUser(null);
    }
  }, [user]);

  return <Slot />;
};

function RootLayout() {
  const ref = useNavigationContainerRef();

  useEffect(() => {
    if (ref) {
      navigationIntegration.registerNavigationContainer(ref);
    }
  }, [ref]);

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <InitialLayout />
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}

export default Sentry.wrap(RootLayout);
