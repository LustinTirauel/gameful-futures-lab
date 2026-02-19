import { PerspectiveCamera, Vector3 } from 'three';
import type { PeopleLayoutPreset } from './types';

export function getLineupTarget(index: number, total: number, columns = 3): { xIndex: number; row: number; itemsInRow: number } {
  const row = Math.floor(index / columns);
  const rowStart = row * columns;
  const remaining = Math.max(0, total - rowStart);
  const itemsInRow = Math.min(columns, remaining);
  const xIndex = index - rowStart;
  return { xIndex, row, itemsInRow };
}

export function getPeopleLayoutNdc(
  index: number,
  total: number,
  preset: PeopleLayoutPreset,
  columns: number,
  spacing: number,
  rowOffset: number,
): { x: number; y: number } {
  if (preset === 'custom') {
    return { x: 0, y: 0 };
  }

  const safeColumns = Math.max(1, Math.round(columns));
  const safeSpacing = Math.max(0.2, Math.min(0.8, spacing));
  const slot = getLineupTarget(index, total, safeColumns);
  const rowCenter = (slot.itemsInRow - 1) / 2;
  const xSpacing = safeSpacing;
  const yStep = safeSpacing * 0.77;
  const x = (slot.xIndex - rowCenter) * xSpacing;
  const yStart = 0.24;
  const y = yStart - (slot.row - rowOffset) * yStep;

  return { x, y };
}



export function projectNdcToGround(
  ndcX: number,
  ndcY: number,
  cameraX: number,
  cameraY: number,
  cameraZ: number,
  fov: number,
  groundY = -0.1,
): { x: number; z: number } {
  const camera = new PerspectiveCamera(fov, 1, 0.1, 1000);
  camera.position.set(cameraX, cameraY, cameraZ);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();

  const point = new Vector3(ndcX, ndcY, 0.5).unproject(camera);
  const direction = point.sub(camera.position).normalize();
  const distance = (groundY - camera.position.y) / direction.y;

  return {
    x: camera.position.x + direction.x * distance,
    z: camera.position.z + direction.z * distance,
  };
}

export function projectGroundToNdc(
  x: number,
  y: number,
  z: number,
  cameraX: number,
  cameraY: number,
  cameraZ: number,
  fov: number,
): { x: number; y: number } {
  const camera = new PerspectiveCamera(fov, 1, 0.1, 1000);
  camera.position.set(cameraX, cameraY, cameraZ);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();

  const ndcPoint = new Vector3(x, y, z).project(camera);
  return { x: ndcPoint.x, y: ndcPoint.y };
}

export function getScreenSouthYaw(cameraX: number, cameraY: number, cameraZ: number, fov: number): number {
  const center = projectNdcToGround(0, 0.02, cameraX, cameraY, cameraZ, fov);
  const lower = projectNdcToGround(0, -0.55, cameraX, cameraY, cameraZ, fov);
  return Math.atan2(lower.x - center.x, lower.z - center.z);
}

export function getSceneLayerRect(
  viewportWidthPx: number,
  viewportHeightPx: number,
  sceneWorldWidthPx: number,
  sceneWorldHeightPx: number,
  sceneOffsetXPercent: number,
  sceneOffsetYPercent: number,
): { left: number; top: number; width: number; height: number; bottom: number } {
  const width = sceneWorldWidthPx;
  const height = sceneWorldHeightPx;
  const left = viewportWidthPx * 0.5 - width * 0.5 + width * (sceneOffsetXPercent / 100);
  const top = viewportHeightPx * 0.5 - height * 0.5 + height * (sceneOffsetYPercent / 100);
  return { left, top, width, height, bottom: top + height };
}

export function ndcToSceneLayerPixels(
  ndcX: number,
  ndcY: number,
  sceneLayerRect: { left: number; top: number; width: number; height: number },
): { x: number; y: number } {
  return {
    x: sceneLayerRect.left + ((ndcX + 1) / 2) * sceneLayerRect.width,
    y: sceneLayerRect.top + ((1 - ndcY) / 2) * sceneLayerRect.height,
  };
}


