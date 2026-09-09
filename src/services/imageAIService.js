/**
 * Image AI & Pricing Service for KalaSaathi Frontend
 * Communicates with FastAPI Backend (http://127.0.0.1:8000)
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

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

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/image/enhance-image`, {
      method: 'POST',
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

    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new Error('Received empty image response from server.');
    }

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
      throw new Error('Unable to connect to FastAPI AI Backend at http://127.0.0.1:8000');
    }
    throw err;
  }
}

/**
 * Calls FastAPI Catalog Generation Service (POST /api/v1/catalog/generate).
 * Extracts AI product attributes (title, category, sector, material, size, description, colors).
 *
 * @param {File} file - Browser File object
 * @returns {Promise<{product_name: string, category: string, sector: string, material: string, product_size: string, description: string, dominant_colors: string[], visual_features: string[]}>}
 */
export async function generateCatalog(file) {
  if (!file) {
    throw new Error('Please select an image file for catalog generation.');
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/catalog/generate`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Catalog API error (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch (e) {}
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to FastAPI Backend at http://127.0.0.1:8000');
    }
    throw err;
  }
}

/**
 * Calls FastAPI Pricing ML Service (POST /api/v1/pricing/predict).
 * Predicts market price using trained XGBoost Regressor model.
 *
 * @param {Object} payload - { category, sector, material, product_size, state, quantity }
 * @returns {Promise<{success: boolean, predicted_market_price: number, recommended_min_price: number, recommended_max_price: number, model: string, business_assumptions: Object}>}
 */
export async function predictPrice(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/pricing/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorMessage = `Pricing API error (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch (e) {}
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to FastAPI Backend at http://127.0.0.1:8000');
    }
    throw err;
  }
}
