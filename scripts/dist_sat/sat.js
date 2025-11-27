/**
 * sat.js -- Minimal Separating Axis Theorem (SAT) utilities
 * for convex polygon intersection and containment testing.
 *
 * Designed for SVG / camera coordinate transforms in ES6 environments.
 *
 * Author: N
 * License: MIT
 * For documentation see: https://dr-nick-nagel.github.io/blog/separating-axis-theorem-sat.html
 */

// ---------- Vector helpers ----------
export const dot = (a, b) => a.x * b.x + a.y * b.y;
export const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
export const perp = (v) => ({ x: -v.y, y: v.x });
export const normalize = (v) => {
  const L = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / L, y: v.y / L };
};

// ---------- Project polygon on axis ----------
export function projectPolygon(poly, axis) {
  let min = dot(poly[0], axis);
  let max = min;
  for (let i = 1; i < poly.length; i++) {
    const p = dot(poly[i], axis);
    if (p < min) min = p;
    if (p > max) max = p;
  }
  return { min, max };
}

export const overlaps = (projA, projB, eps = 1e-6) =>
  projA.max + eps >= projB.min && projB.max + eps >= projA.min;

// ---------- SAT intersection test ----------
export function polygonsIntersect(polyA, polyB) {
  const polygons = [polyA, polyB];
  for (const polygon of polygons) {
    const n = polygon.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const edge = sub(polygon[j], polygon[i]);
      const axis = normalize(perp(edge));

      const projA = projectPolygon(polyA, axis);
      const projB = projectPolygon(polyB, axis);
      if (!overlaps(projA, projB)) return false; // separating axis found
    }
  }
  return true; // no separating axis => polygons intersect
}

// ---------- Point-in-polygon (ray casting) ----------
export function pointInPolygon(pt, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect =
      (yi > pt.y) !== (yj > pt.y) &&
      pt.x < (xj - xi) * (pt.y - yi) / (yj - yi + 0.0) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// ---------- Containment test: outer contains inner ----------
export function polygonContainsPolygon(outer, inner) {
  // Quick reject: no intersection, no containment
  if (!polygonsIntersect(outer, inner)) return false;
  // All inner vertices must be inside outer
  return inner.every((p) => pointInPolygon(p, outer));
}

// ---------- Utility: make and transform rectangles ----------
export function makeRect(x0, y0, x1, y1) {
  return [
    { x: x0, y: y0 },
    { x: x1, y: y0 },
    { x: x1, y: y1 },
    { x: x0, y: y1 },
  ];
}

/**
 * Transform polygon using an SVGMatrix (or any object with a matrixTransform method).
 * Compatible with SVG DOM APIs.
 */
export function transformPolygon(polygon, matrix, svgRoot) {
  return polygon.map(( pt ) => {
    const P = svgRoot.createSVGPoint();
    P.x = pt.x;
    P.y = pt.y;
    const res = P.matrixTransform(matrix);
    return { x: res.x, y: res.y };
  });
}

// ---------- Example: check camera containment ----------
/**
 * Example usage:
 * 
 * import {
 *   makeRect, transformPolygon, polygonContainsPolygon
 * } from './sat.js';
 * 
 * const worldPoly = makeRect(0, 0, 600, 600);
 * const cameraRect = makeRect(180, 60, 455, 360);
 * const M = getTM(camera); // your SVGMatrix
 * const cameraWorld = transformPolygon(cameraRect, M, svgRoot);
 * const isContained = polygonContainsPolygon(worldPoly, cameraWorld);
 * 
 * console.log('Camera view inside world?', isContained);
 */
