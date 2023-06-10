import { WebGLRenderer } from 'three';

export const createRenderer = (options: {
  canvas: HTMLCanvasElement,
  width: number,
  height: number
}) => {
  const { canvas, width, height } = options;
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
  });
  renderer.setSize(width, height);
  return renderer;
};
