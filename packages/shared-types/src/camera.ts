export type CameraType = 'Dome' | 'Bullet' | 'PTZ' | 'Fisheye';
export type CameraStatus = 'Online' | 'Offline' | 'Maintenance';

export interface Camera {
  id: string;
  name: string;
  type: CameraType;
  status: CameraStatus;
  location: string;
  ipAddress: string;
  lastActive: string;
}
