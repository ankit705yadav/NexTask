import { Tabs } from "expo-router";
import { TouchableOpacity, Text } from "react-native";
import { auth } from "../../firebaseConfig_temp";

export default function TabLayout() {
  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Tasks",
          headerRight: () => (
            <TouchableOpacity
              onPress={handleLogout}
              style={{ marginRight: 15 }}
            >
              <Text style={{ color: "#0B6A6D", fontSize: 16 }}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}
