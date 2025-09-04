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
  Modal,
  IconButton,
  Card,
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

// Defines the structure for a single task object, used throughout the component.
interface Task {
  id: string; // Firestore document ID
  text: string;
  completed: boolean;
  dueDate?: string;
  userId: string;
  details?: string;
}

// The main screen component is wrapped in PaperProvider to enable theme features.
export default function ToDoScreen() {
  return (
    <PaperProvider>
      <ToDoComponent />
    </PaperProvider>
  );
}

// This component contains all the logic and UI for the to-do list.
function ToDoComponent() {
  // --- Component State Management ---

  // Data state: holds the raw task list from Firestore and the list after filtering.
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  // Input state: for the 'Add Task' modal text fields.
  const [text, setText] = useState<string>("");
  const [details, setDetails] = useState<string>("");

  // Edit Modal state: for managing the visibility and content of the 'Edit Task' modal.
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editedText, setEditedText] = useState("");
  const [editedDetails, setEditedDetails] = useState("");

  // Delete Dialog state: for managing the visibility and target task of the delete confirmation.
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // Add Task Modal state: manages date, filter, and visibility for the 'Add Task' process.
  const [newDueDate, setNewDueDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [isAddTaskSheetVisible, setIsAddTaskSheetVisible] = useState(false);

  // Ref to control the text input inside the 'Add Task' modal.
  const addTaskInputRef = useRef<any>(null);

  // --- Side Effects ---

  // Effect to fetch tasks from Firestore in real-time when the component mounts.
  // It subscribes to changes and updates the 'tasks' state.
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
    // Cleanup function to unsubscribe from Firestore listener on component unmount.
    return () => unsubscribe();
  }, []);

  // Effect to apply filters ('All', 'Today', 'Completed') whenever the tasks or filter change.
  useEffect(() => {
    let filtered = [...tasks];
    const today = new Date().toISOString().slice(0, 10);
    if (activeFilter === "Today")
      filtered = filtered.filter((task) => task.dueDate === today);
    else if (activeFilter === "Completed")
      filtered = filtered.filter((task) => task.completed);

    // Sorts tasks to show uncompleted items first.
    filtered.sort((a, b) =>
      a.completed === b.completed ? 0 : a.completed ? 1 : -1,
    );
    setFilteredTasks(filtered);
  }, [tasks, activeFilter]);

  // Effect to automatically focus the text input when the 'Add Task' modal becomes visible.
  useEffect(() => {
    if (isAddTaskSheetVisible) {
      setTimeout(() => {
        addTaskInputRef.current?.focus();
      }, 100); // Small delay allows the modal animation to finish.
    }
  }, [isAddTaskSheetVisible]);

  // --- Handler Functions ---

  // Adds a new task document to the Firestore 'tasks' collection.
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
    // Reset input fields and close the modal after adding.
    setText("");
    setDetails("");
    setNewDueDate(undefined);
    setIsAddTaskSheetVisible(false);
  };

  // Toggles the 'completed' status of a task in Firestore.
  const handleToggleTask = async (id: string, currentStatus: boolean) => {
    const taskDocRef = doc(db, "tasks", id);
    await updateDoc(taskDocRef, { completed: !currentStatus });
  };

  // Updates the text and details of an existing task in Firestore.
  const handleUpdateTask = async () => {
    if (!editingTask) return;
    const taskDocRef = doc(db, "tasks", editingTask.id);
    await updateDoc(taskDocRef, {
      text: editedText,
      details: editedDetails,
    });
    setIsEditModalVisible(false);
  };

  // Deletes a task document from Firestore.
  const handleDeleteTask = async () => {
    if (!deletingTaskId) return;
    const taskDocRef = doc(db, "tasks", deletingTaskId);
    await deleteDoc(taskDocRef);
    setIsDeleteDialogVisible(false);
    setDeletingTaskId(null);
  };

  // Opens the edit modal and pre-populates it with the selected task's data.
  const showEditModal = (task: Task) => {
    setEditingTask(task);
    setEditedText(task.text);
    setEditedDetails(task.details || "");
    setIsEditModalVisible(true);
  };

  // Opens the delete confirmation dialog.
  const showDeleteDialog = (id: string) => {
    setDeletingTaskId(id);
    setIsDeleteDialogVisible(true);
  };

  // Handles date selection from the DateTimePicker.
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewDueDate(selectedDate);
    }
  };

  // Opens the 'Add Task' modal and sets the default due date to today.
  const handleOpenAddTaskSheet = () => {
    setNewDueDate(new Date());
    setIsAddTaskSheetVisible(true);
  };

  // --- Render Functions ---

  // Renders a single task item as a tappable Card component.
  const renderTask = ({ item }: { item: Task }) => (
    <Card
      style={styles.card}
      onPress={() => showEditModal(item)}
      mode={item.completed ? "contained" : "elevated"} // Style changes if task is completed.
    >
      <Card.Content style={styles.taskContent}>
        {/* Checkbox for marking the task as complete. */}
        <Checkbox
          status={item.completed ? "checked" : "unchecked"}
          onPress={() => handleToggleTask(item.id, item.completed)}
          color={colors.primary}
        />
        {/* Container for all task-related text. */}
        <View style={styles.taskTextContainer}>
          <Text
            variant="bodyLarge"
            style={
              item.completed ? styles.taskTextCompleted : styles.taskTextActive
            }
          >
            {item.text}
          </Text>
          {/* Conditionally renders details if they exist. */}
          {item.details && (
            <Text style={styles.detailsText}>{item.details}</Text>
          )}
          {/* Conditionally renders due date if it exists. */}
          {item.dueDate && (
            <Text style={styles.dueDateText}>
              Due: {new Date(item.dueDate + "T00:00:00").toLocaleDateString()}
            </Text>
          )}
        </View>
        {/* Button to delete the task. */}
        <IconButton
          icon="delete-outline"
          iconColor={colors.onSurfaceVariant}
          onPress={() => showDeleteDialog(item.id)}
        />
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        {/* Filter buttons to switch between All, Today, and Completed views. */}
        <SegmentedButtons
          value={activeFilter}
          onValueChange={setActiveFilter}
          style={styles.filterContainer}
          buttons={[
            { value: "All", label: "All", icon: "format-list-bulleted" },
            { value: "Today", label: "Today", icon: "calendar" },
            { value: "Completed", label: "Completed", icon: "check" },
          ]}
        />
        {/* Displays the list of filtered tasks. */}
        <FlatList
          data={filteredTasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        {/* Floating Action Button to open the 'Add Task' modal. */}
        <FAB icon="plus" style={styles.fab} onPress={handleOpenAddTaskSheet} />
      </View>

      {/* --- Modals and Dialogs --- */}

      {/* Legacy DateTimePicker, shown conditionally. */}
      {showDatePicker && (
        <DateTimePicker
          value={newDueDate || new Date()}
          mode="date"
          display="spinner"
          onChange={onDateChange}
        />
      )}

      {/* Portal is used to render modals and dialogs above all other content. */}
      <Portal>
        {/* Dialog for confirming task deletion. */}
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

      {/* Modal for editing an existing task. */}
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

      {/* Modal for adding a new task. */}
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

// --- Color Palette and Styles ---

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
  card: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  taskContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  taskTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  taskTextActive: {
    fontWeight: "500",
    color: colors.onSurface,
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
