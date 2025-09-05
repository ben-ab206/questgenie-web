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

export { login }