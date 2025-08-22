
// app/api/questions/batch/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { QuestionService } from '@/app/api/questions/question-service';
// import { BatchGenerationRequest } from '@/app/api/types/questions';
// import { ValidationError } from '@/app/api/validation';
// import { generateRequestId, calculateProcessingTime } from '@/app/api/utils';
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
// import { cookies } from 'next/headers';

// export async function POST(request: NextRequest) {
//   const requestId = generateRequestId();
//   const startTime = Date.now();

//   try {
//     const supabase = createRouteHandlerClient({ cookies });
//     const { data: { session }, error: authError } = await supabase.auth.getSession();
    
//     if (authError || !session) {
//       const processingTime = calculateProcessingTime(startTime);
//       return NextResponse.json({
//         success: false,
//         error: 'Authentication required',
//         metadata: {
//           timestamp: new Date().toISOString(),
//           requestId,
//           processingTime
//         }
//       }, { status: 401 });
//     }

//     const body: BatchGenerationRequest = await request.json();

//     if (!body.contents || !Array.isArray(body.contents) || body.contents.length === 0) {
//       throw new ValidationError('Contents array is required and must not be empty', 'contents');
//     }

//     if (body.contents.length > 10) {
//       throw new ValidationError('Maximum 10 content pieces allowed per batch', 'contents');
//     }

//     if (!process.env.OPENROUTER_API_KEY) {
//       throw new Error('OpenRouter API key not configured');
//     }

//     const questionService = new QuestionService(process.env.OPENROUTER_API_KEY);
//     const questions = await questionService.processBatchRequest(body);

//     // Save to database with batch insert
//     const { error: dbError } = await supabase
//       .from('generated_questions')
//       .insert(
//         questions.map(q => ({
//           ...q,
//           user_id: session.user.id,
//           metadata: {
//             batch: true,
//             ...body.globalConfig
//           }
//         }))
//       );

//     if (dbError) {
//       console.error('Batch database save error:', dbError);
//     }

//     const processingTime = calculateProcessingTime(startTime);
//     const response = questionService.formatAPIResponse(
//       { 
//         questions, 
//         count: questions.length,
//         contentPieces: body.contents.length,
//         saved: !dbError
//       },
//       requestId,
//       processingTime
//     );

//     return NextResponse.json(response);

//   } catch (error) {
//     const processingTime = calculateProcessingTime(startTime);
//     const questionService = new QuestionService(process.env.OPENROUTER_API_KEY || '');
    
//     if (error instanceof ValidationError) {
//       const response = questionService.formatErrorResponse(
//         error.message,
//         requestId,
//         processingTime
//       );
//       return NextResponse.json(response, { status: 400 });
//     }

//     console.error('Batch API Error:', error);
//     const response = questionService.formatErrorResponse(
//       error instanceof Error ? error.message : 'Internal server error',
//       requestId,
//       processingTime
//     );
//     return NextResponse.json(response, { status: 500 });
//   }
// }


// app/api/questions/stats/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
// import { cookies } from 'next/headers';
// import { generateRequestId, calculateProcessingTime } from '@/app/api/utils';

// export async function GET(request: NextRequest) {
//   const requestId = generateRequestId();
//   const startTime = Date.now();

//   try {
//     const supabase = createRouteHandlerClient({ cookies });
//     const { data: { session }, error: authError } = await supabase.auth.getSession();
    
//     if (authError || !session) {
//       return NextResponse.json({
//         success: false,
//         error: 'Authentication required',
//         metadata: {
//           timestamp: new Date().toISOString(),
//           requestId,
//           processingTime: calculateProcessingTime(startTime)
//         }
//       }, { status: 401 });
//     }

//     // Get total questions count
//     const { count: totalCount } = await supabase
//       .from('generated_questions')
//       .select('*', { count: 'exact', head: true })
//       .eq('user_id', session.user.id);

//     // Get questions by type
//     const { data: typeStats } = await supabase
//       .from('generated_questions')
//       .select('type')
//       .eq('user_id', session.user.id);

//     // Get questions by difficulty
//     const { data: difficultyStats } = await supabase
//       .from('generated_questions')
//       .select('difficulty')
//       .eq('user_id', session.user.id);

//     // Get questions by language
//     const { data: languageStats } = await supabase
//       .from('generated_questions')
//       .select('language')
//       .eq('user_id', session.user.id);

//     // Get recent activity (last 30 days)
//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
//     const { count: recentCount } = await supabase
//       .from('generated_questions')
//       .select('*', { count: 'exact', head: true })
//       .eq('user_id', session.user.id)
//       .gte('created_at', thirtyDaysAgo.toISOString());

//     // Process stats
//     const typeDistribution = typeStats?.reduce((acc: Record<string, number>, item) => {
//       acc[item.type] = (acc[item.type] || 0) + 1;
//       return acc;
//     }, {}) || {};

//     const difficultyDistribution = difficultyStats?.reduce((acc: Record<string, number>, item) => {
//       acc[item.difficulty] = (acc[item.difficulty] || 0) + 1;
//       return acc;
//     }, {}) || {};

//     const languageDistribution = languageStats?.reduce((acc: Record<string, number>, item) => {
//       acc[item.language] = (acc[item.language] || 0) + 1;
//       return acc;
//     }, {}) || {};

//     const processingTime = calculateProcessingTime(startTime);

//     return NextResponse.json({
//       success: true,
//       data: {
//         total: totalCount || 0,
//         recentActivity: recentCount || 0,
//         distribution: {
//           types: typeDistribution,
//           difficulties: difficultyDistribution,
//           languages: languageDistribution
//         }
//       },
//       metadata: {
//         timestamp: new Date().toISOString(),
//         requestId,
//         processingTime
//       }
//     });

//   } catch (error) {
//     const processingTime = calculateProcessingTime(startTime);
//     console.error('Stats fetch error:', error);
    
//     return NextResponse.json({
//       success: false,
//       error: error instanceof Error ? error.message : 'Failed to fetch statistics',
//       metadata: {
//         timestamp: new Date().toISOString(),
//         requestId,
//         processingTime
//       }
//     }, { status: 500 });
//   }
// }
