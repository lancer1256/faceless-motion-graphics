import * as THREE from 'three';
import { scenesConfig }   from "scene_config";

const DBG = "[OCCLUSION-DEBUG]";

// Project an object's bounding box to NDC and produce a 2-D AABB
function _projectedRect(obj, cam) {
  const b = new THREE.Box3().setFromObject(obj);
  const pts = [
    new THREE.Vector3(b.min.x, b.min.y, b.min.z),
    new THREE.Vector3(b.min.x, b.min.y, b.max.z),
    new THREE.Vector3(b.min.x, b.max.y, b.min.z),
    new THREE.Vector3(b.min.x, b.max.y, b.max.z),
    new THREE.Vector3(b.max.x, b.min.y, b.min.z),
    new THREE.Vector3(b.max.x, b.min.y, b.max.z),
    new THREE.Vector3(b.max.x, b.max.y, b.min.z),
    new THREE.Vector3(b.max.x, b.max.y, b.max.z),
  ];
  let minX =  Infinity, maxX = -Infinity, minY =  Infinity, maxY = -Infinity;
  pts.forEach(p => {
    p.project(cam);
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  });
  return { minX, maxX, minY, maxY };
}

function _overlap(a, b) {
  return !(a.maxX < b.minX || a.minX > b.maxX || a.maxY < b.minY || a.minY > b.maxY);
}

// Y-only nudger (instant; no tween)
function _resolveY(candidate, reference, camera, step = 0.1, limit = 20) {
  console.log(`${DBG} checking "${candidate.name || candidate.id}" against "${reference.name || reference.id}"`);
  const startY = candidate.position.y;
  const refR   = _projectedRect(reference, camera);

  let up = null, dn = null;
  for (let d = step; d <= limit; d += step) {
    candidate.position.y = startY + d;
    if (!_overlap(_projectedRect(candidate, camera), refR)) { up = d; break; }
  }
  for (let d = step; d <= limit; d += step) {
    candidate.position.y = startY - d;
    if (!_overlap(_projectedRect(candidate, camera), refR)) { dn = d; break; }
  }
  candidate.position.y = startY + ((up ?? dn ?? 0) * (up !== null && dn !== null ? (up < dn ? 1 : -1) : (up !== null ? 1 : -1)));

  const finalOverlap = _overlap(_projectedRect(candidate, camera), refR);
  const chosen = (up === null && dn === null) ? 0 : (up !== null && (dn === null || up < dn) ? up : -dn);
  console.log(`${DBG} "${candidate.name || candidate.id}" shiftY=${chosen.toFixed(2)} → overlapResolved=${!finalOverlap}`);
}

/**
 * Generic occlusion pass for one logical scene.
 * Assumes scene graph already reflects the visual pose for that scene.
 */
export function fixOcclusion(sceneId, camera) {
  const sc = scenesConfig.find(s => s.id === sceneId);
  if (!sc) return;

  console.log(`${DBG} ===== Scene ${sceneId} occlusion pass =====`);
  const ref = sc.contentBlocks.find(b => b.isOcclusionMainObjectToCheck);
  if (!ref?.createdMesh) {
    console.warn(`${DBG} Scene ${sceneId} has NO block flagged isOcclusionMainObjectToCheck`);

    // 🔍 EXTRA DUMP
    sc.contentBlocks.forEach(cb => {
      console.log(
        `${DBG}   block "${cb.id}"  type=${cb.type}`,
        'flag=', cb.isOcclusionMainObjectToCheck,
        'createdMesh=', !!cb.createdMesh
      );
    });
    return;
  }
  const movers = sc.contentBlocks.filter(b => b.runOcclusionCheckAndMove && b.createdMesh);
  if (movers.length === 0) {
    console.log(`${DBG} Scene ${sceneId}: nothing marked runOcclusionCheckAndMove`);
  }
  movers.forEach(b => _resolveY(b.createdMesh, ref.createdMesh, camera));
}
