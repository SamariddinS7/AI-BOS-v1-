import { Camera, CameraType, CameraStatus } from '../types';

const STORAGE_KEY = 'sentinel_cameras_db_v1';

const mockCameras: Camera[] = [];

export const cameraService = {
  getAllCameras: (): Camera[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCameras));
      return mockCameras;
    } catch (e) {
      return mockCameras;
    }
  },

  saveCamera: (camera: Camera): Camera[] => {
    const cameras = cameraService.getAllCameras();
    const index = cameras.findIndex(c => c.id === camera.id);
    let updated: Camera[];
    
    if (index >= 0) {
      updated = [...cameras];
      updated[index] = camera;
    } else {
      updated = [...cameras, camera];
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  deleteCamera: (id: string): Camera[] => {
    const cameras = cameraService.getAllCameras();
    const updated = cameras.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  // Mock implementation of the Secure Link Generator (Device Enrollment)
  generateSecureLink: (deviceId: string, expiryMinutes: number): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mocking a JWT structure: Header.Payload.Signature
            const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
                dev: deviceId,
                exp: Date.now() + expiryMinutes * 60000,
                nonce: Math.random().toString(36).substring(7)
            }))}.SIGNATURE_HASH_SECURE`;
            
            resolve(`https://sentinel-core.internal/connect?token=${mockToken}`);
        }, 800);
    });
  },

  // Generate a read-only stream viewer link (Sharing)
  generateStreamViewerLink: (cameraId: string, expiryLabel: string): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
            // Simulate HLS/WebRTC secure stream URL
            resolve(`https://stream.sentinel.sys/view/${cameraId}/index.m3u8?token=${token}&ttl=${expiryLabel}`);
        }, 600);
    });
  }
};
