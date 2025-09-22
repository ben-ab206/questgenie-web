"use client";

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { useRouter } from "next/navigation";

const Header = () => {
    const router = useRouter()

    return <div className="w-full shadow-sm flex flex-row justify-between items-center px-5">
        <div className="w-full bg-white space-y-1 py-2 ">
            <h1 className="text-2xl font-semibold">Biology</h1>
            <p className="text-sm text-gray-800">Quuiz Preview & Management</p>
        </div>
        <Button
            // onClick={()=> { router.push("/generate")}}
        >
            <Sparkles className="w-4 h-4" />
            
        </Button>
       <span className="ml-2"> QuestGenie</span>
    </div>
}

export default Header