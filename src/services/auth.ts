import { UserProfile } from "@/types/user"

const login = async ({ email, password }: { email: string, password: string }) => {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
            }),
        })

        const data = await response.json()

        if (response.ok) {
            return data
        } else {
            throw new Error(data.error || 'Login failed')
        }
    } catch (err) {
        throw err
    }
}

const getCurrentUser = async () => {
    try {
        const response = await fetch('/api/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })

        const data = await response.json()

        if (response.ok) {
            return data.data as UserProfile
        } else {
            throw new Error(data.error || 'Login failed')
        }
    } catch (err) {
        throw err
    }
}

const updateCurrentUser = async ({ name, email }: { name?: string, email?: string }) => {
    try {
        const response = await fetch('/api/profile', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
            }),
        })

        const data = await response.json()

        if (response.ok) {
            return data.data as UserProfile
        } else {
            throw new Error(data.error || 'Login failed')
        }
    } catch (err) {
        throw err
    }
}


const signInWithoutPassword = async ({ email }: { email: string }) => {
    try {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
            }),
        })

        const data = await response.json()

        if (response.ok) {
            return data.data as UserProfile
        } else {
            throw new Error(data.error || 'Sign in failed')
        }
    } catch (err) {
        throw err
    }
}

const verifyOTP = async ({ email, token }: { email: string, token: string }) => {
    try {
        const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                token
            }),
        })

        const data = await response.json()

        if (response.ok) {
            return data.data as UserProfile
        } else {
            throw new Error(data.error || 'Verify OTP failed')
        }
    } catch (err) {
        throw err
    }
}

export { login, getCurrentUser, updateCurrentUser, signInWithoutPassword, verifyOTP }