import { equal, ok } from 'assert';

import { sameLine } from './test_tools';
import VoronoiLine from '../src/Voronoi/VoronoiLine';
import MPoint from '../src/Voronoi/MPoint';
import Line from '../src/Line';

describe('VoronoiLine', ()=> {
	let p1 = new MPoint({x:0, y:0});
	let p2 = new MPoint({x:10, y:0});
	let p3 = new MPoint({x:20, y:0});
	let p4 = new MPoint({x:30, y:0});
	let v1 = {x:0, y:10};
	let v2 = {x:10, y:10};
	describe('add', ()=> {
		it('母点の対が重複しないでadd', ()=> {
			let vl = (VoronoiLine as any);
			VoronoiLine.initialize();
			VoronoiLine.add(p1, p2, v1, p3);
			VoronoiLine.add(p1, p3, v1, p4);

			equal(0, vl.Closed.length);
			equal(2, Object.keys(vl.Unclosed).length);
		});
		it('addでVoronoi線が閉じる', ()=> {
			let vl = (VoronoiLine as any);
			VoronoiLine.initialize();
			VoronoiLine.add(p1, p2, v1, p3);  // p1-p2 の一つ目
			VoronoiLine.add(p1, p3, v1, p4);
			VoronoiLine.add(p1, p2, v2, p4);  // p1-p2 の二つ目

			equal(1, vl.Closed.length);
			equal(1, Object.keys(vl.Unclosed).length);
			ok(sameLine(vl.Closed[0], new Line(v1, v2)));
		});
	});
});
