/**
 * Image AI Service for KalaSaathi Frontend
 * Communicates with FastAPI Image AI Backend (http://127.0.0.1:8000)
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1/image';

/**
 * Sends a product image to FastAPI Real-ESRGAN x2 AI model for enhancement.
 * Returns an Object URL for the resulting binary PNG blob.
 *
 * @param {File} file - Browser File object (JPEG, PNG, WEBP)
 * @returns {Promise<{success: boolean, enhancedUrl: string, blob: Blob, originalName: string, mediaType: string}>}
 */
export async function enhanceImage(file) {
  if (!file) {
    throw new Error('Please select an image file to enhance.');
  }

  // Validate image MIME type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (file.type && !validTypes.includes(file.type.toLowerCase())) {
    throw new Error(`Unsupported image type '${file.type}'. Allowed formats: JPEG, PNG, WEBP.`);
  }

  // Create multipart/form-data body
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/enhance-image`, {
      method: 'POST',
      // Note: Do NOT set Content-Type header when sending FormData!
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Server error (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' 
            ? errorData.detail 
            : JSON.stringify(errorData.detail);
        }
      } catch (e) {
        // Response was not JSON
      }
      throw new Error(errorMessage);
    }

    // Read binary PNG Blob from HTTP response
    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new Error('Received empty image response from server.');
    }

    // Convert PNG Blob to browser Object URL for display
    const enhancedUrl = URL.createObjectURL(blob);

    return {
      success: true,
      enhancedUrl,
      blob,
      originalName: file.name,
      mediaType: response.headers.get('content-type') || 'image/png',
    };
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to FastAPI AI Backend. Ensure server is running at http://127.0.0.1:8000');
    }
    throw err;
  }
}
