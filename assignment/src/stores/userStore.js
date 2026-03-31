/**
 * User Store (Pinia)
 * Manages authentication state and user data
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOutUser,
    onAuthStateChangedListener
} from '@/services/authService'

export const useUserStore = defineStore('user', () => {
    // State
    const user = ref(null)
    const isAuthenticated = ref(false)
    const loading = ref(false)
    const error = ref(null)

    // Auth readiness — resolves once Firebase has determined the initial auth state
    let _resolveAuthReady
    const authReady = new Promise((resolve) => {
        _resolveAuthReady = resolve
    })

    // Computed
    const isLoggedIn = computed(() => isAuthenticated.value)
    const userName = computed(() => user.value?.displayName || 'User')

    // Methods
    const signup = async (email, password, firstName, lastName) => {
        loading.value = true
        error.value = null
        try {
            const userData = await signUpWithEmail(email, password, firstName, lastName)
            user.value = userData
            isAuthenticated.value = true
            return userData
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const login = async (email, password) => {
        loading.value = true
        error.value = null
        try {
            const userData = await signInWithEmail(email, password)
            user.value = userData
            isAuthenticated.value = true
            return userData
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const loginWithGoogle = async () => {
        loading.value = true
        error.value = null
        try {
            const userData = await signInWithGoogle()
            user.value = userData
            isAuthenticated.value = true
            return userData
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const logout = async () => {
        loading.value = true
        error.value = null
        try {
            await signOutUser()
            user.value = null
            isAuthenticated.value = false
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const setUser = (userData) => {
        user.value = userData
        isAuthenticated.value = !!userData
    }

    const clearError = () => {
        error.value = null
    }

    // Initialize auth listener
    const initializeAuth = (router) => {
        return onAuthStateChangedListener((currentUser) => {
            if (currentUser) {
                setUser({
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL
                })
            } else {
                setUser(null)
            }
            // Signal that Firebase has determined the auth state
            _resolveAuthReady()
        })
    }

    return {
        // State
        user,
        isAuthenticated,
        loading,
        error,
        authReady,

        // Computed
        isLoggedIn,
        userName,

        // Methods
        signup,
        login,
        loginWithGoogle,
        logout,
        setUser,
        clearError,
        initializeAuth
    }
})
