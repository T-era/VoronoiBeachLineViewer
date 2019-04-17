import { Point, Size } from './types';
import jr from './JunkRack'

type Comp = -1|0|1;

export default class Line {
	private p1 :Point;
	private p2 :Point;

	constructor(p1 :Point, p2 :Point) {
		this.p1 = p1;
		this.p2 = p2;
	}

	draw(context :CanvasRenderingContext2D) :void {
		context.beginPath();
		context.moveTo(this.p1.x, this.p1.y);
		context.lineTo(this.p2.x, this.p2.y);
		context.stroke();
	}
	/// p1, p2 の中点を通り、もう一点と反対方向に延びる線分を返します。
	/// 線分の両端は、vとworldSizeの境界上になります。
	static getBisector(v :Point, p1 :Point, p2 :Point, anotherSideP :Point, worldSize :Size) :Line {
		return new Line(v, anotherPoint());

		function anotherPoint() :Point {
			let c = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
			if (jr.d_same(p1.y, p2.y)) {
				let y;
				if (c.y > anotherSideP.y) {
					y = worldSize.height;
				} else {
					y = 0;
				}
				return {x: c.x, y: y};
			} else if (jr.d_same(p1.x, p2.x)) {
				let x;
				if (c.x > anotherSideP.x) {
					x = worldSize.width;
				} else {
					x = 0;
				}
				return {x: x, y: c.y};
			} else {
				return getEdge();
			}
			function getEdge() :Point {
				let d = (p1.x - p2.x) / (p2.y - p1.y);
				let pa = {x: 0, y: f2(0)};
				if (side(pa) === side(anotherSideP)) {
					let pb = {x: worldSize.width, y: f2(worldSize.width) };
					return pb;
				} else {
					return pa;
				}

				function side(p) :Comp { return sign(-(p.x - c.x) / d + c.y - p.y); }
				function sign(num) :Comp {
					if (num < 0) return -1;
					else if (num > 0) return 1;
					else return 0;
				}
				function f2(x) { return (x - c.x) * d + c.y; }
			}
		}
	}
}
