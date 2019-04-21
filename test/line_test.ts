import { equal, ok } from 'assert';

import { samePoint } from './test_tools';
import jr from '../src/JunkRack';
import Line from '../src/Line';

describe('Line', ()=> {
	describe('getBisector', ()=> {
		let p1 = {x:0, y:10};
		let p2 = {x:10, y:0};
		let size = {width: 40, height: 40};
		it('smoke', ()=> {
			let v = {x:5, y:5};
			let another = {x:0, y:0};
			let l = Line.getBisector(v, p1, p2, another, size);

			let a = (l as any);
			if (samePoint(a.p1, v)) {
				equal(40, a.p2.x); // 領域の端っこ
				equal(40, a.p2.y); // 領域の端っこ
			} else {
				ok(samePoint(a.p2, v));
				equal(40, a.p1.x); // 領域の端っこ
				equal(40, a.p1.y); // 領域の端っこ
			}
		});
		it('anotherが判別がつかない', ()=> {
			let v = {x:5, y:5};
			let another = {x:7, y:7};
			let l = Line.getBisector(v, p1, p2, another, size);

			let a = (l as any);
			if (samePoint(a.p1, v)) {
				ok(isEdge(a.p2));
			} else {
				ok(samePoint(a.p2, v));
				ok(isEdge(a.p1));
			}
			function isEdge(p) { // 両端のどちらか(どちらであるかは問わない)
				if (p.x == 0) {
					return p.y == 0;
				} else {
					return p.x == size.width
						&& p.y == size.height;
				}
			}
		});
		it('vが無関係なら例外', ()=> {
			let v = {x:6, y:5};
			let another = {x:0, y:0};
			try {
				let l = Line.getBisector(v, p1, p2, another, size);
				ok(false);
			} catch {
				ok(true);
			}
		});
	})
})
