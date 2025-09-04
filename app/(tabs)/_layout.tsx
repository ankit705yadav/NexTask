import { Tabs } from "expo-router";
import { TouchableOpacity } from "react-native";
import { auth } from "../../firebaseConfig_temp";
import { MaterialIcons } from "@expo/vector-icons";

export default function TabLayout() {
  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { display: "none" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tasks",
          headerRight: () => (
            <TouchableOpacity
              onPress={handleLogout}
              style={{ marginRight: 15 }}
            >
              <MaterialIcons name="logout" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}
