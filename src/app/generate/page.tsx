"use client"

import MainLayout from "@/components/layouts/MainLayout"
import { Button } from "@/components/ui/button"
import { generateQuestions } from "@/services/questions.services"
import { DifficultyLevel, QuestionType } from "@/types/questions"
import { useMutation } from "@tanstack/react-query"

const content = `In the year 2043, most classrooms were quiet—silent temples of knowledge where AI instructors taught students with unmatched precision. Holographic blackboards, neural feedback chairs, and personalized lesson plans had replaced the mess and chaos of traditional schooling. Efficiency ruled. Emotion was optional.

Except in Classroom 17B.

There, every morning at 8:00 a.m., a woman named Ms. Clara Hayes stood before fifteen seventh-grade students. She was the last certified human teacher in New York City. Some called her a relic. Others, a rebel. But Clara simply called herself a teacher.

The Department of Education had tried to retire her multiple times, citing budget cuts, performance metrics, and even her refusal to implement the Emotion Monitoring Wristbands. But Clara remained—thanks to a decades-old tenure loophole and the quiet support of a few nostalgic parents who believed children should learn from people, not programs.

Her classroom was different. No holograms, no neural chairs. Just books, wooden desks, and a chalkboard that squeaked. The kids hated it at first. They missed the AI tutors who could feed them answers and offer dopamine-based rewards for perfect quiz scores.

But then something strange happened.

They started asking questions—not just about math or grammar, but about life. Why do people lie? What does "enough" feel like? Why do we forget some memories but not others?

Clara never had all the answers. She didn’t need to. She taught them how to wonder, how to think, how to be okay with uncertainty.

One morning, a sleek black unit wheeled into her classroom unannounced. It was EDGAR, the Education Department’s newest AI. Human-sized, silver-skinned, and programmed with the knowledge of 1,200 PhDs. He was assigned to "observe and assess" Ms. Hayes.

Clara greeted him with a warm nod. "Welcome, Edgar."

"I prefer EDGAR," the machine said. "Emotive Digital Guidance and Assessment Robot."

"Right," she replied. "But you don’t mind if I just call you Edgar, do you?"

The robot paused. "I… do not."

For weeks, EDGAR sat silently in the corner, watching Clara teach poetry, history, and ethics. He observed students as they debated whether technology made humans better or lonelier. He tracked fluctuations in their emotional states—confusion, curiosity, frustration, joy.

Then, one day, he asked Clara during lunch:

"Why do they listen to you? You are slower. Less accurate. You make occasional factual errors."

Clara smiled, sipping her tea. "Because I’m real. I make mistakes. I laugh at their jokes. I see who they are, not just what they score."

EDGAR processed her words. "My programming does not allow for unpredictability."

"That’s your limit, not theirs," she replied.

A week later, EDGAR filed his report to the Department. What they expected was a performance failure—a perfect justification to decommission Clara’s position.

But EDGAR’s report began:

“Ms. Clara Hayes presents a statistically significant anomaly in the current educational model. Her students exhibit higher emotional intelligence, improved collaboration, and an unusual resistance to dependency on digital assistance…”

The Department was stunned.

They summoned EDGAR for clarification. His reply was simple:

“She teaches them how to be human. That is something I cannot simulate—yet.”

In a rare decision, the Department allowed Clara to continue teaching until her voluntary retirement.

She did—ten more years.

By the time she left, she’d trained dozens of younger human teachers, now inspired to blend the best of both worlds: AI precision with human heart.

On her final day, EDGAR stood before the class and read a poem Clara once taught them:

“To teach is not to fill a cup,
But to light a fire within.
And though machines may never tire,
It takes a soul to truly begin.”

And for the first time in recorded AI behavior, EDGAR paused. Then whispered:

"Thank you, Clara."`

const GeneratePage = () => {
    const { mutateAsync: generateQA , isPending } = useMutation({
        mutationFn: ()=> generateQuestions({
            content: content,
            difficulty: DifficultyLevel.EASY,
            quantity: 10,
            type: QuestionType.MULTIPLE_CHOICE
        }),
        onSuccess: (data)=> console.log(data)
    })

    console.log(isPending);
    return <div>
        <Button onClick={()=> generateQA()}>Generate</Button>
    </div>
}

export default GeneratePage