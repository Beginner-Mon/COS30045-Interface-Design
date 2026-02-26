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
    onAuthStateChanged,
    sendEmailVerification
} from 'firebase/auth'
import { auth } from './firebase'

const googleProvider = new GoogleAuthProvider()

// Global auth listener state
let unsubscribeAuthListener = null
const authListeners = new Set()

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

        // Send email verification
        let verificationSent = false
        let verificationError = null
        
        try {
            if (!auth) {
                throw new Error('Firebase authentication is not configured. Email verification cannot be sent.')
            }
            await sendEmailVerification(userCredential.user)
            verificationSent = true
        } catch (emailError) {
            console.warn('Email verification failed:', emailError.message)
            // Don't fail signup if email verification fails
            verificationError = emailError.message
        }

        return {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            photoURL: userCredential.user.photoURL,
            firstName,
            lastName,
            emailVerified: false,
            verificationSent,
            verificationError: verificationError ? `Email verification issue: ${verificationError}` : null
        }
    } catch (error) {
        const friendlyMessage = getFriendlyErrorMessage(error)
        throw new Error(friendlyMessage)
    }
}

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)

        // Block login if email is not verified
        if (!userCredential.user.emailVerified) {
            // Sign out the user
            await signOut(auth)
            throw new Error('Please verify your email before logging in. Check your inbox for the verification link.')
        }

        return {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            photoURL: userCredential.user.photoURL,
            emailVerified: userCredential.user.emailVerified
        }
    } catch (error) {
        const friendlyMessage = getFriendlyErrorMessage(error)
        throw new Error(friendlyMessage)
    }
}

/**
 * Sign in with Google account
 */
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider)
        const user = result.user

        // Detect if this is first-time Google sign-in
        const isNewUser = result.operationType === 'signIn' && result.additionalUserInfo?.isNewUser

        return {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            isNewUser,
            message: isNewUser ? 'Welcome! Your account has been created.' : 'Welcome back!'
        }
    } catch (error) {
        // Handle Google-specific errors with friendly messages
        const friendlyMessage = getFriendlyGoogleErrorMessage(error)
        throw new Error(friendlyMessage)
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
 * Initialize global auth listener (call once at app startup)
 */
export const initializeAuthListener = () => {
    if (unsubscribeAuthListener) return // Already initialized

    if (!auth) {
        console.warn('Firebase not configured. Auth listener not started.')
        return () => {}
    }

    unsubscribeAuthListener = onAuthStateChanged(auth, (user) => {
        authListeners.forEach(callback => callback(user))
    })

    return unsubscribeAuthListener
}

/**
 * Subscribe to global auth state changes
 */
export const subscribeToAuthChanges = (callback) => {
    authListeners.add(callback)

    // Return unsubscribe function
    return () => {
        authListeners.delete(callback)
    }
}

/**
 * Listen to authentication state changes (legacy - use subscribeToAuthChanges instead)
 */
export const onAuthStateChangedListener = (callback) => {
    if (!auth) {
        // Firebase not configured in this environment — call back with null and return no-op
        callback(null)
        return () => {}
    }
    return onAuthStateChanged(auth, callback)
}

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
    return auth.currentUser
}

/**
 * Helper: Convert Firebase error codes to friendly messages
 */
const getFriendlyErrorMessage = (error) => {
    const errorCode = error.code || error.message

    const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered. Try logging in instead.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Your password is too weak. Use at least 6 characters with a mix of letters and numbers.',
        'auth/user-not-found': 'We couldn\'t find an account with this email. Please sign up first.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/too-many-requests': 'Too many failed login attempts. Please try again later.',
        'auth/account-exists-with-different-credential': 'An account already exists with this email but using a different login method.',
        'auth/operation-not-allowed': 'This authentication method is not enabled. Please contact support.',
        'auth/invalid-credential': 'The credentials provided are invalid. Please try again.',
    }

    return errorMessages[errorCode] || error.message || 'An authentication error occurred. Please try again.'
}

/**
 * Helper: Convert Google-specific errors to friendly messages
 */
const getFriendlyGoogleErrorMessage = (error) => {
    const errorCode = error.code || error.message

    const googleErrorMessages = {
        'auth/popup-blocked': 'The login popup was blocked. Please disable your popup blocker and try again.',
        'auth/popup-closed-by-user': 'Login was cancelled. Please try again.',
        'auth/account-exists-with-different-credential': 'You\'ve previously signed in with a different method. Please use the same method.',
        'auth/operation-not-allowed': 'Google sign-in is not available. Please contact support.',
        'auth/unauthorized-domain': 'This domain is not authorized to use Google sign-in.',
    }

    return googleErrorMessages[errorCode] || getFriendlyErrorMessage(error)
}

export default {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOutUser,
    onAuthStateChangedListener,
    subscribeToAuthChanges,
    initializeAuthListener,
    getCurrentUser
}
