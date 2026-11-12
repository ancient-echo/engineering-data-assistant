// 工程数据助手公开版：可离线运行的基础数据计算核心
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.EngineeringData = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  function parseTwoColumnCsv(raw) {
    if (typeof raw !== 'string') throw new Error('数据必须为文本。');
    const lines = raw.replace(/^\uFEFF/, '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (lines.length < 3) throw new Error('请提供两列表头及至少两行数值数据。');
    if (lines.length > 5001) throw new Error('最多支持 5000 行数值数据。');
    const header = lines[0].split(',').map(s => s.trim());
    if (header.length !== 2 || header.some(s => !s)) throw new Error('表头必须恰好包含两个非空字段。');
    const points = lines.slice(1).map((line, i) => {
      const cols = line.split(',').map(s => s.trim());
      if (cols.length !== 2 || cols.some(v => v === '' || !Number.isFinite(Number(v))))
        throw new Error('第 ' + (i + 2) + ' 行需要两个有效数字。');
      return { x: Number(cols[0]), y: Number(cols[1]) };
    });
    return { labels: header, points };
  }
  function linearRegression(points) {
    if (!Array.isArray(points) || points.length < 2) throw new Error('至少需要两个数据点。');
    const n = points.length;
    if (points.some(p => !p || !Number.isFinite(p.x) || !Number.isFinite(p.y)))
      throw new Error('数据点必须是有限数字。');
    const mx = points.reduce((s,p) => s + p.x, 0) / n;
    const my = points.reduce((s,p) => s + p.y, 0) / n;
    const sxx = points.reduce((s,p) => s + (p.x - mx) ** 2, 0);
    const sxy = points.reduce((s,p) => s + (p.x - mx) * (p.y - my), 0);
    const syy = points.reduce((s,p) => s + (p.y - my) ** 2, 0);
    if (!Number.isFinite(sxx) || sxx === 0) throw new Error('横轴数据不能全部相同或数值过大。');
    const a = sxy / sxx, b = my - a * mx;
    const sse = points.reduce((s,p) => s + (p.y - a * p.x - b) ** 2, 0);
    const r2 = syy === 0 ? (sse < 1e-12 ? 1 : NaN) : 1 - sse / syy;
    if (![a,b,r2].every(Number.isFinite)) throw new Error('数据数值范围过大，无法可靠拟合。');
    return { a, b, r2 };
  }
  return { parseTwoColumnCsv, linearRegression };
});
