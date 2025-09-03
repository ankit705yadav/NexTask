import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Alert,
  Keyboard,
  Modal,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";

// Add dueDate to the Task interface
interface Task {
  id: string;
  text: string;
  completed: boolean;
  dueDate?: string; // Stored as 'YYYY-MM-DD'
}

const TASKS_STORAGE_KEY = "@todo_app_tasks";

export default function ToDoScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editedText, setEditedText] = useState("");
  const [newDueDate, setNewDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
        if (storedTasks !== null) setTasks(JSON.parse(storedTasks));
      } catch (e) {
        Alert.alert("Error", "Failed to load tasks.");
      } finally {
        setIsLoaded(true);
      }
    };
    loadTasks();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const saveTasks = async () => {
        try {
          await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
        } catch (e) {
          Alert.alert("Error", "Failed to save tasks.");
        }
      };
      saveTasks();
    }
  }, [tasks, isLoaded]);

  const handleAddTask = () => {
    if (text.trim().length === 0) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: text,
      completed: false,
      dueDate: newDueDate?.toISOString().slice(0, 10),
    };
    setTasks([newTask, ...tasks]);
    setText("");
    setNewDueDate(undefined);
    Keyboard.dismiss();
  };

  const handleToggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;
    setTasks(
      tasks.map((task) =>
        task.id === editingTask.id ? { ...task, text: editedText } : task,
      ),
    );
    setIsEditModalVisible(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    Alert.alert("Delete Task", "Are you sure?", [
      {
        text: "Delete",
        onPress: () => setTasks(tasks.filter((task) => task.id !== id)),
        style: "destructive",
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditedText(task.text);
    setIsEditModalVisible(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setNewDueDate(selectedDate);
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity
      onPress={() => handleToggleTask(item.id)}
      onLongPress={() => handleDeleteTask(item.id)}
      style={
        item.completed
          ? styles.taskContainerCompleted
          : styles.taskContainerActive
      }
    >
      <View style={{ flex: 1 }}>
        <Text
          style={
            item.completed ? styles.taskTextCompleted : styles.taskTextActive
          }
        >
          {item.text}
        </Text>
        {item.dueDate && (
          <Text style={styles.dueDateText}>
            Due: {new Date(item.dueDate + "T00:00:00").toLocaleDateString()}
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={() => openEditModal(item)}
        style={styles.editButton}
      >
        <Text style={styles.editButtonText}>✎</Text>
      </TouchableOpacity>
    </TouchableOpacity>
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
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.datePickerButton}
          >
            <Text style={styles.datePickerButtonText}>📅</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder={
              newDueDate
                ? `Due: ${newDueDate.toLocaleDateString()}`
                : "Add a task"
            }
            placeholderTextColor={colors.onSurfaceVariant}
            value={text}
            onChangeText={setText}
          />
        </View>
      </View>

      <TouchableOpacity onPress={handleAddTask} style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={newDueDate || new Date()}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onDateChange}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TextInput
              style={styles.modalInput}
              value={editedText}
              onChangeText={setEditedText}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleUpdateTask}
              >
                <Text style={styles.modalSaveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryContainer,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 20,
    borderRadius: 28,
  },
  taskContainerCompleted: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceVariant,
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
  taskTextCompleted: {
    fontSize: 18,
    color: colors.onSurfaceVariant,
    textDecorationLine: "line-through",
  },
  dueDateText: { fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4 },
  editButton: { padding: 10, marginLeft: 10 },
  editButtonText: { fontSize: 20, color: colors.onPrimaryContainer },
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
  datePickerButton: { padding: 10, marginRight: 10 },
  datePickerButtonText: { fontSize: 24 },
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  modalInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    padding: 10,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  modalSaveButton: { backgroundColor: colors.primary },
  modalSaveButtonText: { color: colors.onPrimary },
});
