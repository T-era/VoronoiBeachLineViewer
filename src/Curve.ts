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

	draw(context :CanvasRenderingContext2D, dy :number, fromX :number, toX :number) :void {
		if (this.focus.y === dy) {
			return;
		}
		let f = this.getF(dy);
		let px = fromX;
		let py = f(px);

		context.beginPath();
		context.moveTo(px, py);
		for (let x = fromX; x < toX; x += 0.1) {
			let y = f(x);
			context.lineTo(x, y);
		}
		context.stroke();
	}
}
