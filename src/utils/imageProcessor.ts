import * as tf from '@tensorflow/tfjs';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

// Load TensorFlow.js models
let faceDetectionModel: faceLandmarksDetection.FaceLandmarksDetector | null = null;

const loadModels = async () => {
  if (!faceDetectionModel) {
    try {
      // Initialize TensorFlow backend
      await tf.ready();
      console.log('TensorFlow backend ready:', tf.getBackend());
      
      // Load face detection model with proper configuration
      faceDetectionModel = await faceLandmarksDetection.load(
        faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
        { 
          maxFaces: 1,
          modelUrl: undefined, // Use default model URL
          detectorModelUrl: undefined, // Use default detector model
          runtime: 'mediapipe', // Specify runtime explicitly
          refineLandmarks: true, // Enable refined landmarks for better accuracy
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh', // Ensure correct solution path
        }
      );
      console.log('Face detection model loaded successfully');
    } catch (error) {
      console.error('Error loading face detection model:', error);
      throw new Error('Failed to load face detection model. Please try again later.');
    }
  }
  return { faceDetectionModel };
};

// Preload models
loadModels().catch(err => console.error('Error preloading models:', err));

// Helper function to create an image element from a data URL
const createImageFromDataURL = (dataURL: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image: ' + e));
    img.src = dataURL;
  });
};

// Function to detect face in an image
const detectFace = async (img: HTMLImageElement) => {
  if (!faceDetectionModel) {
    try {
      await loadModels();
    } catch (error) {
      console.error('Error loading models during face detection:', error);
      throw new Error('Failed to initialize face detection. Please refresh and try again.');
    }
  }
  
  if (!faceDetectionModel) {
    throw new Error('Face detection model failed to load');
  }
  
  try {
    // Ensure proper input format for the model
    const predictions = await faceDetectionModel.estimateFaces({
      input: img,
    });
    
    return predictions.length > 0 ? predictions[0] : null;
  } catch (error) {
    console.error('Error during face detection:', error);
    throw new Error('Failed to detect face. Please try another image with a clearer face.');
  }
};

// Function to apply anime style transformation
const applyAnimeStyle = (
  ctx: CanvasRenderingContext2D, 
  img: HTMLImageElement, 
  face: any, 
  width: number, 
  height: number
) => {
  try {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw original image
    ctx.drawImage(img, 0, 0, width, height);
    
    // Safely access face data with error handling
    if (!face || !face.boundingBox) {
      throw new Error('Invalid face data structure');
    }
    
    // Get face bounding box
    const boundingBox = face.boundingBox;
    const faceWidth = boundingBox.width;
    const faceHeight = boundingBox.height;
    const faceX = boundingBox.topLeft[0];
    const faceY = boundingBox.topLeft[1];
    
    // Apply anime-style effects
    
    // 1. Extract face region
    const faceImageData = ctx.getImageData(faceX, faceY, faceWidth, faceHeight);
    
    // 2. Apply stylization effects
    
    // Simplify colors (posterize)
    const data = faceImageData.data;
    for (let i = 0; i < data.length; i += 4) {
      // Reduce color depth
      data[i] = Math.round(data[i] / 32) * 32;     // R
      data[i + 1] = Math.round(data[i + 1] / 32) * 32; // G
      data[i + 2] = Math.round(data[i + 2] / 32) * 32; // B
    }
    
    // Put the modified face back
    ctx.putImageData(faceImageData, faceX, faceY);
    
    // Safely access landmarks with error handling
    if (!face.scaledMesh || !Array.isArray(face.scaledMesh)) {
      throw new Error('Invalid face landmarks data');
    }
    
    const landmarks = face.scaledMesh;
    
    // Safely check if we have enough landmarks
    if (landmarks.length < 468) { // MediaPipe face mesh has 468 landmarks
      throw new Error('Insufficient face landmarks detected');
    }
    
    // 3. Draw anime-style eyes
    // Left eye
    const leftEyePoints = [
      landmarks[33], // Left eye left corner
      landmarks[133], // Left eye right corner
      landmarks[159], // Left eye top
      landmarks[145], // Left eye bottom
    ];
    
    // Right eye
    const rightEyePoints = [
      landmarks[362], // Right eye left corner
      landmarks[263], // Right eye right corner
      landmarks[386], // Right eye top
      landmarks[374], // Right eye bottom
    ];
    
    // Calculate eye centers and sizes
    const leftEyeCenter = [
      (leftEyePoints[0][0] + leftEyePoints[1][0]) / 2,
      (leftEyePoints[2][1] + leftEyePoints[3][1]) / 2
    ];
    
    const rightEyeCenter = [
      (rightEyePoints[0][0] + rightEyePoints[1][0]) / 2,
      (rightEyePoints[2][1] + rightEyePoints[3][1]) / 2
    ];
    
    const leftEyeWidth = Math.abs(leftEyePoints[1][0] - leftEyePoints[0][0]) * 1.2;
    const rightEyeWidth = Math.abs(rightEyePoints[1][0] - rightEyePoints[0][0]) * 1.2;
    
    // Draw anime eyes (larger and more stylized)
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    
    // Left eye
    ctx.beginPath();
    ctx.ellipse(
      leftEyeCenter[0], 
      leftEyeCenter[1], 
      leftEyeWidth / 1.8, 
      leftEyeWidth / 3, 
      0, 0, 2 * Math.PI
    );
    ctx.fill();
    ctx.stroke();
    
    // Right eye
    ctx.beginPath();
    ctx.ellipse(
      rightEyeCenter[0], 
      rightEyeCenter[1], 
      rightEyeWidth / 1.8, 
      rightEyeWidth / 3, 
      0, 0, 2 * Math.PI
    );
    ctx.fill();
    ctx.stroke();
    
    // Draw pupils
    ctx.fillStyle = '#4285f4'; // Anime blue eyes
    
    // Left pupil
    ctx.beginPath();
    ctx.ellipse(
      leftEyeCenter[0], 
      leftEyeCenter[1], 
      leftEyeWidth / 4, 
      leftEyeWidth / 3.5, 
      0, 0, 2 * Math.PI
    );
    ctx.fill();
    
    // Right pupil
    ctx.beginPath();
    ctx.ellipse(
      rightEyeCenter[0], 
      rightEyeCenter[1], 
      rightEyeWidth / 4, 
      rightEyeWidth / 3.5, 
      0, 0, 2 * Math.PI
    );
    ctx.fill();
    
    // Add shine to eyes
    ctx.fillStyle = 'white';
    
    // Left eye shine
    ctx.beginPath();
    ctx.ellipse(
      leftEyeCenter[0] - leftEyeWidth / 8, 
      leftEyeCenter[1] - leftEyeWidth / 8, 
      leftEyeWidth / 10, 
      leftEyeWidth / 10, 
      0, 0, 2 * Math.PI
    );
    ctx.fill();
    
    // Right eye shine
    ctx.beginPath();
    ctx.ellipse(
      rightEyeCenter[0] - rightEyeWidth / 8, 
      rightEyeCenter[1] - rightEyeWidth / 8, 
      rightEyeWidth / 10, 
      rightEyeWidth / 10, 
      0, 0, 2 * Math.PI
    );
    ctx.fill();
    
    // 4. Draw anime-style mouth
    const mouthPoints = [
      landmarks[61], // Mouth left corner
      landmarks[291], // Mouth right corner
      landmarks[0], // Mouth top
      landmarks[17], // Mouth bottom
    ];
    
    const mouthCenter = [
      (mouthPoints[0][0] + mouthPoints[1][0]) / 2,
      (mouthPoints[2][1] + mouthPoints[3][1]) / 2
    ];
    
    const mouthWidth = Math.abs(mouthPoints[1][0] - mouthPoints[0][0]) * 0.8;
    
    // Draw simplified anime mouth
    ctx.strokeStyle = '#d63031';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mouthCenter[0] - mouthWidth / 2, mouthCenter[1]);
    ctx.lineTo(mouthCenter[0] + mouthWidth / 2, mouthCenter[1]);
    ctx.stroke();
    
    // 5. Apply overall anime-style filter
    // Add edge enhancement
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
    
    // Add subtle color tint for anime feel
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = 'rgba(255, 230, 240, 0.2)'; // Slight pink tint
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';
    
    return ctx.canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error applying anime style:', error);
    throw new Error('Failed to apply anime style transformation. Please try another image.');
  }
};

// Fallback transformation when face detection fails
const applySimpleAnimeFilter = (
  img: HTMLImageElement
): string => {
  try {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create canvas context');
    }
    
    // Draw original image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Apply simple anime-style filter effects
    
    // 1. Simplify colors (posterize)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Reduce color depth
      data[i] = Math.round(data[i] / 32) * 32;     // R
      data[i + 1] = Math.round(data[i + 1] / 32) * 32; // G
      data[i + 2] = Math.round(data[i + 2] / 32) * 32; // B
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // 2. Apply edge enhancement
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    
    // 3. Add subtle color tint for anime feel
    ctx.globalCompositeOperation = 'color';
    ctx.fillStyle = 'rgba(255, 230, 240, 0.2)'; // Slight pink tint
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error applying simple anime filter:', error);
    throw new Error('Failed to apply anime filter. Please try again.');
  }
};

// Main processing function
export const processImage = async (
  imageDataURL: string, 
  progressCallback: (progress: number) => void
): Promise<string> => {
  try {
    // Update progress
    progressCallback(10);
    
    // Create image from data URL
    const img = await createImageFromDataURL(imageDataURL);
    
    progressCallback(30);
    
    // Load models if not already loaded
    if (!faceDetectionModel) {
      try {
        await loadModels();
      } catch (error) {
        console.warn('Face detection model failed to load, using fallback filter:', error);
        progressCallback(80);
        // Use fallback filter if face detection fails
        const resultDataURL = applySimpleAnimeFilter(img);
        progressCallback(100);
        return resultDataURL;
      }
    }
    
    progressCallback(40);
    
    // Detect face
    let face;
    try {
      face = await detectFace(img);
    } catch (error) {
      console.warn('Face detection failed, using fallback filter:', error);
      progressCallback(80);
      // Use fallback filter if face detection fails
      const resultDataURL = applySimpleAnimeFilter(img);
      progressCallback(100);
      return resultDataURL;
    }
    
    if (!face) {
      console.warn('No face detected, using fallback filter');
      progressCallback(80);
      // Use fallback filter if no face is detected
      const resultDataURL = applySimpleAnimeFilter(img);
      progressCallback(100);
      return resultDataURL;
    }
    
    progressCallback(60);
    
    // Create canvas for processing
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not create canvas context');
    }
    
    progressCallback(70);
    
    // Apply anime style transformation
    let resultDataURL;
    try {
      resultDataURL = applyAnimeStyle(ctx, img, face, canvas.width, canvas.height);
    } catch (error) {
      console.warn('Anime style transformation failed, using fallback filter:', error);
      resultDataURL = applySimpleAnimeFilter(img);
    }
    
    progressCallback(90);
    
    // Simulate some processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    progressCallback(100);
    
    return resultDataURL;
  } catch (error) {
    console.error('Error in image processing:', error);
    throw error instanceof Error ? error : new Error('Unknown error during image processing');
  }
};
