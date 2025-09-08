"use client"

import { BloomLevel, DifficultyLevel, Question, QuestionType } from "@/types/questions"
import { useMutation } from "@tanstack/react-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import LoadingModal from "@/components/LoadingModal";
import MCQQuestionBox from "./_components/MCQQuestionBox";
import TFQuestionBox from "./_components/TFQuestionBox";
import BlankQuestionBox from "./_components/BlankQuestionBox";
import LAQuestionBox from "./_components/LAQuestionBox";
import SAQuestionBox from "./_components/SAQuestionBox";

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

// Validation error interface
interface ValidationErrors {
    title?: string;
    content?: string;
    questionTypes?: string;
    difficulty?: string;
    questionCount?: string;
    language?: string;
}

const GeneratePage = () => {
    const [uploadFile, setUploadFile] = useState<File | undefined>(undefined);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isExtracting, setIsExtracting] = useState(false);
    const [sourceType, setSourceType] = useState<"text" | "file" | "youtube" | "image">("text");
    const [youtubeUrl, setYoutubeUrl] = useState("");

    const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([QuestionType.MULTIPLE_CHOICE]);
    const [difficulty, setDifficulty] = useState(DifficultyLevel.MEDIUM);
    const [questionCount, setQuestionCount] = useState(10);
    const [language, setLanguage] = useState<string>("english");
    const [bloom, setBloom] = useState<string>("mixed");

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([])

    const { mutateAsync: generateQA, isPending } = useMutation({
        mutationFn: () => generateQuestions({
            content: content,
            difficulty: difficulty,
            bloom_level: bloom as BloomLevel,
            quantity: questionCount,
            type: questionTypes,
            source: sourceType,
            title: title,
            description: description,
        }),
        onSuccess: (data) => {
            setQuestions(data?.data?.questions ?? [])
        }
    })

    const exportQuestionsWithFilename = (questions: Question[], filename?: string) => {
        const jsonString = JSON.stringify(questions, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || `questions-export-${Date.now()}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const validateForm = (): ValidationErrors => {
        const newErrors: ValidationErrors = {};

        if (!title.trim()) {
            newErrors.title = "Title is required";
        } else if (title.trim().length < 3) {
            newErrors.title = "Title must be at least 3 characters long";
        }

        if (!content.trim()) {
            newErrors.content = "Content is required";
        } else if (content.trim().length < 50) {
            newErrors.content = "Content must be at least 50 characters long";
        }

        if (questionTypes.length === 0) {
            newErrors.questionTypes = "At least one question type must be selected";
        }

        if (!difficulty) {
            newErrors.difficulty = "Difficulty level is required";
        }

        if (questionCount < 1 || questionCount > 50) {
            newErrors.questionCount = "Number of questions must be between 1 and 50";
        }

        // Language validation
        if (!language) {
            newErrors.language = "Output language is required";
        }

        return newErrors;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const validateField = (field: keyof ValidationErrors, value: any) => {
        if (!hasSubmitted) return;

        const newErrors = { ...errors };
        delete newErrors[field];

        switch (field) {
            case 'title':
                if (!value.trim()) {
                    newErrors.title = "Title is required";
                } else if (value.trim().length < 3) {
                    newErrors.title = "Title must be at least 3 characters long";
                }
                break;
            case 'content':
                if (!value.trim()) {
                    newErrors.content = "Content is required";
                } else if (value.trim().length < 50) {
                    newErrors.content = "Content must be at least 50 characters long";
                }
                break;
            case 'questionTypes':
                if (!value || value.length === 0) {
                    newErrors.questionTypes = "At least one question type must be selected";
                }
                break;
        }

        setErrors(newErrors);
    };

    const adjustQuestionCount = (delta: number) => {
        const newCount = Math.max(1, Math.min(50, questionCount + delta));
        setQuestionCount(newCount);
        validateField('questionCount', newCount);
    };

    const handleQuestionTypeChange = (type: QuestionType, checked: boolean) => {
        let newTypes: QuestionType[];
        if (checked) {
            newTypes = [...questionTypes, type]; // Based on your current logic, only one type at a time
        } else {
            newTypes = questionTypes.filter(t => t !== type);
        }
        setQuestionTypes(newTypes);
        validateField('questionTypes', newTypes);
    };

    const handleFileSelect = (data: File) => {
        setUploadFile(data);
        setSourceType("file");
    };

    const handleGenerateQuestions = async () => {
        setHasSubmitted(true);
        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            console.error("Form validation failed:", validationErrors);
            return;
        }

        try {
            if (sourceType === "text" || sourceType === "image") {
                await generateQA();
            }
        } catch (error) {
            console.error("Generation failed:", error);
        }
    };

    const handleFileError = (error: string) => {
        console.error(error);
    };

    const handleYouTubeProcess = async () => {
        try {
            const res = await fetch("/api/transcript", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: youtubeUrl }),
            });

            if (!res.ok) throw new Error("Failed to fetch transcript");

            const data = await res.json();
            setContent(data.data);
            validateField('content', data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadFile(file);

        if (!file.type.startsWith("image/")) {
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            return;
        }

        setIsExtracting(true);

        const worker = await initWorker();
        const { data: { text } } = await worker.recognize(URL.createObjectURL(file));

        setContent(text);
        validateField('content', text);
        setIsExtracting(false);
    };

    const getInputClassName = (fieldName: keyof ValidationErrors, baseClassName: string = "") => {
        const hasError = errors[fieldName];
        return `${baseClassName} ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`.trim();
    };

    const renderError = (fieldName: keyof ValidationErrors) => {
        if (!errors[fieldName]) return null;
        return (
            <p className="text-red-500 text-sm mt-1" role="alert">
                {errors[fieldName]}
            </p>
        );
    };

    const onExport = () => {
        exportQuestionsWithFilename(questions, title)
    }

    return (
        <div className="h-full">
            <HeaderGenerate onExportFunc={onExport}/>
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-2">
                <div className="p-4 space-y-4 overflow-y-auto h-full">
                    <div>
                        <h1 className="text-2xl font-semibold">Question Set Details</h1>
                        <div>
                            <Label>Question Set Title *</Label>
                            <Input
                                placeholder="Title"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    validateField('title', e.target.value);
                                }}
                                className={getInputClassName('title')}
                            />
                            {renderError('title')}
                        </div>
                        <div>
                            <Label>Question Set Description</Label>
                            <Textarea
                                placeholder="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                </div>
                                Add Your Content *
                            </div>
                            <p className="text-gray-600">Choose your content source to generate professional quiz questions</p>
                        </div>

                        <Tabs value={sourceType} onValueChange={(value) => {
                            setSourceType(value as typeof sourceType);
                            setContent("");
                            setUploadFile(undefined);
                            if (hasSubmitted) {
                                validateField('content', "");
                            }
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
                                    <Label htmlFor="content">Paste Your Text *</Label>
                                    <Textarea
                                        id="content"
                                        value={content}
                                        onChange={(e) => {
                                            setContent(e.target.value);
                                            validateField('content', e.target.value);
                                        }}
                                        placeholder="Paste your educational content here..."
                                        className={getInputClassName('content', "h-40 resize-none border-gray-300")}
                                        data-testid="content-textarea"
                                    />
                                    {renderError('content')}
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
                                    {renderError('content')}
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
                                            onClick={handleYouTubeProcess}
                                            variant="outline"
                                            data-testid="process-youtube-button"
                                        >
                                            Extract Content
                                        </Button>
                                    </div>
                                    {content && sourceType === "youtube" && (
                                        <div className="space-y-3">
                                            <Label>Extracted Content</Label>
                                            <Textarea
                                                value={content}
                                                onChange={(e) => {
                                                    setContent(e.target.value);
                                                    validateField('content', e.target.value);
                                                }}
                                                className={getInputClassName('content', "h-32 resize-none")}
                                                data-testid="youtube-content-textarea"
                                            />
                                        </div>
                                    )}
                                    {renderError('content')}
                                </div>
                            </TabsContent>

                            <TabsContent value="image" className="mt-6">
                                <div className="space-y-4">
                                    {!isExtracting && <Label htmlFor="image-upload">Upload Educational Image</Label>}
                                    {isExtracting ? (
                                        <div>
                                            <Loader2Icon className="animate-spin w-4 h-4" />
                                            <p>Extracting text from image</p>
                                        </div>
                                    ) : isExtracting === false && content === "" && (
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                                        </div>
                                    )}
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
                                                onChange={(e) => {
                                                    setContent(e.target.value);
                                                    validateField('content', e.target.value);
                                                }}
                                                className={getInputClassName('content', "h-45 resize-none")}
                                                data-testid="image-content-textarea"
                                            />
                                        </div>
                                    )}
                                    {renderError('content')}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div className="space-y-3">
                        <div className="text-2xl font-semibold">Question Generation Options</div>
                        <div className="space-y-3">
                            {/* Question Types */}
                            <div>
                                <Label className="text-sm font-semibold text-gray-700 mb-3 block">Question Types *</Label>
                                <div className="flex flex-wrap space-x-3 space-y-3 items-center">
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
                                {renderError('questionTypes')}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {/* Difficulty Level */}
                                <div>
                                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">Difficulty Level *</Label>
                                    <Select
                                        value={difficulty}
                                        onValueChange={(v) => {
                                            setDifficulty(v as DifficultyLevel);
                                            validateField('difficulty', v);
                                        }}
                                    >
                                        <SelectTrigger
                                            data-testid="difficulty-select"
                                            className={getInputClassName('difficulty')}
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={DifficultyLevel.EASY}>Easy</SelectItem>
                                            <SelectItem value={DifficultyLevel.MEDIUM}>Medium</SelectItem>
                                            <SelectItem value={DifficultyLevel.HIGH}>Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {renderError('difficulty')}
                                </div>

                                {/* Number of Questions */}
                                <div>
                                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">Number of Questions *</Label>
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
                                    {renderError('questionCount')}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {/* Bloom Selection */}
                                <div>
                                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">{`Bloom's Taxonomy (Optional)`}</Label>
                                    <Select value={bloom} onValueChange={setBloom}>
                                        <SelectTrigger data-testid="bloom-select">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="mixed">Mixed</SelectItem>
                                            <SelectItem value="remember">Remember</SelectItem>
                                            <SelectItem value="understand">Understand</SelectItem>
                                            <SelectItem value="apply">Apply</SelectItem>
                                            <SelectItem value="analyze">Analyze</SelectItem>
                                            <SelectItem value="evaluate">Evaluate</SelectItem>
                                            <SelectItem value="create">Create</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Language Selection */}
                                <div>
                                    <Label className="text-sm font-semibold text-gray-700 mb-3 block">Output Language *</Label>
                                    <Select
                                        value={language}
                                        onValueChange={(v) => {
                                            setLanguage(v);
                                            validateField('language', v);
                                        }}
                                    >
                                        <SelectTrigger
                                            data-testid="language-select"
                                            className={getInputClassName('language')}
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="english">English</SelectItem>
                                            <SelectItem value="burmese">Burmese (မြန်မာ)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {renderError('language')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Display general validation summary if there are errors */}
                    {hasSubmitted && Object.keys(errors).length > 0 && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 font-medium mb-2">Please fix the following errors:</p>
                            <ul className="text-red-600 text-sm space-y-1">
                                {Object.values(errors).map((error, index) => (
                                    <li key={index}>• {error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

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
                <div className="w-full h-full bg-white space-y-2 p-3">
                    {questions.map((q, idx) => <div key={idx}>
                        {q.type === QuestionType.MULTIPLE_CHOICE && <MCQQuestionBox question={q} index={idx} />}
                        {q.type === QuestionType.TRUE_FALSE && <TFQuestionBox question={q} index={idx} />}
                        {q.type === QuestionType.FILL_IN_THE_BLANK && <BlankQuestionBox question={q} index={idx} />}
                        {q.type === QuestionType.LONG_ANSWER && <LAQuestionBox question={q} idx={idx} />}
                        {q.type === QuestionType.SHORT_ANSWER && <SAQuestionBox question={q} idx={idx} />}
                    </div>)}
                </div>
            </div>
            <LoadingModal isOpen={isPending} />
        </div>
    );
}

export default GeneratePage