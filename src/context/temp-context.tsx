"use client"

import { createContext, useContext, useState } from "react"

type TempContextType = {
    value: string
    setValue: (val: string) => void
}

const TempContext = createContext<TempContextType | null>(null)

export const TempContextProvider = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const [value, setValue] = useState<string>("")

    return (
        <TempContext.Provider value={{ value, setValue }}>
            {children}
        </TempContext.Provider>
    )
}

export const useTemp = () => {
    const context = useContext(TempContext)
    if (!context) {
        throw new Error("useTemp must be used within TempContextProvider")
    }
    return context
}
