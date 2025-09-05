"use client"

import { Card, CardContent } from "@/components/ui/card";
import HeaderQuestionBank from "./_components/Header";
import { InputIcon } from "@/components/ui/input-icon";
import { Calendar, Calendar1Icon, CalendarIcon, Plus, SearchIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchSubjects } from "@/services/subjects";

const QuestionBanksPage = () => {
    const router = useRouter();

    const handleCreateFirstQuiz = () => {
        router.push("/generate")
    }

    const { data, isLoading } = useQuery({
        queryKey: ['GET_SUBJECTS'],
        queryFn: () => fetchSubjects()
    })

    return (
        <div className="min-h-screen flex flex-col">
            <HeaderQuestionBank />
            <div className="flex-1 p-4">
                <Card className="h-full flex flex-col bg-white">
                    <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="flex flex-row w-full space-x-2 mb-6">
                            <div className="flex-grow">
                                <InputIcon
                                    placeholder="Search quizzes ..."
                                    className="w-full"
                                    icon={<SearchIcon className="h-4 w-4" />}
                                />
                            </div>
                            <div>
                                <Button>
                                    Filter
                                </Button>
                            </div>
                        </div>

                        {
                            data && data.data.length > 0 ?
                                <div className="grid grid-cols-4 gap-2">
                                    {data.data.map((s, idx)=> <Card key={idx}>
                                        <CardContent>
                                            <div>{s.title}</div>
                                            <div>{s.type}</div>
                                            <div className="flex flex-row space-x-1">
                                                <Calendar1Icon className="h-4 w-4"/>
                                                <p className="text-xs">Created at</p>
                                                <p className="text-xs">{s.created_at}</p>
                                            </div>
                                            <div className="flex items-center w-full space-x-2">
                                                <button className="flex-grow bg-primary/10 rounded py-1">
                                                    <span>View</span>
                                                </button>
                                                <TrashIcon className="h-4 w-4"/>
                                            </div>
                                        </CardContent>
                                    </Card>)}
                                </div> : <div className="flex-1 flex flex-col items-center justify-center">
                                    <div className="text-center">
                                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                                            No quizzes yet
                                        </h2>
                                        <p className="text-gray-600 mb-8">
                                            Get started by creating your first quiz
                                        </p>
                                    </div>
                                    <Button
                                        onClick={handleCreateFirstQuiz}
                                        data-testid="create-your-first-quiz"
                                        size="lg"
                                        className="flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create Your First Quiz
                                    </Button>
                                </div>
                        }
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default QuestionBanksPage;