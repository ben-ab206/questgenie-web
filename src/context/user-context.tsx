"use client"

import { UserProfile } from "@/types/user"
import { createContext, useContext } from "react"

const UserContext = createContext<UserProfile | null>(null)

export const UserProvider = ({
    value,
    children,
}: {
    value: UserProfile
    children: React.ReactNode
}) => {
    return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUser = () => {
    const ctx = useContext(UserContext)
    if (!ctx) throw new Error("useUser must be used inside <UserProvider>")
    return ctx
}