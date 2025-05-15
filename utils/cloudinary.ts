/**
 * Client-side file upload helper
 * @param file The file to upload
 * @param folder Optional folder path in Cloudinary
 * @returns Promise with upload result
 */
export const uploadFile = async (file: File, folder = 'receipts') => {
  try {
    // For client-side uploads, we'll use a serverless function
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Reads a file and converts it to base64
 * @param file The file to read
 * @returns Promise with base64 string
 */
export const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
