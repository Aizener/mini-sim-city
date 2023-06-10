import { createScene } from './scene';
import { createRenderer } from './renderer';
import { createPerspectiveCamera } from './camera';

export const createThreeApp = (options: {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}) => {
  const { canvas, width, height } = options;
  const aspectRatio = width / height;
  const scene = createScene();
  const camera = createPerspectiveCamera(aspectRatio);
  const renderer = createRenderer({
    canvas,
    width,
    height,
  });
  scene.add(camera);
  renderer.render(scene, camera);

  return {
    scene,
    camera,
    renderer,
  };
};
