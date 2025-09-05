import { NextRequest, NextResponse } from 'next/server';
import { calculateProcessingTime } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';

interface RouteContext {
    params: Promise<{
        subject_id: string;
    }>;
}

export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    const startTime = Date.now();

    try {
        const { user, supabase } = await initializeServices();
        
        if (!user) {
            return createErrorResponse('Authentication required', 401, startTime);
        }

        // Await the params in Next.js 15+
        const { subject_id } = await context.params;

        if (!subject_id) {
            return createErrorResponse('Subject ID is required', 400, startTime);
        }
        
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit');
        const offset = searchParams.get('offset');
        const search = searchParams.get('search');

        let query = supabase
            .from('questions_bank')
            .select(`*,
                subjects!inner(*)
            `)
            .eq('subject_id', subject_id)
            .eq('subjects.user_id', user.id);

        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        if (limit) {
            query = query.limit(parseInt(limit));
        }
        if (offset) {
            query = query.range(
                parseInt(offset || '0'),
                parseInt(offset || '0') + parseInt(limit || '10') - 1
            );
        }

        query = query.order('created_at', { ascending: false });

        const { data: questionBanks, error, count } = await query;

        if (error) {
            console.error('Database error:', error);
            console.error('Query details:', {
                subject_id,
                user_id: user.user_id,
                subject_id_type: typeof subject_id,
                user_id_type: typeof user.user_id
            });
            return createErrorResponse('Failed to fetch question banks', 500, startTime);
        }

        // Check if subject exists and belongs to user only if no question banks found
        if (questionBanks && questionBanks.length === 0) {
            console.log('No question banks found, checking subject...');
            
            const { data: subject, error: subjectError } = await supabase
                .from('subjects')
                .select('*')
                .eq('id', subject_id)
                .eq('user_id', user.user_id)
                .single();

            console.log('Subject check:', { subject, subjectError });

            if (subjectError || !subject) {
                return createErrorResponse('Subject not found or access denied', 404, startTime);
            }
        }

        const processingTime = calculateProcessingTime(startTime);
        
        const response = {
            success: true,
            data: questionBanks || [],
            metadata: {
                timestamp: new Date().toISOString(),
                processingTime,
                count: questionBanks?.length || 0,
                subject_id
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('API Error:', error);
        return createErrorResponse(
            'Internal server error', 
            500, 
            startTime
        );
    }
}

async function initializeServices() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .maybeSingle();
            
        if (data) {
            return { user: data, supabase };
        }
    }
    
    return { user: undefined, supabase };
}

function createErrorResponse(message: string, status: number, startTime: number) {
    const processingTime = calculateProcessingTime(startTime);
    
    return NextResponse.json({
        success: false,
        error: message,
        metadata: {
            timestamp: new Date().toISOString(),
            processingTime
        }
    }, { status });
}