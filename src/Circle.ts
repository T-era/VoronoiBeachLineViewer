import jr from './JunkRack';
import { Point } from './types';

export default class Circle {
	center :Point;
	r :number;

	constructor(center :Point, r :number) {
		this.center = center;
		this.r = r;
	}

	// 与えられた3点から、その3つを円周上に持つ円を計算します。
	static create(p1 :Point, p2 :Point, p3 :Point) :Circle|null {
		let d = - determinant(p1.x * p1.x + p1.y * p1.y, p1.y, 1,
				p2.x * p2.x + p2.y * p2.y, p2.y, 1,
				p3.x * p3.x + p3.y * p3.y, p3.y, 1);
		let e = determinant(p1.x * p1.x + p1.y * p1.y, p1.x, 1,
				p2.x * p2.x + p2.y * p2.y, p2.x, 1,
				p3.x * p3.x + p3.y * p3.y, p3.x, 1);
		let a = determinant(p1.x, p1.y, 1,
				p2.x, p2.y, 1,
				p3.x, p3.y, 1);
		let f = - determinant(p1.x * p1.x + p1.y * p1.y, p1.x, p1.y,
				p2.x * p2.x + p2.y * p2.y, p2.x, p2.y,
				p3.x * p3.x + p3.y * p3.y, p3.x, p3.y);
		if (jr.d_same(a, 0)) {
			return null;
		} else {
			let y0 = - e / 2.0 / a;
			let x0 = - d / 2.0 / a;
			let r = Math.sqrt((d * d + e * e) / 4.0 / a / a - f / a);

			return new Circle({ x: x0, y: y0 }, r);
		}

		function determinant(a, b, c,
				d, e, f,
				g, h, i) {
			return a * e * i
					+ b * f * g
					+ c * d * h
					- a * f * h
					- b * d * i
					- c * e * g;
		}
	}

	draw(context) {
		context.beginPath();
		context.strokeStyle = "#f88";
		context.arc(this.center.x, this.center.y, this.r, 0, 7);
		context.stroke();
		context.beginPath();
		context.strokeStyle = "#f00";
		context.arc(this.center.x, this.center.y, 2, 0, 7);
		context.stroke();
	}
}
