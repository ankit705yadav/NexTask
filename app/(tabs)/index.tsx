import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Keyboard,
} from "react-native";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export default function ToDoScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState<string>("");

  const handleAddTask = () => {
    if (text.trim().length === 0) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: text,
      completed: false,
    };
    setTasks([newTask, ...tasks]);
    setText("");
    Keyboard.dismiss();
  };

  const renderTask = ({ item }: { item: Task }) => (
    <View style={styles.taskContainerActive}>
      <Text style={styles.taskTextActive}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Today</Text>
        </View>

        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a task"
            placeholderTextColor={colors.onSurfaceVariant}
            value={text}
            onChangeText={setText}
          />
        </View>
      </View>

      <TouchableOpacity onPress={handleAddTask} style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const colors = {
  primary: "#0B6A6D",
  onPrimary: "#FFFFFF",
  primaryContainer: "#A2F2F4",
  onPrimaryContainer: "#002021",
  surface: "#FBFDFD",
  surfaceVariant: "#E2E3E3",
  onSurface: "#191C1C",
  onSurfaceVariant: "#414848",
  outline: "#717878",
  background: "#FBFDFD",
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  header: { paddingHorizontal: 20, marginTop: 24, marginBottom: 16 },
  title: { fontSize: 34, fontWeight: "bold", color: colors.onSurface },
  taskContainerActive: {
    backgroundColor: colors.primaryContainer,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 20,
    borderRadius: 28,
  },
  taskTextActive: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.onPrimaryContainer,
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 28,
    paddingHorizontal: 24,
    fontSize: 18,
    height: 56,
    color: colors.onSurface,
  },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabIcon: { color: colors.onPrimary, fontSize: 32, lineHeight: 32 },
});
