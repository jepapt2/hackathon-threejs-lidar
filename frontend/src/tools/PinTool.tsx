import React, { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import usePins from './usePins';

// ピン配置用のクリックレイキャスト。active のとき左クリックでピン追加。
export const PinTool: React.FC<{ currentModelId?: string }> = ({ currentModelId }) => {
  const { active, addPin } = usePins();
  const raycaster = useRef(new THREE.Raycaster());
  const pointer = useRef(new THREE.Vector2());
  const tmp = useRef(new THREE.Vector3());
  const { gl, camera, scene } = useThree();

  const handlePointerDown = useCallback((ev: PointerEvent) => {
    if (!active) return;
    if (ev.button !== 0) return; // 左クリックのみ
    const rect = gl.domElement.getBoundingClientRect();
    pointer.current.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.current.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.current.setFromCamera(pointer.current, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);
    // 有効なメッシュ(既存ピンやヘルパーを除外)のみ許可
    const valid = intersects.find(int => {
      const obj = int.object as THREE.Object3D & { isMesh?: boolean; userData?: Record<string, unknown>; visible?: boolean };
      if (!obj.isMesh) return false; // メッシュ以外不可 (Grid/Axis/ライン等)
      if (!obj.visible) return false;
      if (obj.userData?.isPinMarker) return false; // 既存ピン球は除外
      if (obj.userData?.helper) return false; // 何かヘルパー印があれば除外
      return true;
    });
    if (!valid) return; // 空白や対象外オブジェクトクリックは無視
    // ---- OrbitControls に回さない ----
    ev.stopPropagation();
    ev.preventDefault();
    try { (ev.target as Element).releasePointerCapture?.(ev.pointerId); } catch { /* ignore */ }
    tmp.current.copy(valid.point);
    const comment = window.prompt('コメントを入力 (空で追加可能)', '') || '';
    addPin(tmp.current, currentModelId, comment);
  }, [active, gl, camera, scene, addPin, currentModelId]);

  useEffect(() => {
    const el = gl.domElement;
    // capture フェーズで拾って OrbitControls より先に止める
    const options: AddEventListenerOptions = { capture: true };
    el.addEventListener('pointerdown', handlePointerDown, options);
    return () => el.removeEventListener('pointerdown', handlePointerDown, options);
  }, [handlePointerDown, gl]);

  return null;
};

export default PinTool;