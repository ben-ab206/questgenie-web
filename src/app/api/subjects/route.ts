import { NextRequest, NextResponse } from 'next/server';
import { calculateProcessingTime } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const startTime = Date.now();

    try {
        const { user, supabase } = await initializeServices();

        if (!user) {
            return createErrorResponse('Authentication required', 401, startTime);
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search')?.trim();
        const type = searchParams.get('type')?.trim();
        const limit = searchParams.get('limit');
        const offset = searchParams.get('offset');
        const sortBy = searchParams.get('sortBy') || 'created_at';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        let query = supabase
            .from('subjects')
            .select(`*`)
            .eq('user_id', user.id);

        if (type && type !== 'all') {
            query = query.eq('type', type);
        }

        console.log(search)

        if (search) {
            query = query.or(`title.ilike.%${search}%`);
        }

        const isAscending = sortOrder.toLowerCase() === 'asc';
        query = query.order(sortBy, { ascending: isAscending });

        if (limit) {
            const limitNum = parseInt(limit);
            if (!isNaN(limitNum) && limitNum > 0) {
                query = query.limit(limitNum);

                if (offset) {
                    const offsetNum = parseInt(offset);
                    if (!isNaN(offsetNum) && offsetNum >= 0) {
                        query = query.range(offsetNum, offsetNum + limitNum - 1);
                    }
                }
            }
        }

        const { data: subjects, error, count } = await query;

        if (error) {
            console.error('Database error:', error);
            return createErrorResponse('Failed to fetch subjects', 500, startTime);
        }

        let totalCount = count;
        if (limit && !totalCount) {
            const { count: total } = await supabase
                .from('subjects')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);
            totalCount = total;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count: recentCount } = await supabase
            .from('subjects')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gte('created_at', today.toISOString());

        const { count: total } = await supabase
            .from('subjects')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);


        const processingTime = calculateProcessingTime(startTime);

        const response = {
            success: true,
            data: subjects || [],
            metadata: {
                timestamp: new Date().toISOString(),
                processingTime,
                count: subjects?.length || 0,
                totalCount: total,
                recentCount: recentCount,
                filters: {
                    search,
                    type,
                    sortBy,
                    sortOrder
                },
                pagination: limit ? {
                    limit: parseInt(limit),
                    offset: offset ? parseInt(offset) : 0,
                    hasMore: totalCount ? (parseInt(offset || '0') + parseInt(limit)) < totalCount : false
                } : null
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