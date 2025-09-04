import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig_temp";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const inTabsGroup = segments[0] === "(tabs)";

      if (user && !inTabsGroup) {
        // User is signed in, redirect to the main app
        router.replace("/(tabs)");
      } else if (!user) {
        // User is not signed in, redirect to the login screen
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [segments]);

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
