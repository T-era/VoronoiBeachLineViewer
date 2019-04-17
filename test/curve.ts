import { equal, ok } from 'assert';

import C, { Curv } from '../src/Curve';
import jr from '../src/JunkRack';

describe('Curve', () => {
	it('create', () => {
		let c = new Curv({ x:2, y:2});
		let f = c.getF(0);
		equal(1, f(2));
		equal(2, f(4));
		equal(2, f(0));
	});
	describe('cross', () => {
		it('curve & vertical', () => {
			let c1 = new Curv({ x:2, y:2});
			let c2 = new Curv({ x:0, y:0});

			let cps = c1.cross(c2, 0);
			test(c1.cross(c2, 0));
			test(c2.cross(c1, 0));
			function test(cps) {
				let left = cps.left;
				let right = cps.right;
				equal(0, left.x);
				equal(2, left.y);
				equal(0, right.x);
				equal(2, right.y);
			}
		});
		it('curve & curve (same y)', () => {
			let c1 = new Curv({ x:2, y:2});
			let c2 = new Curv({ x:6, y:2});

			let cps = c1.cross(c2, 0);
			let left = cps.left;
			let right = cps.right;
			equal(4, left.x);
			equal(2, left.y);
			equal(4, right.x);
			equal(2, right.y);
		});
		it('curve & curve (different y)', () => {
			let c1 = new Curv({ x:2, y:2});
			let c2 = new Curv({ x:6, y:1});

			let cps = c1.cross(c2, 0);
			let left = cps.left;
			let right = cps.right;
			ok(jr.d_same(c1.getF(0)(left.x), left.y));
			ok(jr.d_same(c2.getF(0)(left.x), left.y));
			ok(jr.d_same(c1.getF(0)(right.x), right.y));
			ok(jr.d_same(c2.getF(0)(right.x), right.y));
		});
	});
});
