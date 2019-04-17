import jr from './JunkRack';
import { Point } from './types';

export default {
	create(depthBy :number, focus :Point) :Curv {
		if (jr.d_same(depthBy, 0)) {
			let vertical = new Vertical();
			vertical.x = focus.x;
			return vertical;
		} else {
			let qCurve = new QCurve();
			qCurve.x = focus.x,
			qCurve.y = focus.y + depthBy / 2;
			qCurve.a = - 1 / 2 / depthBy;
			return qCurve;
		}
	},
	curveCrosses(depth :number, p1 :Point|null, p2 :Point|null) {
		if (! p1|| ! p2) return null;
		return this.create(depth - p1.y, p1)
			.cross(this.create(depth - p2.y, p2));
	}
}

// 二字曲線同士の交点(基本的には、2つある)
export interface CrossPoints {
	right :Point;
	left :Point;
}

export interface Curv {
	x :number;
	y :number;
	a :number;
	f :(x :number)=>number;
	cross(arg :Curv) :CrossPoints;
	draw(context, fromX :number, toX :number) :void;
}

class QCurve implements Curv {
	x :number;
	y :number;
	a :number;

	f(x :number) :number {
		return this.a * (x - this.x) * (x - this.x) + this.y;
	}
	cross(arg :Curv) :CrossPoints {
		if (arg instanceof Vertical) {
			return arg.cross(this);
		} else if (this.a === arg.a) { // d_sameは使わない。a 値は、depthByの増大とともに0に漸近するので、d_sameが偽から真に変化してしまう。
			// 交点が2つ存在しないケース
			if (this.x === arg.x) {
				// 交点なし。
				return null;
			} else {
				// 交点一つ
				let x = (this.x + arg.x) / 2.0;
				let y = this.f(x);
				let point = { x: x, y: y };
				return { right: point, left: point };
			}
		} else {
			// y = a1 * (x - xx1) ^2 + yy1
			// 	 = a1 * x^2 - 2*a1*xx1*x + a1*xx1^2 + yy1
			// y = a2 * (x - xx2) ^2 + yy2
			//   = a2 * x^2 - 2*a2*xx2*x + a2*xx2^2 + yy2
			//
			// 0 = (a1-a2)x^2 - (2*a1*xx1 - 2*a2*xx2) + a1*xx1^2 - a2*xx2^2 + yy1 - yy2

			// p*x^2 + q*x + r = 0
			// p: a1-a2
			// q: -2(a1*xx1 - a2*xx2)
			// r: a1*xx1^2 - a2*xx2^2 + yy1 - yy2

			let p = this.a - arg.a;
			let q = -2.0 * (this.a * this.x - arg.a * arg.x);
			let r = this.a * this.x * this.x
					- arg.a * arg.x * arg.x
					+ this.y - arg.y;

			let x1 = (- q + Math.sqrt(q * q - 4 * p * r)) / (2 * p);
			let x2 = (- q - Math.sqrt(q * q - 4 * p * r)) / (2 * p);
			let xr = Math.max(x1, x2);
			let xl = Math.min(x1, x2);
			let yr = this.f(xr);
			let yl = this.f(xl);
			return {
				right: { x: xr, y: yr },
				left: { x: xl, y: yl }
			};
		}
	}

	draw(context, fromX :number, toX :number) :void {
		let px = fromX;
		let py = this.f(px);

		context.beginPath();
		context.moveTo(px, py);
		for (let x = fromX; x < toX; x += 0.1) {
			let y = this.f(x);
			context.lineTo(x, y);
			px = x;
			py = y;
		}
		context.stroke();
	}
}
class Vertical implements Curv {
	x :number;
	y = undefined;
	a = undefined;

	f(x:number) :number { return this.y; }
	cross(arg :Curv) :CrossPoints {
		if (arg instanceof Vertical) {
			// 垂直線同士の交点はない。(もっとも浅い2点のyが一致した場合にここに来る)
			return null;
		} else {
			let ay = arg.f(this.x);
			let point = { x: this.x, y: ay };
			return {
				right: point,
				left: point
			};
		}
	}
	draw(context) {}
}
