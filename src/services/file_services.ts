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

export { uploadPDF }