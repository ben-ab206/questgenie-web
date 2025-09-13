"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import HeaderQuestionBank from "./_components/Header";
import { ArrowUpRight, Calendar1Icon, Eye, FileChartColumnIcon, FileIcon, FilterIcon, Plus, SearchIcon, Trash2Icon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchSubjects } from "@/services/subjects";
import { Badge } from "@/components/ui/badge";
import { getQuestionTypeLabel } from "@/lib/utils";
import { QuestionType } from "@/types/questions";
import format from "date-fns/format";
import { InputIcon } from "@/components/ui/input-icon";
import { useState } from "react";

const QuestionBanksPage = () => {
    const router = useRouter();
    const [ query, setQuery ] = useState("");

    const handleCreateFirstQuiz = () => {
        router.push("/generate")
    }

    const { data, isLoading } = useQuery({
        queryKey: ['GET_SUBJECTS', query],
        queryFn: () => fetchSubjects({ search: query })
    })

    const goToDetail = (id: number) => {
        router.push(`question-banks/${id}`)
    }

    const renderQuizCardSkeleton = () => (
        <Card className="rounded-3xl">
            <CardContent className="p-4 space-y-8">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-3" />
                <div className="flex flex-row items-center space-x-1 mb-3">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex items-center w-full space-x-2">
                    <Skeleton className="flex-grow h-8 rounded" />
                    <Skeleton className="h-4 w-4" />
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen flex flex-col">
            <HeaderQuestionBank />
            <div className="flex flex-col flex-1 space-y-4 p-3 bg-primary/10">
                {/* Top stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    <Card className="bg-white rounded-2xl shadow-md">
                        <CardContent className="flex flex-col w-full h-full p-4">
                            <div className="flex flex-row justify-between items-center mb-2">
                                <p className="text-base font-medium">Questions Set</p>
                                <FileIcon className="w-5 h-5 text-gray-600" />
                            </div>
                            <p className="text-3xl font-bold">{data ? data.metadata.totalCount ?? 0 : 0}</p>
                            <p className="text-sm text-gray-500">Generated question sets</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white rounded-2xl shadow-md">
                        <CardContent className="flex flex-col w-full h-full p-4">
                            <div className="flex flex-row justify-between items-center mb-2">
                                <p className="text-base font-medium">Recent Activity</p>
                                <FileIcon className="w-5 h-5 text-gray-600" />
                            </div>
                            <p className="text-3xl font-bold">{data ? data.metadata.recentCount ?? 0 : 0}</p>
                            <p className="text-sm text-gray-500">New this week</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white rounded-2xl shadow-md">
                        <CardContent className="flex flex-col w-full h-full p-4">
                            <div className="flex flex-row justify-between items-center mb-2">
                                <p className="text-base font-medium">Engagement</p>
                                <ArrowUpRight className="w-5 h-5 text-gray-600" />
                            </div>
                            <p className="text-3xl font-bold">-</p>
                            <p className="text-sm text-gray-500">Coming soon ...</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="flex-1 flex flex-col bg-white rounded-2xl shadow-md">
                    <CardContent className="p-6 flex-1 flex flex-col space-y-6">
                        <div className="flex flex-row justify-between items-center space-x-5">
                            <div className="flex-grow">
                                <InputIcon
                                    icon={<SearchIcon />}
                                    value={query}
                                    className="bg-gray-50"
                                    placeholder="Search ..."
                                    onChange={(e)=> setQuery(e.target.value)}
                                />
                            </div>
                            <button className="bg-gray-100 rounded-lg flex flex-row items-center justify-center p-2 space-x-2 text-gray-800 px-3 hover:bg-primary/10">
                                <FilterIcon className="h-4 w-4"/>
                                <span>Filter</span>
                            </button>
                        </div>
                        {
                            isLoading ? (
                                <div className="grid grid-cols-4 gap-2">
                                    {Array.from({ length: 12 }).map((_, idx) => (
                                        <div key={idx}>
                                            {renderQuizCardSkeleton()}
                                        </div>
                                    ))}
                                </div>
                            ) : data && data.data.length > 0 ? (
                                <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                    {data.data.map((s, idx) => {
                                        const types: string[] = JSON.parse(s.type)
                                        return (
                                            <Card key={idx} className="rounded-3xl">
                                                <CardContent className="p-6 space-y-4">
                                                    <FileChartColumnIcon className="h-8 w-8" />
                                                    <div className="text-xl">{s.title}</div>
                                                    <div className="flex flex-row space-x-2">{types.map((e, idx) => <span key={idx} className="px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-full w-fit">
                                                        {getQuestionTypeLabel(e as QuestionType)}
                                                    </span>)}</div>
                                                    <div className="flex flex-row items-center space-x-1 mb-3 text-gray-700">
                                                        <Calendar1Icon className="h-4 w-4" />
                                                        <p className="text-sm">Created at</p>
                                                        <p className="text-sm">{format(s.created_at, 'dd/MM/yyyy')}</p>
                                                    </div>
                                                    <div className="flex items-center w-full space-x-4">
                                                        <button
                                                            className="flex flex-grow bg-primary/10 rounded justify-center items-center py-2 space-x-2 hover:bg-primary/20"
                                                            onClick={() => goToDetail(s.id)}
                                                        >
                                                            <Eye className="h-5 w-5"/>
                                                            <span>View</span>
                                                        </button>
                                                        <button className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded h-full">
                                                            <Trash2Icon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            ) : query === "" ?(
                                <div className="flex-1 flex flex-col items-center justify-center">
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
                            ): <div className="flex-1 flex flex-col items-center justify-center">
                                    <div className="text-center">
                                        <h2 className="text-2xl text-gray-500 mb-2">
                                            No questions bank
                                        </h2>
                                    </div>
                                </div>
                        }
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default QuestionBanksPage;