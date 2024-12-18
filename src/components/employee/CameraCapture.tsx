import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, XCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface CameraCaptureProps {
  onPhotoCapture: (imageBlob: Blob) => void;
  isCapturing?: boolean;
}

export default function CameraCapture({ 
  onPhotoCapture, 
  isCapturing = false 
}: CameraCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    setIsLoading(true);
    setCameraError(null);

    try {
      // Request camera with specific constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1920, max: 3840 },
          height: { ideal: 1080, max: 2160 },
          facingMode: { 
            ideal: ['user', 'environment'] 
          }
        },
        audio: false
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Verbose logging and error handling
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded', {
            videoWidth: videoRef.current?.videoWidth,
            videoHeight: videoRef.current?.videoHeight
          });
        };

        // Explicitly play the video
        const playPromise = videoRef.current.play();
        
        playPromise.then(() => {
          console.log('Video playback started successfully');
          setIsLoading(false);
        }).catch((error) => {
          console.error('Error playing video:', error);
          setCameraError(`Failed to play video: ${error.message}`);
          setIsLoading(false);
        });
      }
    } catch (err) {
      console.error('Camera access error:', err);
      
      // Detailed error handling
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
            setCameraError('Camera access was denied. Please grant camera permissions.');
            break;
          case 'NotFoundError':
            setCameraError('No camera found on this device.');
            break;
          case 'OverconstrainedError':
            setCameraError('Camera constraints are too specific. Try a different camera mode.');
            break;
          default:
            setCameraError(`Camera error: ${err.message}`);
        }
      } else {
        setCameraError('An unexpected error occurred while accessing the camera.');
      }
      
      setIsLoading(false);
      
      // Show toast notification
      toast({
        title: "Camera Error",
        description: cameraError || "Could not access camera.",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !stream) {
      toast({
        title: "Error",
        description: "Camera not ready. Please start the camera first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const video = videoRef.current;

      // Extensive logging for debugging
      console.log('Capture attempt details:', {
        videoReady: !!video,
        readyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        videoSrc: video.srcObject ? 'Source exists' : 'No source'
      });

      // Ensure video is ready
      if (video.readyState < 2 || video.videoWidth <= 0 || video.videoHeight <= 0) {
        throw new Error('Video not ready for capture');
      }

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Capture the frame with horizontal flip
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        }, "image/jpeg", 0.8);
      });

      // Call photo capture callback
      onPhotoCapture(blob);

      // Stop the stream
      stopCamera();
    } catch (err) {
      console.error("Capture error:", err);
      toast({
        title: "Capture Error",
        description: "Could not capture photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };
  
  return (
    <div className="space-y-4">
      {cameraError && (
        <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-2 rounded">
          {cameraError}
        </div>
      )}

      {!stream ? (
        <Button 
          onClick={startCamera} 
          disabled={isLoading}
          className="w-full"
        >
          <Camera className="mr-2" />
          {isLoading ? 'Starting Camera...' : 'Start Camera'}
        </Button>
      ) : (
        <>
          <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
              style={{ 
                backgroundColor: 'transparent',
                objectFit: 'cover' 
              }}
            />
            <Button 
              onClick={stopCamera}
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/50 hover:bg-white/70 rounded-full"
            >
              <XCircle className="w-6 h-6 text-red-500" />
            </Button>
          </div>
          <Button 
            onClick={capturePhoto} 
            disabled={isCapturing || isLoading}
            className="w-full"
          >
            {isCapturing ? 'Capturing...' : 'Capture Photo'}
          </Button>
        </>
      )}
    </div>
  );
}