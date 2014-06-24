function Line(p1, p2) {
	this.p1 = p1;
	this.p2 = p2;
}

Line.prototype.draw = function(context) {
	context.beginPath();
	context.moveTo(this.p1.x, this.p1.y);
	context.lineTo(this.p2.x, this.p2.y);
	context.stroke();
}

/// p1, p2 の中点を通り、もう一点と反対方向に延びる線分を返します。
/// 線分の両端は、vとworldSizeの境界上になります。
Line.getBisector　= function(v, p1, p2, anotherSideP) {
	var worldSize = getWorldSize();
	return new Line(v, anotherPoint());

	function anotherPoint() {
		var c = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
		if (p1.y === p2.y) {
			var y;
			if (c.y > anotherSideP.y) {
				y = worldSize.height;
			} else {
				y = 0;
			}
			return {x: c.x, y: y};
		} else if (p1.x === p2.x) {
			var x;
			if (c.x > anotherSideP.x) {
				x = worldSize.width;
			} else {
				x = 0;
			}
			return {x: x, y: c.y};
		} else {
			return getEdge();
		}
		function getEdge() {
			var d = (p1.x - p2.x) / (p2.y - p1.y);

			var pa = {x: 0, y: f2(0)};
			if (side(pa) === side(anotherSideP)) {
				var pb = {x: worldSize.width, y: f2(worldSize.width) };
				return pb;
			} else {
				return pa;
			}

			function side(p) { return sign(-(p.x - c.x) / d + c.y - p.y); }
			function sign(num) {
				if (num < 0) return -1;
				else if (num > 0) return 1;
				else return 0;
			}
			function f2(x) { return (x - c.x) * d + c.y; }
		}
	}
}