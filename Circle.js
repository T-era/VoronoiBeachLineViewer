function createCircle(p1, p2, p3) {
	var d = - determinant(p1.x * p1.x + p1.y * p1.y, p1.y, 1,
			p2.x * p2.x + p2.y * p2.y, p2.y, 1,
			p3.x * p3.x + p3.y * p3.y, p3.y, 1);
	var e = determinant(p1.x * p1.x + p1.y * p1.y, p1.x, 1,
			p2.x * p2.x + p2.y * p2.y, p2.x, 1,
			p3.x * p3.x + p3.y * p3.y, p3.x, 1);
	var a = determinant(p1.x, p1.y, 1,
			p2.x, p2.y, 1,
			p3.x, p3.y, 1);
	var f = - determinant(p1.x * p1.x + p1.y * p1.y, p1.x, p1.y,
			p2.x * p2.x + p2.y * p2.y, p2.x, p2.y,
			p3.x * p3.x + p3.y * p3.y, p3.x, p3.y);
	if (d_same(a, 0)) {
		return null;
	} else {
		var y0 = - e / 2.0 / a;
		var x0 = - d / 2.0 / a;
		var r = Math.sqrt((d * d + e * e) / 4.0 / a / a - f / a);

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

function Circle(center, r) {
	this.center = center;
	this.r = r;
}
Circle.prototype.draw = function(context) {
	context.beginPath();
	context.strokeStyle = "#f88";
	context.arc(this.center.x, this.center.y, this.r, 0, 7);
	context.stroke();
	context.beginPath();
	context.strokeStyle = "#f00";
	context.arc(this.center.x, this.center.y, 2, 0, 7);
	context.stroke();
};