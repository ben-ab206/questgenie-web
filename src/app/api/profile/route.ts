import { NextRequest, NextResponse } from 'next/server';
import { calculateProcessingTime } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    const startTime = Date.now();

    try {
        const { user } = await initializeServices();
        
        if (!user) {
            return createErrorResponse('Authentication required', 401, startTime);
        }

        const processingTime = calculateProcessingTime(startTime);
        
        const response = {
            success: true,
            data: user,
            metadata: {
                timestamp: new Date().toISOString(),
                processingTime,
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

export async function PATCH(request: NextRequest) {
    const startTime = Date.now();

    try {
        const { user, supabase } = await initializeServices();

        if (!user) {
            return createErrorResponse('Authentication required', 401, startTime);
        }

        const body = await request.json();
        const { name, email } = body;

        const { data, error } = await supabase
            .from('users')
            .update({
                ...(name && { name }),
                ...(email && { email }),
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.user_id)
            .select()
            .maybeSingle();

        if (error) {
            console.error('Update Error:', error);
            return createErrorResponse('Failed to update user', 400, startTime);
        }

        const processingTime = calculateProcessingTime(startTime);

        return NextResponse.json({
            success: true,
            data,
            metadata: {
                timestamp: new Date().toISOString(),
                processingTime,
            }
        });

    } catch (error) {
        console.error('API Error:', error);
        return createErrorResponse('Internal server error', 500, startTime);
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