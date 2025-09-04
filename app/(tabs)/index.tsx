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
  Modal,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db, auth } from "../../firebaseConfig_temp";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

interface Task {
  id: string; // Firestore document ID
  text: string;
  completed: boolean;
  dueDate?: string;
  userId: string;
}

export default function ToDoScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [text, setText] = useState<string>("");
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editedText, setEditedText] = useState("");
  const [newDueDate, setNewDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

  // --- REAL-TIME FIRESTORE LISTENER ---
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const tasksCollectionRef = collection(db, "tasks");
    const q = query(tasksCollectionRef, where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData: Task[] = [];
      querySnapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(tasksData);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // --- Filtering logic ---
  useEffect(() => {
    let filtered = [...tasks];
    const today = new Date().toISOString().slice(0, 10);
    if (activeFilter === "Today")
      filtered = filtered.filter((task) => task.dueDate === today);
    else if (activeFilter === "Completed")
      filtered = filtered.filter((task) => task.completed);
    filtered.sort((a, b) =>
      a.completed === b.completed ? 0 : a.completed ? 1 : -1,
    );
    setFilteredTasks(filtered);
  }, [tasks, activeFilter]);

  // --- FIRESTORE CRUD OPERATIONS ---
  const handleAddTask = async () => {
    const user = auth.currentUser;
    if (text.trim().length === 0 || !user) return;

    await addDoc(collection(db, "tasks"), {
      text: text,
      completed: false,
      dueDate: newDueDate?.toISOString().slice(0, 10),
      userId: user.uid,
    });
    setText("");
    setNewDueDate(undefined);
  };

  const handleToggleTask = async (id: string, currentStatus: boolean) => {
    const taskDocRef = doc(db, "tasks", id);
    await updateDoc(taskDocRef, { completed: !currentStatus });
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;
    const taskDocRef = doc(db, "tasks", editingTask.id);
    await updateDoc(taskDocRef, { text: editedText });
    setIsEditModalVisible(false);
  };

  const handleDeleteTask = async (id: string) => {
    const taskDocRef = doc(db, "tasks", id);
    await deleteDoc(taskDocRef);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setEditedText(task.text);
    setIsEditModalVisible(true);
  };
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setNewDueDate(selectedDate);
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity
      onPress={() => handleToggleTask(item.id, item.completed)}
      onLongPress={() =>
        Alert.alert("Delete Task?", "This action cannot be undone.", [
          { text: "Cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => handleDeleteTask(item.id),
          },
        ])
      }
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
        <View style={styles.filterContainer}>
          {["All", "Today", "Completed"].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                styles.filterButton,
                activeFilter === filter && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.datePickerButton}
          >
            <Text>📅</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder={
              newDueDate
                ? `Due: ${newDueDate.toLocaleDateString()}`
                : "Add a task"
            }
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
          value={newDueDate || new Date()}
          mode="date"
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

// --- STYLES ---
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
  container: { flex: 1, paddingTop: 20 },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
  },
  filterButtonActive: { backgroundColor: colors.primary },
  filterButtonText: { color: colors.onSurfaceVariant, fontWeight: "500" },
  filterButtonTextActive: { color: colors.onPrimary },
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
  datePickerButton: { padding: 10 },
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
  modalButtonContainer: { flexDirection: "row" },
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
