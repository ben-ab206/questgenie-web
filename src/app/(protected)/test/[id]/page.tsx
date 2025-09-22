'use client'

import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchSubjectDetail } from "@/services/subjects";
import { QuestionType } from "@/types/questions";
import { useState } from "react";
import Header from "../_components/Header";
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import SCQQuestionBoxForm from "../_components/SCQQuestionBoxForm";
import TFQuestionBoxForm from "../_components/TFQestionBoxForm";
import BlankQuestionBoxForm from "../_components/BlankQuestionBoxForm";
import MCQQuestionBoxForm from "../_components/MCQQuestionBoxForm";
import MatchingQuestionBoxForm from "../_components/MatchingQuestionBoxForm";
import SAQuestionBoxForm from "../_components/SAQuestionBoxForm";
import LAQuestionBoxForm from "../_components/LAQuestionBoxForm";


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


    const [isSubmitting, setIsSubmitting ] = useState(false)
    const [email, setEmail] = useState("")
    const [scqAnswers, setScqAnswers] = useState<Record<number, string>>({})
    const [tfAnswers, setTfAnswers] = useState<Record<number, string>>({})
    const [blankAnswers, setBlankAnswers] = useState<Record<number, string>>({})
    const [mcqAnswers, setMcqAnswers] = useState<Record<number, string[]>>({})
    const [matchingAnswers, setMatchingAnswers] = useState<Record<number, Record<string, string>>>({}) 
    const [sAnswers, setSAnswers] = useState<Record<number, string>>({})
    const [lAnswers, setLAnswers] = useState<Record<number, string>>({})




    const router = useRouter();

    const { data: subjects, isLoading } = useQuery({
        queryKey: ['GET_SUBJECT_DETAIL', id],
        queryFn: () => fetchSubjectDetail(Number(id)),
        enabled: !!id
    });
    console.log(subjects)

    const types: string[] = subjects?.type ? JSON.parse(subjects.type) : []


     const handleSCQAnswerChange = (questionId: number, selectedOption: string) => {
        setScqAnswers(prev => ({
            ...prev,
            [questionId]: selectedOption
        }));
    };

    const handleTFAnswerChange = (questionId: number, selectedOption: string) => {
        setTfAnswers(prev => ({
            ...prev,
            [questionId]: selectedOption
        }));
    };

    const handleBlankAnswerChange = (questionId: number, selectedOption: string) => {
        setBlankAnswers(prev => ({
            ...prev,
            [questionId]: selectedOption
        }));
    };

    const handleMCQAnswerChange = (questionId: number, selectedOptions: string[]) => {
        setMcqAnswers(prev => ({
            ...prev,
            [questionId]: selectedOptions
        }));
    };

    const handleMatchingAnswerChange = (questionId: number, matches: Record<string, string>) => {
        setMatchingAnswers(prev => ({
            ...prev,
            [questionId]: matches
        }));
    };

    const handleSAnswerChange = (questionId: number, selectedOption: string) => {
        setSAnswers(prev => ({
            ...prev,
            [questionId]: selectedOption
        }));
    };

    const handleLAnswerChange = (questionId: number, selectedOption: string) => {
        setLAnswers(prev => ({
            ...prev,
            [questionId]: selectedOption
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            alert("Please enter your email");
            return;
        }

    
         const scqQuestionIds = subjects?.questions_bank?.filter(q => q.type === QuestionType.SINGLE_CHOICE).map(q => q.id) || [];
        const tfQuestionIds = subjects?.questions_bank?.filter(q => q.type === QuestionType.TRUE_FALSE).map(q => q.id) || [];
        const blankQuestionIds = subjects?.questions_bank?.filter(q => q.type === QuestionType.FILL_IN_THE_BLANK).map(q => q.id) || [];
        const mcqQuestionIds = subjects?.questions_bank?.filter(q => q.type === QuestionType.MULTIPLE_CHOICE).map(q => q.id) || [];
        const matchingQuestionIds = subjects?.questions_bank?.filter(q => q.type === QuestionType.MATCHING).map(q => q.id) || [];
        const sQuestionIds = subjects?.questions_bank?.filter(q => q.type === QuestionType.SHORT_ANSWER).map(q => q.id) || [];
        const lQuestionIds = subjects?.questions_bank?.filter(q => q.type === QuestionType.LONG_ANSWER).map(q => q.id) || [];


        // Check if all questions are answered by question ID
        const unansweredSCQ = scqQuestionIds.filter(id => !scqAnswers[id] || scqAnswers[id].trim() === '');
        const unansweredTF = tfQuestionIds.filter(id => !tfAnswers[id] || tfAnswers[id].trim() === '');
        const unansweredBlank = blankQuestionIds.filter(id => !blankAnswers[id] || blankAnswers[id].trim() === '');
        const unansweredMCQ = mcqQuestionIds.filter(id => !mcqAnswers[id] || mcqAnswers[id].length === 0)
        // const unansweredMatcching = matchingQuestionIds.filter(id => !matchingAnswers[id] || matchingAnswers[id].trim() === '')
        const unansweredS = sQuestionIds.filter(id => !sAnswers[id] || sAnswers[id].trim() === '');
        const unansweredL = lQuestionIds.filter(id => !lAnswers[id] || lAnswers[id].trim() === '');


        if (unansweredSCQ.length > 0 || unansweredTF.length > 0 || unansweredBlank.length > 0 || unansweredMCQ.length > 0 || unansweredS.length >0 || unansweredL.length >0) {
            console.log("Unanswered questions:", { unansweredSCQ, unansweredTF, unansweredBlank });
            alert("Please answer all questions before submitting");
            return;
        }


        setIsSubmitting(true);
        
        try {
            // Prepare submission data
            const submissionData = {
                email,
                subjectId: id,
                scqAnswers: scqAnswers,
                tfAnswers: tfAnswers,
                blankAnswers: blankAnswers,
                mcqAnswers: mcqAnswers,
                matchingAnswers: matchingAnswers,
                sAnswers: sAnswers,
                lAnswers: lAnswers,
            };

            console.log("Submitting:", submissionData);
            alert("Form submitted successfully!");
      
            
        } catch (error) {
            console.error("Submission error:", error);
            alert("Failed to submit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-primary/10 overflow-hidden">
            <div className="flex-shrink-0 sticky top-0 z-50 bg-white shadow-sm">
              <Header/>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <div className="h-full w-full p-3 space-y-3">
                    <form onSubmit={handleSubmit} className="h-full w-full p-3 space-y-3">
                    {isLoading ? (
                        <SubjectDetailSkeleton />
                    ) : (
                        <Card className="shadow-sm bg-white border border-gray-200 rounded-3xl">
                            <CardContent className="p-6 flex flex-col space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                       Your Email
                                    </h2>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                        </svg>
                                    </div>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        className="block w-full pl-10 pr-3 py-3 rounded-lg bg-gray-50 placeholder-gray-500 text-gray-900 focus:outline-none"
                                        required
                                    />
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
                                    <h1 className="text-2xl font-bold">Questions</h1>
                                    <p>{`${subjects?.questions_bank?.length || 0} questions `}</p>
                                </div>

                                {subjects?.questions_bank && subjects.questions_bank.length > 0 ? (
                                    subjects.questions_bank.map((q, idx) => (
                                        <div key={idx}>
                                            {q.type === QuestionType.SINGLE_CHOICE && 
                                                <SCQQuestionBoxForm 
                                                    question={q} 
                                                    index={idx} 
                                                    onAnswerChange={handleSCQAnswerChange} 
                                                    selectedAnswer={scqAnswers[q.id] || ""} 
                                                />
                                            }
                                            {q.type === QuestionType.TRUE_FALSE && 
                                                <TFQuestionBoxForm 
                                                    question={q} 
                                                    index={idx} 
                                                    onAnswerChange={handleTFAnswerChange} 
                                                    selectedAnswer={tfAnswers[q.id] || ""} 
                                                />
                                            }
                                            {q.type === QuestionType.FILL_IN_THE_BLANK && 
                                                <BlankQuestionBoxForm 
                                                    question={q} 
                                                    index={idx} 
                                                    onAnswerChange={handleBlankAnswerChange} 
                                                    selectedAnswer={blankAnswers[q.id] || ""} 
                                                />
                                            }
                                            {q.type === QuestionType.MULTIPLE_CHOICE && 
                                                <MCQQuestionBoxForm 
                                                    question={q} 
                                                    index={idx} 
                                                    onAnswerChange={handleMCQAnswerChange} 
                                                    selectedAnswer={mcqAnswers[q.id] || []} 
                                                />
                                            }
                                              {q.type === QuestionType.MATCHING && 
                                                <MatchingQuestionBoxForm 
                                                    question={q} 
                                                    index={idx} 
                                                    onAnswerChange={handleMatchingAnswerChange} 
                                                    selectedAnswers={matchingAnswers[q.id] || {}} 
                                                />
                                            }
                                             {q.type === QuestionType.SHORT_ANSWER && 
                                                <SAQuestionBoxForm
                                                    question={q} 
                                                    index={idx} 
                                                    onAnswerChange={handleSAnswerChange} 
                                                    selectedAnswer={sAnswers[q.id] || ''} 
                                                />
                                            }
                                            {q.type === QuestionType.LONG_ANSWER && 
                                                <LAQuestionBoxForm
                                                    question={q} 
                                                    index={idx} 
                                                    onAnswerChange={handleLAnswerChange} 
                                                    selectedAnswer={lAnswers[q.id] || ''} 
                                                />
                                            }

                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No questions available
                                    </div>
                                )}

                                <div className="py-3">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                                                Submitting...
                                            </>
                                        ): (
                                            <>
                                            <Sparkles className="w-4 h-4 ml-2"/>
                                            Submit
                                            </>
                                        )}
                                        
                                    </Button>
                                </div>
                            </CardContent>
                            
                        </Card>
                    )}
                    </form>
                </div>
            </div>
        </div>
    )
}

export default QuestionBankDetails;