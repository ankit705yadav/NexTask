import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import {
  TextInput,
  Button,
  Text,
  Provider as PaperProvider,
} from "react-native-paper";
import { auth } from "../firebaseConfig_temp";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

// Wrap the main export in PaperProvider to enable theme features.
export default function LoginScreen() {
  return (
    <PaperProvider>
      <LoginComponent />
    </PaperProvider>
  );
}

function LoginComponent() {
  // --- Component State ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  // --- Validation and Handlers ---

  // A simple regex for email validation.
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Handles user registration with validation.
  const handleSignUp = () => {
    // 1. Client-side validation before calling Firebase.
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password must be at least 6 characters long.",
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Sign Up Error", "Passwords do not match.");
      return;
    }

    // 2. Create user with Firebase auth.
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log("Registered with:", user.email);
        Alert.alert(
          "Success",
          "Account created successfully! You can now log in.",
        );
        setIsSignUp(false); // Switch back to login screen after successful sign-up
      })
      .catch((error) => {
        // 3. Handle specific Firebase errors.
        if (error.code === "auth/email-already-in-use") {
          Alert.alert(
            "Sign Up Error",
            "An account with this email address already exists.",
          );
        } else {
          Alert.alert(
            "Sign Up Error",
            "An unexpected error occurred. Please try again.",
          );
        }
        console.error("Sign up error:", error);
      });
  };

  // Handles user login with validation and specific error messages.
  const handleLogin = () => {
    // 1. Client-side validation.
    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (!password) {
      Alert.alert("Password Required", "Please enter your password.");
      return;
    }

    // 2. Sign in with Firebase auth.
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log("Logged in with:", user.email);
      })
      .catch((error) => {
        // 3. Provide specific feedback for common login errors.
        if (error.code === "auth/user-not-found") {
          Alert.alert(
            "Login Error",
            "Account not found. Please check your email or sign up.",
          );
        } else if (error.code === "auth/wrong-password") {
          Alert.alert("Login Error", "Incorrect password. Please try again.");
        } else {
          Alert.alert(
            "Login Error",
            "An unexpected error occurred. Please try again.",
          );
        }
        console.error("Login error:", error);
      });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>
          Welcome to NexTask
        </Text>
        <Text variant="bodyMedium" style={styles.quote}>
          "The secret of getting ahead is getting started."
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          mode="outlined"
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
          mode="outlined"
        />

        {isSignUp && (
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            secureTextEntry
            mode="outlined"
          />
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={isSignUp ? handleSignUp : handleLogin}
          style={styles.button}
          labelStyle={styles.buttonText}
        >
          {isSignUp ? "Create Account" : "Login"}
        </Button>

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.toggleText}>
            {isSignUp
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FBFDFD",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontWeight: "bold",
    color: "#002021",
  },
  quote: {
    marginTop: 8,
    fontStyle: "italic",
    color: "#414848",
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    marginBottom: 12,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 10,
  },
  button: {
    paddingVertical: 8,
    backgroundColor: "#0B6A6D",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  toggleText: {
    marginTop: 20,
    textAlign: "center",
    color: "#0B6A6D",
    fontWeight: "bold",
  },
});
