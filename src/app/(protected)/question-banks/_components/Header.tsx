"use client";

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { useRouter } from "next/navigation";

const HeaderQuestionBank = () => {
    const router = useRouter()

    return <div className="w-full shadow-sm flex flex-row justify-between items-center px-5">
        <div className="w-full bg-white space-y-1 py-2 ">
            <h1 className="text-2xl font-semibold">Question Bank</h1>
            <p className="text-sm text-gray-800">Manage your AI-generated question sets and export them to any platform</p>
        </div>
        <Button
            onClick={()=> { router.push("/generate")}}
        >
            <Sparkles className="w-4 h-4 mr-2" />
            {"Generate Questions"}
        </Button>
    </div>
}

export default HeaderQuestionBank