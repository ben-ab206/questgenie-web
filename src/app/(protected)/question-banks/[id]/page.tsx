'use client'

import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import HeaderQuestionBankDetail from "../_components/HeaderQuestionBankDetail";
import { Calendar, FileIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchSubjectDetail } from "@/services/subjects";
import { QuestionType } from "@/types/questions";
import SCQQuestionBox from "@/components/SCQQuestionBox";
import TFQuestionBox from "@/components/TFQuestionBox";
import BlankQuestionBox from "@/components/BlankQuestionBox";
import LAQuestionBox from "@/components/LAQuestionBox";
import SAQuestionBox from "@/components/SAQuestionBox";
import { useState } from "react";
import ExportDialog from "../_components/ExportDialog";
import MatchingQuestion from "@/components/MatchingQuestionBox";
import MCQQuestionBox from "@/components/MCQQuestionBox";
import { getQuestionTypeLabel } from "@/lib/utils";

const QuestionSkeleton = () => (
    <Card className="shadow-sm bg-white border border-gray-200 rounded-3xl">
        <CardContent className="p-6 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </div>
        </CardContent>
    </Card>
);

const SubjectDetailSkeleton = () => (
    <Card className="shadow-sm bg-white border border-gray-200 ">
        <CardContent className="p-6 flex flex-col space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <Skeleton className="h-6 w-32" />
            </div>

            <Skeleton className="h-6 w-20 rounded-full" />

            <div className="flex flex-row items-center gap-6">
                <div className="flex items-center gap-1">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-28" />
                </div>
                <div className="flex items-center gap-1">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
        </CardContent>
    </Card>
);

const QuestionsListSkeleton = () => (
    <Card className="shadow-sm bg-white border border-gray-200 rounded-3xl">
        <CardContent className="space-y-3">
            <div className="flex flex-row items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-5 w-32" />
            </div>
            <div className="space-y-3">
                {Array.from({ length: 3 }, (_, idx) => (
                    <QuestionSkeleton key={idx} />
                ))}
            </div>
        </CardContent>
    </Card>
);

const QuestionBankDetails = () => {
    const params = useParams<{ id: string }>()
    const id = params.id

    const [showDialog, setShowDialog] = useState(false);

    const { data: subjects, isLoading } = useQuery({
        queryKey: ['GET_SUBJECT_DETAIL', id],
        queryFn: () => fetchSubjectDetail(Number(id)),
        enabled: !!id
    });

    const types: string[] = subjects?.type ? JSON.parse(subjects.type) : []

    return (
        <div className="h-screen flex flex-col bg-primary/10 overflow-hidden">
            <div className="flex-shrink-0 sticky top-0 z-50 bg-white shadow-sm">
                <HeaderQuestionBankDetail
                    title={isLoading ? "Loading..." : subjects?.title || "HELLO"}
                    description="Quiz Preview & Management"
                    onExportAction={() => setShowDialog(true)}
                />
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="h-full w-full p-3 space-y-3">
                    {isLoading ? (
                        <SubjectDetailSkeleton />
                    ) : (
                        <Card className="shadow-sm bg-white border border-gray-200 rounded-3xl">
                            <CardContent className="p-6 flex flex-col space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {subjects?.title ?? "Biology"}
                                    </h2>
                                </div>

                                {types.map((t, idx) => <span key={idx} className="px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-full w-fit">
                                    {getQuestionTypeLabel(t as QuestionType)}
                                </span>)}



                                <div className="flex flex-row items-center gap-6 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            Created {subjects?.created_at ? new Date(subjects.created_at).toLocaleDateString() : "8/29/2025"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FileIcon className="w-4 h-4" />
                                        <span>{subjects?.questions_bank?.length || 0} questions</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Questions List Card */}
                    {isLoading ? (
                        <QuestionsListSkeleton />
                    ) : (
                        <Card className="shadow-sm bg-white border border-gray-200 rounded-3xl">
                            <CardContent className="space-y-3 py-5">
                                <div className="flex flex-row items-center justify-between">
                                    <h1 className="text-2xl font-bold">Generated Questions</h1>
                                    <p>{`${subjects?.questions_bank?.length || 0} questions generated`}</p>
                                </div>

                                {subjects?.questions_bank && subjects.questions_bank.length > 0 ? (
                                    subjects.questions_bank.map((q, idx) => (
                                        <div key={idx}>
                                            {q.type === QuestionType.SINGLE_CHOICE && <SCQQuestionBox question={q} index={idx} />}
                                            {q.type === QuestionType.TRUE_FALSE && <TFQuestionBox question={q} index={idx} />}
                                            {q.type === QuestionType.FILL_IN_THE_BLANK && <BlankQuestionBox question={q} index={idx} />}
                                            {q.type === QuestionType.LONG_ANSWER && <LAQuestionBox question={q} idx={idx} />}
                                            {q.type === QuestionType.SHORT_ANSWER && <SAQuestionBox question={q} idx={idx} />}
                                            {q.type === QuestionType.MATCHING && <MatchingQuestion question={q} idx={idx} />}
                                            {q.type === QuestionType.MULTIPLE_CHOICE && <MCQQuestionBox question={q} index={idx} />}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No questions available
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            <ExportDialog
                data={subjects?.questions_bank ?? []}
                dialogOpen={showDialog}
                onClose={() => setShowDialog(false)}
            />
        </div>
    )
}

export default QuestionBankDetails;