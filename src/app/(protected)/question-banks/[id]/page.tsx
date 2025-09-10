
'use client'

import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card";
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

const QuestionBankDetails = () => {
    const params = useParams<{ id: string }>()
    const id = params.id

    const [showDialog, setShowDialog] = useState(false);

    const { data: subjects, isLoading } = useQuery({
        queryKey: ['GET_SUBJECT_DETAIL', id],
        queryFn: () => fetchSubjectDetail(Number(id)),
        enabled: !!id
    });

    return <div className="min-h-screen flex flex-col bg-primary/10">
        <HeaderQuestionBankDetail title={"HELLO"} description="Quiz Preview & Management" onExportAction={() => setShowDialog(true)} />
        <div className="h-full w-full p-3 space-y-3">
            <Card className="shadow-sm bg-white border border-gray-200">
                <CardContent className="p-6 flex flex-col space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h2 className="text-lg font-semibold text-gray-900">Biology</h2>
                    </div>

                    <span className="px-3 py-1 text-xs font-medium text-indigo-700 bg-indigo-100 rounded-full w-fit">
                        Text Input
                    </span>

                    <div className="flex flex-row items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>Created 8/29/2025</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <FileIcon className="w-4 h-4" />
                            <span>10 questions</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="shadow-sm bg-white border border-gray-200">
                <CardContent className="space-y-3">
                    <div className="flex flex-row items-center justify-between">
                        <h1 className="text-2xl font-bold">Generated Questions</h1>
                        <p>{`10 questions generated`}</p>
                    </div>
                    {subjects?.questions_bank && subjects.questions_bank.map((q, idx) => <div key={idx}>
                        {q.type === QuestionType.SINGLE_CHOICE && <SCQQuestionBox question={q} index={idx} />}
                        {q.type === QuestionType.TRUE_FALSE && <TFQuestionBox question={q} index={idx} />}
                        {q.type === QuestionType.FILL_IN_THE_BLANK && <BlankQuestionBox question={q} index={idx} />}
                        {q.type === QuestionType.LONG_ANSWER && <LAQuestionBox question={q} idx={idx} />}
                        {q.type === QuestionType.SHORT_ANSWER && <SAQuestionBox question={q} idx={idx} />}
                        {q.type === QuestionType.MATCHING && <MatchingQuestion question={q} idx={idx} />}
                        {q.type === QuestionType.MULTIPLE_CHOICE && <MCQQuestionBox question={q} index={idx} />}                        
                    </div>)}
                </CardContent>
            </Card>
        </div>
        <ExportDialog data={subjects?.questions_bank ?? []} dialogOpen={showDialog} onClose={() => setShowDialog(false)} />
    </div>
}

export default QuestionBankDetails;