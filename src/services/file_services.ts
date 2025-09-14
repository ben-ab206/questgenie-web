/* eslint-disable @typescript-eslint/no-explicit-any */
const uploadPDF = async (file: File): Promise<{ text: string; fileName: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', new Blob(), 'dummy');
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log("-------------------------")
    console.log(response);

    const text = await response.text();
    const fileName = response.headers.get('FileName') || '';

    return { text, fileName };
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
}
const uploadProfileImage = async (file: File): Promise<{ 
  success: boolean; 
  data?: any;
  error?: string;
}> => {
  try {
    // Validate file type before upload
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const validImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    
    if (!validImageTypes.includes(fileExtension)) {
      throw new Error('Invalid file type. Only image files (JPG, PNG, GIF, WebP, SVG) are supported.');
    }

    // Validate file size (optional - adjust limit as needed)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 10MB.');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/profile/upload-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    return result;

  } catch (error) {
    console.error('Error uploading profile image:', error);
    
    // Return the error in the expected format for React Query mutations
    throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
  }
};

const deleteProfileImage = async (): Promise<void> => {
  try {
    const response = await fetch('/api/profile/upload-image', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to delete profile image');
    }

    // Return void since the mutation doesn't need to return data
    return;
    
  } catch (error) {
    console.error('Error deleting profile image:', error);
    throw new Error(error instanceof Error ? error.message : 'Unknown error occurred');
  }
};

export { uploadPDF, uploadProfileImage, deleteProfileImage }