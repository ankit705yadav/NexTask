import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import {
  Checkbox,
  Text,
  Button,
  TextInput,
  FAB,
  Dialog,
  Portal,
  SegmentedButtons,
  Provider as PaperProvider,
  TouchableRipple,
  Modal,
  IconButton,
} from "react-native-paper";
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
  details?: string;
}

export default function ToDoScreen() {
  return (
    <PaperProvider>
      <ToDoComponent />
    </PaperProvider>
  );
}

function ToDoComponent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [text, setText] = useState<string>("");
  const [details, setDetails] = useState<string>("");

  // --- Edit Modal State ---
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editedText, setEditedText] = useState("");
  const [editedDetails, setEditedDetails] = useState(""); // New state for details

  // --- Delete Dialog State ---
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // --- Add Task Modal State ---
  const [newDueDate, setNewDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isAddTaskSheetVisible, setIsAddTaskSheetVisible] = useState(false);
  const addTaskInputRef = useRef<any>(null);

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
    return () => unsubscribe();
  }, []);

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

  useEffect(() => {
    if (isAddTaskSheetVisible) {
      setTimeout(() => {
        addTaskInputRef.current?.focus();
      }, 100);
    }
  }, [isAddTaskSheetVisible]);

  const handleAddTask = async () => {
    const user = auth.currentUser;
    if (text.trim().length === 0 || !user) {
      setIsAddTaskSheetVisible(false);
      return;
    }
    await addDoc(collection(db, "tasks"), {
      text: text,
      completed: false,
      dueDate: newDueDate?.toISOString().slice(0, 10),
      userId: user.uid,
      details: details,
    });
    setText("");
    setDetails("");
    setNewDueDate(undefined);
    setIsAddTaskSheetVisible(false);
  };

  const handleToggleTask = async (id: string, currentStatus: boolean) => {
    const taskDocRef = doc(db, "tasks", id);
    await updateDoc(taskDocRef, { completed: !currentStatus });
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;
    const taskDocRef = doc(db, "tasks", editingTask.id);
    await updateDoc(taskDocRef, {
      text: editedText,
      details: editedDetails, // Save details on update
    });
    setIsEditModalVisible(false);
  };

  const handleDeleteTask = async () => {
    if (!deletingTaskId) return;
    const taskDocRef = doc(db, "tasks", deletingTaskId);
    await deleteDoc(taskDocRef);
    setIsDeleteDialogVisible(false);
    setDeletingTaskId(null);
  };

  const showEditModal = (task: Task) => {
    setEditingTask(task);
    setEditedText(task.text);
    setEditedDetails(task.details || ""); // Populate details, handle if undefined
    setIsEditModalVisible(true);
  };

  const showDeleteDialog = (id: string) => {
    setDeletingTaskId(id);
    setIsDeleteDialogVisible(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewDueDate(selectedDate);
    }
  };

  const handleOpenAddTaskSheet = () => {
    setNewDueDate(new Date());
    setIsAddTaskSheetVisible(true);
  };

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableRipple
      onPress={() => showEditModal(item)} // Changed to showEditModal
      style={
        item.completed
          ? styles.taskContainerCompleted
          : styles.taskContainerActive
      }
    >
      <View style={styles.taskContent}>
        <Checkbox
          status={item.completed ? "checked" : "unchecked"}
          onPress={() => handleToggleTask(item.id, item.completed)}
          color={colors.primary}
        />
        <View style={styles.taskTextContainer}>
          <Text
            variant="bodyLarge"
            style={
              item.completed ? styles.taskTextCompleted : styles.taskTextActive
            }
          >
            {item.text}
          </Text>
          {item.details && (
            <Text style={styles.detailsText}>{item.details}</Text>
          )}
          {item.dueDate && (
            <Text style={styles.dueDateText}>
              Due: {new Date(item.dueDate + "T00:00:00").toLocaleDateString()}
            </Text>
          )}
        </View>
        <IconButton
          icon="delete-outline"
          iconColor={colors.onSurfaceVariant}
          onPress={() => showDeleteDialog(item.id)}
        />
      </View>
    </TouchableRipple>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        <SegmentedButtons
          value={activeFilter}
          onValueChange={setActiveFilter}
          style={styles.filterContainer}
          buttons={[
            { value: "All", label: "All" },
            { value: "Today", label: "Today" },
            { value: "Completed", label: "Completed" },
          ]}
        />
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        <FAB icon="plus" style={styles.fab} onPress={handleOpenAddTaskSheet} />
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={newDueDate || new Date()}
          mode="date"
          display="spinner"
          onChange={onDateChange}
        />
      )}

      <Portal>
        {/* Delete Dialog remains the same */}
        <Dialog
          visible={isDeleteDialogVisible}
          onDismiss={() => setIsDeleteDialogVisible(false)}
        >
          <Dialog.Title>Delete Task?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">This action cannot be undone.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDeleteDialogVisible(false)}>
              Cancel
            </Button>
            <Button onPress={handleDeleteTask} textColor={colors.error}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Edit Task Modal (New) */}
      <Modal
        visible={isEditModalVisible}
        onDismiss={() => setIsEditModalVisible(false)}
        contentContainerStyle={styles.sheetContainer}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>
            Edit Task
          </Text>
          <TextInput
            label="Task Name"
            value={editedText}
            onChangeText={setEditedText}
            mode="outlined"
            style={styles.sheetInput}
          />
          <TextInput
            label="Details (optional)"
            value={editedDetails}
            onChangeText={setEditedDetails}
            mode="outlined"
            style={styles.sheetInput}
            multiline
            numberOfLines={3}
          />
          <View style={styles.modalActions}>
            <Button
              onPress={() => setIsEditModalVisible(false)}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleUpdateTask}
              style={{ flex: 1, marginLeft: 8 }}
            >
              Save Changes
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        visible={isAddTaskSheetVisible}
        onDismiss={() => setIsAddTaskSheetVisible(false)}
        contentContainerStyle={styles.sheetContainer}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TextInput
            ref={addTaskInputRef}
            label="New task"
            value={text}
            onChangeText={setText}
            mode="outlined"
            style={styles.sheetInput}
          />
          <TextInput
            label="Details (optional)"
            value={details}
            onChangeText={setDetails}
            mode="outlined"
            style={styles.sheetInput}
            multiline
            numberOfLines={3}
          />
          <View style={styles.sheetActions}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconButton
                icon="calendar"
                size={24}
                onPress={() => setShowDatePicker(true)}
              />
              {newDueDate && (
                <Text style={styles.dueDateTextSheet}>
                  {newDueDate.toLocaleDateString()}
                </Text>
              )}
            </View>
            <Button
              mode="contained"
              onPress={handleAddTask}
              style={styles.saveButton}
            >
              Save
            </Button>
          </View>
        </KeyboardAvoidingView>
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
  error: "#BA1A1A",
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingTop: 20 },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  taskContainerActive: {
    backgroundColor: colors.primaryContainer,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 28,
  },
  taskContainerCompleted: {
    backgroundColor: colors.surfaceVariant,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 28,
  },
  taskContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  taskTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  taskTextActive: {
    fontWeight: "500",
    color: colors.onPrimaryContainer,
  },
  taskTextCompleted: {
    color: colors.onSurfaceVariant,
    textDecorationLine: "line-through",
  },
  dueDateText: { fontSize: 14, color: colors.onSurfaceVariant, marginTop: 4 },
  detailsText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 6,
    fontStyle: "italic",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 20,
    bottom: 20,
  },
  sheetContainer: {
    marginBottom: 250,
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    margin: 20,
  },
  sheetInput: {
    marginBottom: 16,
    backgroundColor: colors.background,
  },
  sheetActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dueDateTextSheet: {
    color: colors.primary,
    marginLeft: 8,
    fontWeight: "500",
  },
  saveButton: {
    borderRadius: 20,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
});
