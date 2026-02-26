/**
 * Authentication Service
 * Handles user authentication with Firebase
 */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile,
    onAuthStateChanged
} from 'firebase/auth'
import { auth } from './firebase'

const googleProvider = new GoogleAuthProvider()

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email, password, firstName, lastName) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)

        // Update user profile with name
        await updateProfile(userCredential.user, {
            displayName: `${firstName} ${lastName}`
        })

        return {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            photoURL: userCredential.user.photoURL,
            firstName,
            lastName
        }
    } catch (error) {
        throw error
    }
}

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)

        return {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            photoURL: userCredential.user.photoURL
        }
    } catch (error) {
        throw error
    }
}

/**
 * Sign in with Google account
 */
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider)

        return {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL
        }
    } catch (error) {
        throw error
    }
}

/**
 * Sign out current user
 */
export const signOutUser = async () => {
    try {
        await signOut(auth)
    } catch (error) {
        throw error
    }
}

/**
 * Listen to authentication state changes
 */
export const onAuthStateChangedListener = (callback) => {
    return onAuthStateChanged(auth, callback)
}

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
    return auth.currentUser
}

export default {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOutUser,
    onAuthStateChangedListener,
    getCurrentUser
}
