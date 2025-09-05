"use client"

import { DifficultyLevel, QuestionType } from "@/types/questions"
import { useMutation } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Youtube, Image, FileText, Upload, Minus, Plus, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import FileUpload from "@/components/FileUpload";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HeaderGenerate from "./_components/Header";
import Tesseract, { Worker as TesseractWorker } from "tesseract.js";
import { generateQuestions } from "@/services/questions";

let worker: TesseractWorker | null = null;

const initWorker = async () => {
    if (!worker) {
        worker = await Tesseract.createWorker({
            logger: (m) => console.log(m),
        });
        await worker.load();
        await worker.loadLanguage();
        await worker.initialize();
    }
    return worker;
};

const GeneratePage = () => {

    const { mutateAsync: generateQA, isPending } = useMutation({
        mutationFn: () => generateQuestions({
            content: content,
            difficulty: difficulty,
            quantity: questionCount,
            type: questionTypes[0],
            source: sourceType,
        }),
        onSuccess: (data) => {
            console.info(data)
        }
    })

    const [uploadFile, setUploadFile] = useState<File | undefined>(undefined);
    const [content, setContent] = useState("");
    const [isExtracting, setIsExtracting] = useState(false);
    const [sourceType, setSourceType] = useState<"text" | "file" | "youtube" | "image">("text");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    // Generation options
    const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([QuestionType.MULTIPLE_CHOICE]);
    const [difficulty, setDifficulty] = useState(DifficultyLevel.MEDIUM);
    const [questionCount, setQuestionCount] = useState(10);
    const [language, setLanguage] = useState<string>("english");

    const adjustQuestionCount = (delta: number) => {
        const newCount = Math.max(1, Math.min(50, questionCount + delta));
        setQuestionCount(newCount);
    };

    const handleQuestionTypeChange = (type: QuestionType, checked: boolean) => {
        if (checked) {
            setQuestionTypes([type]);
        } else {
            setQuestionTypes(questionTypes.filter(t => t !== type));
        }
    };

    const handleFileSelect = (data: File) => {
        setUploadFile(data);
        setSourceType("file");
    };

    const handleGenerateQuestions = async () => {
        if (sourceType === "text") await generateQA();
        if (sourceType === "image") await generateQA();
    };

    const handleFileError = (error: string) => {
        // toast({
        //     title: "Upload Error",
        //     description: error,
        //     variant: "destructive",
        // });
        console.error(error)
    };


    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadFile(file);

        if (!file.type.startsWith("image/")) {
            // toast({
            //     title: "Invalid File",
            //     description: "Please select an image file (JPEG, PNG, GIF, WebP)",
            //     variant: "destructive",
            // });
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            // toast({
            //     title: "File Too Large",
            //     description: "Image must be smaller than 10MB",
            //     variant: "destructive",
            // });
            return;
        }

        setIsExtracting(true);

        const worker = await initWorker();

        const {
            data: { text },
        } = await worker.recognize(URL.createObjectURL(file));

        setContent(text);
        setIsExtracting(false)
    };

    return <div>
        <HeaderGenerate />
        <div className="p-4">
            <Card className="mb-8 bg-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        Add Your Content
                    </CardTitle>
                    <p className="text-gray-600">Choose your content source to generate professional quiz questions</p>
                </CardHeader>
                <CardContent>
                    <Tabs value={sourceType} onValueChange={(value) => {
                        setSourceType(value as typeof sourceType);
                        setContent("");
                        setUploadFile(undefined);
                    }} className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="text" className="flex items-center gap-2" data-testid="tab-text">
                                <FileText className="w-4 h-4" />
                                Text
                            </TabsTrigger>
                            <TabsTrigger value="file" className="flex items-center gap-2" data-testid="tab-file">
                                <Upload className="w-4 h-4" />
                                File
                            </TabsTrigger>
                            <TabsTrigger value="youtube" className="flex items-center gap-2" data-testid="tab-youtube">
                                <Youtube className="w-4 h-4" />
                                YouTube
                            </TabsTrigger>
                            <TabsTrigger value="image" className="flex items-center gap-2" data-testid="tab-image">
                                <Image className="w-4 h-4" />
                                Image
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="text" className="mt-6">
                            <div className="space-y-4">
                                <Label htmlFor="content">Paste Your Text</Label>
                                <Textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Paste your educational content here..."
                                    className="h-40 resize-none border-gray-300"
                                    data-testid="content-textarea"
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="file" className="mt-6">
                            <div className="space-y-4">
                                <div className="text-center">
                                    <FileUpload onFileSelect={handleFileSelect} onError={handleFileError} />
                                    {uploadFile && (
                                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-sm text-green-700">✓ Loaded content from: {uploadFile.name}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="youtube" className="mt-6">
                            <div className="space-y-4">
                                <Label htmlFor="youtube-url">YouTube Video URL</Label>
                                <div className="flex gap-3">
                                    <Input
                                        id="youtube-url"
                                        value={youtubeUrl}
                                        onChange={(e) => setYoutubeUrl(e.target.value)}
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="flex-1"
                                        data-testid="youtube-url-input"
                                    />
                                    <Button
                                        // onClick={handleYouTubeProcess}
                                        // disabled={!youtubeUrl.trim() || isProcessing}
                                        variant="outline"
                                        data-testid="process-youtube-button"
                                    >
                                        {/* {isProcessing ? "Processing..." : "Extract Content"} */}
                                        {"Extract Content"}
                                    </Button>
                                </div>
                                {content && sourceType === "youtube" && (
                                    <div className="space-y-3">
                                        <Label>Extracted Content</Label>
                                        <Textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            className="h-32 resize-none"
                                            data-testid="youtube-content-textarea"
                                        />
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="image" className="mt-6">
                            <div className="space-y-4">
                                {!isExtracting && <Label htmlFor="image-upload">Upload Educational Image</Label>}
                                {isExtracting ?
                                    <div>
                                        <Loader2Icon className="animate-spin w-4 h-4" />
                                        <p>Extracting text from image</p>
                                    </div> : isExtracting === false && content === "" && <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <input
                                            id="image-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            data-testid="image-upload-input"
                                        />
                                        <Label
                                            htmlFor="image-upload"
                                            className="cursor-pointer flex flex-col items-center gap-2 text-gray-600 hover:text-gray-800"
                                        >
                                            <Image className="w-8 h-8" />
                                            <span className="font-medium">Click to upload image</span>
                                            <span className="text-sm">JPEG, PNG, GIF, WebP (max 10MB)</span>
                                        </Label>
                                    </div>}
                                {uploadFile && (
                                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-sm text-green-700">✓ Loaded content from: {uploadFile.name}</p>
                                    </div>
                                )}
                                {uploadFile && content && sourceType === "image" && (
                                    <div className="space-y-3">
                                        <Label>Extracted Text</Label>
                                        <Textarea
                                            value={content}
                                            onChange={(v) => setContent(v.target.value)}
                                            className="h-45 resize-none"
                                            data-testid="image-content-textarea"
                                        />
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Card className="mb-8 bg-white">
                <CardHeader>
                    <CardTitle>Question Generation Options</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {/* Question Types */}
                        <div>
                            <Label className="text-sm font-semibold text-gray-700 mb-3 block">Question Types</Label>
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={QuestionType.MULTIPLE_CHOICE}
                                        checked={questionTypes.includes(QuestionType.MULTIPLE_CHOICE)}
                                        onCheckedChange={(checked) => handleQuestionTypeChange(QuestionType.MULTIPLE_CHOICE, !!checked)}
                                        data-testid="question-type-mcq"
                                    />
                                    <Label htmlFor="mcq" className="text-sm">Multiple Choice (MCQ)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={QuestionType.TRUE_FALSE}
                                        checked={questionTypes.includes(QuestionType.TRUE_FALSE)}
                                        onCheckedChange={(checked) => handleQuestionTypeChange(QuestionType.TRUE_FALSE, !!checked)}
                                        data-testid="question-type-tf"
                                    />
                                    <Label htmlFor="true-false" className="text-sm">True / False</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={QuestionType.FILL_IN_THE_BLANK}
                                        checked={questionTypes.includes(QuestionType.FILL_IN_THE_BLANK)}
                                        onCheckedChange={(checked) => handleQuestionTypeChange(QuestionType.FILL_IN_THE_BLANK, !!checked)}
                                        data-testid="question-type-blank"
                                    />
                                    <Label htmlFor="fill-in-the-blank" className="text-sm">Fill in the blank</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={QuestionType.SHORT_ANSWER}
                                        checked={questionTypes.includes(QuestionType.SHORT_ANSWER)}
                                        onCheckedChange={(checked) => handleQuestionTypeChange(QuestionType.SHORT_ANSWER, !!checked)}
                                        data-testid="question-type-short-answer"
                                    />
                                    <Label htmlFor="short-answer" className="text-sm">Short Answer</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={QuestionType.LONG_ANSWER}
                                        checked={questionTypes.includes(QuestionType.LONG_ANSWER)}
                                        onCheckedChange={(checked) => handleQuestionTypeChange(QuestionType.LONG_ANSWER, !!checked)}
                                        data-testid="question-type-long-answer"
                                    />
                                    <Label htmlFor="long-answer" className="text-sm">Long Answer</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={QuestionType.MATCHING}
                                        checked={questionTypes.includes(QuestionType.MATCHING)}
                                        onCheckedChange={(checked) => handleQuestionTypeChange(QuestionType.MATCHING, !!checked)}
                                        data-testid="question-type-matching"
                                    />
                                    <Label htmlFor="matching" className="text-sm">Matching</Label>
                                </div>
                            </div>
                        </div>

                        {/* Difficulty Level */}
                        <div>
                            <Label className="text-sm font-semibold text-gray-700 mb-3 block">Difficulty Level</Label>
                            <Select value={difficulty} onValueChange={(v) => setDifficulty(v as DifficultyLevel)}>
                                <SelectTrigger data-testid="difficulty-select">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={DifficultyLevel.EASY}>Easy</SelectItem>
                                    <SelectItem value={DifficultyLevel.MEDIUM}>Medium</SelectItem>
                                    <SelectItem value={DifficultyLevel.HIGH}>Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Number of Questions */}
                        <div>
                            <Label className="text-sm font-semibold text-gray-700 mb-3 block">Number of Questions</Label>
                            <div className="flex items-center space-x-3">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => adjustQuestionCount(-1)}
                                    disabled={questionCount <= 1}
                                    data-testid="decrease-questions"
                                >
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <span className="flex-1 text-center font-semibold text-lg" data-testid="question-count">
                                    {questionCount}
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => adjustQuestionCount(1)}
                                    disabled={questionCount >= 50}
                                    data-testid="increase-questions"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Language Selection */}
                        <div>
                            <Label className="text-sm font-semibold text-gray-700 mb-3 block">Output Language</Label>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger data-testid="language-select">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* Featured Languages */}
                                    <SelectItem value="english">English</SelectItem>
                                    <SelectItem value="burmese">Burmese (မြန်မာ)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex w-full justify-end">
                <Button
                    onClick={handleGenerateQuestions}
                    disabled={isPending}
                    data-testid="generate-questions-button"
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isPending ? "Generating..." : "Generate Questions"}
                </Button>
            </div>
        </div>


    </div>
}

export default GeneratePage