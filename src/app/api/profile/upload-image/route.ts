/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/lib/supabase/server';
import { calculateProcessingTime } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get file extension
const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
};

// Helper function to validate image file types
const isValidImageType = (extension: string): boolean => {
    const validTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    return validTypes.includes(extension);
};

const imageUpload = async ({
    supabase,
    file,
    file_path,
}: {
    supabase: any,
    file: File;
    file_path: string;
}) => {
    // Upload file to Supabase storage
    const { data, error: uploadError } = await supabase.storage
        .from('general') // Change bucket name as needed
        .upload(`profile/${file_path}`, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (uploadError) throw uploadError;

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
        .from('general')
        .getPublicUrl(data?.path || '');

    const publicUrl = publicUrlData?.publicUrl || '';

    return {
        path: data?.path,
        publicUrl,
        fullPath: data?.fullPath,
    };
};

export async function POST(req: NextRequest) {
    try {
        const startTime = Date.now();

        const formData: FormData = await req.formData();
        const uploadedFiles = formData.getAll('file');

        if (!uploadedFiles || uploadedFiles.length === 0) {
            return NextResponse.json({ error: 'No files found' }, { status: 400 });
        }

        const { user, supabase } = await initializeServices();

        if (!user) {
            return createErrorResponse('Authentication required', 401, startTime);
        }

        const uploadedFile = uploadedFiles[0];
        console.log('Uploaded file:', uploadedFile);

        if (!(uploadedFile instanceof File)) {
            return NextResponse.json({ error: 'Invalid file format' }, { status: 400 });
        }

        const fileExtension = getFileExtension(uploadedFile.name);

        if (!isValidImageType(fileExtension)) {
            return NextResponse.json({
                error: 'Unsupported file format. Only image files (JPG, PNG, GIF, WebP, SVG) are supported.'
            }, { status: 400 });
        }

        // Generate unique filename
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = `${fileName}`;

        // Upload to Supabase
        const uploadResult = await imageUpload({
            supabase: supabase,
            file: uploadedFile,
            file_path: filePath,
        });

        await supabase.from('users').update({ image_path: uploadResult.publicUrl }).eq('id', user.id)

        const response = NextResponse.json({
            success: true,
            data: {
                fileName: fileName,
                fileType: fileExtension,
                path: uploadResult.path,
                publicUrl: uploadResult.publicUrl,
                size: uploadedFile.size,
                originalName: uploadedFile.name,
            },
        });

        return response;

    } catch (error: any) {
        console.error('API Error:', error);

        // Handle specific Supabase errors
        if (error.message?.includes('duplicate')) {
            return NextResponse.json(
                { error: 'File already exists' },
                { status: 409 }
            );
        }

        if (error.message?.includes('size')) {
            return NextResponse.json(
                { error: 'File size too large' },
                { status: 413 }
            );
        }

        return NextResponse.json(
            {
                error: 'Failed to upload image',
                details: error.message
            },
            { status: 500 }
        );
    }
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

export async function DELETE(req: NextRequest) {
    try {
        const startTime = Date.now()

        const { user, supabase } = await initializeServices();

        if (!user) {
            return createErrorResponse('Authentication required', 401, startTime);
        }


        if (!user.image_path) {
            return NextResponse.json({ error: 'filePath parameter required' }, { status: 400 });
        }

        const { data, error } = await supabase.storage
            .from('general')
            .remove([user.image_path]);

        await supabase.from('users').update({ image_path : "" }).eq('id', user.id)

        if (error) throw error;

        return NextResponse.json({ success: true, data: true });

    } catch (error: any) {
        console.error('DELETE Error:', error);
        return NextResponse.json(
            { error: 'Failed to delete image' },
            { status: 500 }
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