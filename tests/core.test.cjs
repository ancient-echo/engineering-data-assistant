const test = require('node:test');
const assert = require('node:assert/strict');
const { parseTwoColumnCsv, linearRegression } = require('../core.js');

test('reads demo data with headers', () => {
  const parsed = parseTwoColumnCsv('x,y\n1,3\n2,5\n3,7');
  assert.deepEqual(parsed.labels, ['x','y']);
  assert.equal(parsed.points.length, 3);
  const fit = linearRegression(parsed.points);
  assert.ok(Math.abs(fit.a - 2) < 1e-12);
  assert.ok(Math.abs(fit.b - 1) < 1e-12);
  assert.ok(Math.abs(fit.r2 - 1) < 1e-12);
});
test('trims a UTF-8 BOM and whitespace', () => {
  assert.deepEqual(parseTwoColumnCsv('\uFEFF x , y\r\n 1 , 4 \r\n2,6').labels, ['x','y']);
});
test('rejects missing and invalid numbers', () => {
  assert.throws(() => parseTwoColumnCsv('x,y\n1,2\n,3'), /有效数字/);
  assert.throws(() => parseTwoColumnCsv('x,y\n1,2\nabc,3'), /有效数字/);
});
test('rejects constant x', () => {
  assert.throws(() => linearRegression([{x:1,y:2},{x:1,y:3}]), /横轴/);
});
test('handles negative slope and constant y', () => {
  const fit = linearRegression([{x:-1,y:5},{x:0,y:3},{x:1,y:1}]);
  assert.ok(Math.abs(fit.a + 2) < 1e-12);
  assert.ok(Math.abs(fit.b - 3) < 1e-12);
  assert.equal(fit.r2,1);
  assert.equal(linearRegression([{x:1,y:7},{x:2,y:7}]).r2,1);
});
