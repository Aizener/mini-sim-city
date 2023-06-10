import { PerspectiveCamera } from 'three';

export const createPerspectiveCamera = (aspectRatio: number, near = 0.1, far = 1000) => {
  const perspectiveCamera = new PerspectiveCamera(75, aspectRatio, near, far);
  return perspectiveCamera;
}
