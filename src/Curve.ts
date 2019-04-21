import jr from './JunkRack';
import { Point } from './types';

export default {
	create(focus :Point) :Curv {
		return new Curv(focus);
	},
	curveCrosses(depth :number, p1 :Point|null, p2 :Point|null) {
		if (! p1|| ! p2) return null;
		return this.create(p1)
			.cross(this.create(p2), depth);
	}
}

// 二字曲線同士の交点(基本的には、2つある)
export interface CrossPoints {
	right :Point;
	left :Point;
}
type F = (x :number)=>number;

export class Curv {
	focus :Point

	constructor(focus :Point) {
		this.focus = focus;
	}
	getF(y2 :number) :F {
		let x1 = this.focus.x;
		let y1 = this.focus.y;
		if (y1 === y2) {
			return (x:number) => { return undefined };
		} else {
			let y1d = y1 ** 2;
			let y2d = y2 ** 2;
			let dy = y1 - y2;
			return (x :number) => {
				return ((x1 - x) ** 2 + y1d - y2d) / 2 / dy;
			}
		}
	}
	tangentCross(depth :number, x1 :number, x2 :number) :Point {
		// y = ((x1 - x) ^ 2 + y1d - y2d) / 2 / dy;
		// y = (x^2 - 2*x1*x + x1^2 + y1d - y2d) / 2 / dy;
		// dy/dx = 2/2/dy * x - 2*x1/2/dy
		//       = x/dy - x1/dy
		if (jr.d_same(this.focus.y, depth)) {
			return null;
		} else {
			let f = this.getF(depth);
			let y1 = f(x1);
			let y2 = f(x2);
			let df = this.getDF(depth);
			let d1 = df(x1);
			let d2 = df(x2);
			// y = d1*(x - x1) + y1 = d1*x - d1*x1 + y1
			// y = d2*(x - x2) + y2 = d2*x - d2*x2 + y2
			let cx = (d1*x1 - d2*x2 - y1 + y2) / (d1 - d2);
			let cy = d1*(cx - x1) + y1;

			return { x: cx, y: cy };
		}
	}
	private getDF(depth :number) :F {
		let x1 = this.focus.x;
		let y1 = this.focus.y;
		if (jr.d_same(y1, depth)) {
			return (x:number) => { return undefined };
		} else {
			let dy = y1 - depth;
			return (x :number) => {
				return (x - x1) / dy;
			}
		}

	}
	cross(arg :Curv, dy :number) :CrossPoints {
		if (this.focus.y === arg.focus.y) {
			// 真横
			if (this.focus.y === dy) {
				// 交点なし
				return null;
			} else {
				// 交点一つ
				let f = this.getF(dy);
				let x  = (this.focus.x + arg.focus.x) / 2;
				return single(f, x)
			}
		} else if (this.focus.y === dy) {
			return single(arg.getF(dy), this.focus.x);
		} else if (arg.focus.y === dy){
			return single(this.getF(dy), arg.focus.x);
		} else {
			let f = this.getF(dy);
			let x1 = this.focus.x;
			let y1 = this.focus.y;
			let x2 = arg.focus.x;
			let y2 = arg.focus.y;
			let a = y2 - y1;
			let b = -2 * (x1 * y2 - x2 * y1 - x1 * dy + x2 * dy)
			let c = (x1 ** 2 + y1 ** 2 - dy ** 2) * (y2 - dy)
				- (x2 ** 2 + y2 ** 2 - dy ** 2) * (y1 - dy);
			let xa = (- b - Math.sqrt(b ** 2 - 4 * a * c)) / 2 / a;
			let xb = (- b + Math.sqrt(b ** 2 - 4 * a * c)) / 2 / a;
			let xl = Math.min(xa, xb);
			let xr = Math.max(xa, xb);
			return {
				left: { x: xl, y: f(xl) },
				right: { x:xr, y: f(xr) }
			};
		}
		function single(f :F, x :number) {
			let y = f(x);
			return {
				left: { x: x, y: y },
				right: { x: x, y: y }
			};

		}
	}
}
