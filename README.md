# NexTask To-Do App

A **React Native To-Do application** built with **Expo** and **Firebase** for the Nexeed Internship Assignment.
This complete mobile application allows users to manage their daily tasks with a **clean, modern, and intuitive interface**.

The app features **secure user authentication**, **real-time cloud synchronization**, and **full offline capabilities**, ensuring a **seamless and reliable user experience**.

---

## 📱 App Preview
*(A preview of the main task screen and the "Add Task" modal)*

---

## ✨ Features

### **Core Features**
- ✅ **User Authentication** – Secure sign-up and login with email & password, including client-side validation and specific error handling.
- ✅ **Create Tasks** – Easily add new tasks with a title and optional details.
- ✅ **View Tasks** – A clean, filterable list of all user-specific tasks presented in modern UI cards.
- ✅ **Complete Tasks** – Mark tasks as complete with a single tap.
- ✅ **Delete Tasks** – Remove tasks permanently with a confirmation dialog.

### **Bonus & Advanced Features**
- 🌟 **Real-Time Cloud Sync** – All tasks are synced in real time across devices using Firebase Firestore.
- 📶 **Offline Support** – Fully functional offline; changes sync automatically when back online.
- ✏️ **Edit Tasks** – Edit title and details of any existing task via an intuitive modal.
- 📅 **Due Dates** – Assign an optional due date to tasks.
- 🔍 **Task Filtering** – Filter list by "All", "Today's", or "Completed" tasks.
- 🎨 **Modern UI/UX** – Built with `react-native-paper` for smooth animations, Material Design components, and a consistent design.

---

## 🛠 Technology Stack

| Category      | Technology |
|---------------|------------|
| Framework     | Expo |
| UI Library    | React Native Paper |
| Backend       | Firebase Authentication & Cloud Firestore |
| State Mgmt    | React Hooks (`useState`, `useEffect`) |
| Language      | TypeScript |

---

## 📌 Technical Choices & Justification

### **Framework: Expo**
> Chosen for its managed workflow, which speeds up development by abstracting complex native configurations, allowing more focus on features & UX.

### **UI Library: React Native Paper**
> Offers a rich set of pre-built, themeable components that follow Material Design principles, ensuring a polished and intuitive user interface.

### **Backend & Database: Firebase**
> Perfect for **real-time sync**, offline persistence, and secure authentication without heavy backend setup.

### **State Management: React Hooks**
> Simple and efficient for this app’s scale, keeping the codebase clean and performant.

---

## ⚡ Setup and Run Instructions

### **Prerequisites**
- [Node.js (LTS)](https://nodejs.org/en/)
- [Expo Go](https://expo.dev/client) app installed on your iOS or Android device

### **1. Clone the Repository**
```bash
git https://github.com/ankit705yadav/NexTask
cd NexTask
````

### **2. Install Dependencies**

```bash
npm install
```

### **3. Firebase Configuration**

A `firebaseConfig_temp.js` file with API keys is included for convenience in the review process.

> ⚠️ **Note:** This is not secure for production. In a real app, API keys should be stored in environment variables and excluded from version control.

The linked Firebase project is **temporary** and will be deleted after the review.

### **4. Run the Application**

```bash
npx run start
```

* Scan the QR code using the **Expo Go** app.
* The app will launch on your device.

---

## 🔒 Security Notice

This project contains a **temporary** Firebase configuration for ease of review. In production:

* Store keys in a `.env` file
* Add config files to `.gitignore`
* Use Firebase Security Rules to protect data

---

## 📄 License

This project was built as part of the **Nexeed Internship Assignment** and is for educational/review purposes only.
