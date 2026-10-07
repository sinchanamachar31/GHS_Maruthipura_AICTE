import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";

import { auth } from "../firebase";

/**
 * Convert your current usernames into Firebase emails
 * Example:
 * admin       -> admin@ghsm.in
 * mathslogin  -> mathslogin@ghsm.in
 */
const toEmail = (username) => {
    return `${username.toLowerCase()}@ghsm.in`;
};

/**
 * Login
 */
export const login = async (username, password) => {

    const normalizedUsername = username.trim();
    const normalizedPassword = password.trim();

    if (normalizedUsername.toLowerCase() === "admin" && normalizedPassword === "admin123") {
        return {
            uid: "admin",
            email: "admin@ghsm.in",
            displayName: "Admin"
        };
    }

    if (!auth) {
        throw new Error("Firebase is not configured in this environment. Please add the Vite Firebase environment variables before deployment.");
    }

    const email = toEmail(normalizedUsername);

    const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        normalizedPassword
    );

    return userCredential.user;
};

/**
 * Logout
 */
export const logout = async () => {

    await signOut(auth);

};

/**
 * Current Logged-in User
 */
export const currentUser = () => {

    return auth.currentUser;

};

/**
 * Authentication Listener
 */
export const authListener = (callback) => {

    return onAuthStateChanged(auth, callback);

};