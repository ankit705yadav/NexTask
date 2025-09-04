NexTask To-Do App

A React Native To-Do application built for the Nexeed Internship Assignment.

This is a complete mobile application that allows users to manage their daily tasks with a clean, modern, and minimalist dark-themed interface. The app features user authentication and real-time cloud synchronization, ensuring a seamless experience across devices.
App Preview
Note:PleaseaddaGIForafewscreenshotsofyourfinalapplicationhere.Thisisagreatwaytoshowcaseyourworkataglance.
Features

This project successfully implements all core requirements and several bonus features from the assignment brief.
Core Features

    ✅ User Authentication: Secure sign-up and login using email and password.

    ✅ Create Tasks: Easily add new tasks via a simple input.

    ✅ View Tasks: A clean, filterable list of all user-specific tasks.

    ✅ Complete Tasks: Mark tasks as complete with a single tap.

    ✅ Delete Tasks: Remove tasks permanently.

Bonus Features

    ✅ Cloud Sync with Firestore: All tasks are synced in real-time across devices using a secure Firebase Firestore backend.

    ✅ Edit Tasks: An intuitive modal allows users to edit the text of an existing task.

    ✅ Due Dates: Users can assign an optional due date when creating a task.

    ✅ Task Filtering: The main list can be filtered to show "All", "Today's", or "Completed" tasks.

Technical Choices & Justification

This project was built with a focus on modern, efficient, and scalable technologies.

    Framework: Expo CLI

        Why? I chose Expo's managed workflow to accelerate the initial setup and build process. It abstracts away complex native configurations, allowing for a stronger focus on feature development and UI/UX. The inclusion of Expo Router provided a modern, file-based routing system that is intuitive and easy to manage.

    Backend & Database: Firebase (Authentication & Firestore)

        Why? Firebase was the ideal choice for a backend-as-a-service. Its seamless integration with React Native for both Authentication and a real-time Firestore database met the "Cloud Sync" requirement perfectly. The onSnapshot listener in Firestore provides an excellent real-time user experience out of the box, and the security rules ensure that user data is properly protected.

    UI/UX: Minimalist Dark Theme

        Why? To create a polished and user-friendly interface, I implemented a minimalist dark theme. This design choice reduces eye strain, improves focus on content, and provides a modern, professional aesthetic. The use of a simple color palette with a clear accent color for interactive elements creates an intuitive and pleasant user experience.

    State Management: React Hooks (useState, useEffect)

        Why? For an application of this scale, React's built-in hooks are both sufficient and highly efficient. Using useState for local component state and useEffect to manage side effects (like the real-time Firestore listener) keeps the codebase clean, readable, and free of unnecessary boilerplate from larger state management libraries like Redux.

Setup and Run Instructions

Follow these steps to get the project running on your local machine.
Prerequisites

    Node.js (LTS version)

    Expo CLI: npm install -g expo-cli

    Expo Go App: Installed on your iOS or Android device.

1. Clone the Repository

git clone [YOUR_REPOSITORY_URL]
cd nex-task-app

2. Install Dependencies

npm install

3. Firebase Configuration

For convenience during the review process, the Firebase configuration file (firebaseConfig.ts) is included in this repository. You can skip the manual setup and proceed directly to running the application.

A Note on Security and Configuration

    For the convenience of the assignment review process, the firebaseConfig.ts file containing the project's API keys is included in this repository. This allows the project to be run immediately after cloning and installing dependencies without any manual setup.

    ⚠️ IMPORTANT: This is not standard security practice. In a real-world or production application, API keys and other sensitive credentials should never be committed directly to a Git repository. They should be stored in environment variables or a secure secret management service and the config file should be added to .gitignore.

    The Firebase project linked in the configuration is temporary and will be deleted once the review of this assignment is complete.

4. Run the Application

Start the Metro development server.

npm start

Use the Expo Go app on your phone to scan the QR code displayed in the terminal. The app will build and launch on your device.
