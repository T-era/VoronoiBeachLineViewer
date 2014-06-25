(function() {
	Voronoi.BeachLine.Node = function(motherPoint) {
		this.mPoint = motherPoint;
	}
	Voronoi.BeachLine.Node.prototype.computeCircle = function() {
		if (this.prev && this.next) {
			var circle = Circle.create(this.mPoint, this.prev.mPoint, this.next.mPoint);
			this.circle = circle;
			if (circle) {
				this.circleEventDepth = circle.center.y + circle.r;
			} else {
				delete this.circleEventDepth;
			}
		}
	};

	Voronoi.BeachLine.Node.prototype.willClose = function() {
		if (d_same(this.circleEventDepth, this.mPoint.y)) {
			// 交点直下でSightイベントが発生する場合への対処。
			return false;
		} else if (this.prev && this.next) {
			var c1 = CCurve.curveCrosses(this.circleEventDepth, this.mPoint, this.prev.mPoint);
			var c2 = CCurve.curveCrosses(this.circleEventDepth, this.mPoint, this.next.mPoint);
			var pl = this.prev.lr(c1);
			var pr = this.     lr(c2);

			return d_same(pl.y, pr.y)
				&& d_same(pl.x, pr.x);
		} else {
			return false;
		}
	};

	Voronoi.BeachLine.Node.prototype.containsRangeX = function(x, depth) {
		if (this.prev && this.next) {
			var p1 = this.prev.lr(CCurve.curveCrosses(depth, this.mPoint, this.prev.mPoint));
			var p2 = this     .lr(CCurve.curveCrosses(depth, this.mPoint, this.next.mPoint));

			return p1 && p2
				&& p1.x <= x
				&& x < p2.x;
		} else if (this.next) {
			var p2 = this     .lr(CCurve.curveCrosses(depth, this.mPoint, this.next.mPoint));
			return p2
				&& x < p2.x;
		} else if (this.prev) {
			var p1 = this.prev.lr(CCurve.curveCrosses(depth, this.mPoint, this.prev.mPoint));
			return p1
				&& p1.x <= x;
		} else {
			return true;
		}
	};
	Voronoi.BeachLine.Node.prototype.setNext = function(node, fLR) {
		this.next = node;
		this.lr = fLR;
		if (node) {
			node.prev = this;
		}
	};

	Voronoi.BeachLine.Node.prototype.addChild = function(newPoint) {
		// 交点が一つしかないケース/交点が2つあるケース。
		var twoCross = !(newPoint.y == this.mPoint.y);
		var oldNext = this.next;
		var firstHalf = this;
		var oldLR = this.lr;
		var newNode = new Voronoi.BeachLine.Node(newPoint);
		firstHalf.setNext(newNode, function(c) { return c == null ? null : c.left; });
		if (twoCross) {
			var secondHalf = new Voronoi.BeachLine.Node(this.mPoint);
			newNode.setNext(secondHalf, function(c) { return c.right; });
			secondHalf.setNext(oldNext, oldLR);
			secondHalf.computeCircle();
		}
		firstHalf.computeCircle();
		newNode.computeCircle();
		if (oldNext) oldNext.computeCircle();

		return firstHalf;
	};

	Voronoi.BeachLine.Node.prototype.remove = function() {
		// 要素を削除(LinkedListを切り詰める)
		// LRを引き継ぐ。 深い方のLRを設定。
		var lr = this.prev.mPoint.y > this.next.mPoint.y
				? this.prev.lr
				: this.     lr;

		this.prev.next = this.next;
		this.prev.lr = lr;

		this.next.prev = this.prev;
		this.prev.computeCircle();
		if (this.next) this.next.computeCircle();
		return this.topNode();
	};

	// コレクション操作
	Voronoi.BeachLine.Node.prototype.seek = function(f) {
		for (var temp = this; temp; temp = temp.next) {
			if (f(temp)) {
				return temp;
			}
		}
		return null;
	}

	Voronoi.BeachLine.Node.prototype.addToList = function(list) {
		for (var temp = this; temp; temp = temp.next) {
			list.push(temp);
		}
	};
	Voronoi.BeachLine.Node.prototype.topNode = function() {
		for (var temp = this; ; temp = temp.prev) {
			if (! temp.prev) {
				return temp;
			}
		}
	};
	Voronoi.BeachLine.Node.prototype.forEach = function(f) {
		for (var temp = this; temp; temp = temp.next) {
			f(temp);
		}
	};

	Voronoi.BeachLine.Node.prototype.draw = function(context, depth) {
		var size = Voronoi.WorldSize;
		var c1 = this.prev ? CCurve.curveCrosses(depth, this.prev.mPoint, this.mPoint) : null;
		var c2 = this.next ? CCurve.curveCrosses(depth, this.mPoint, this.next.mPoint) : null;
		var p1 = c1 ? this.prev.lr(c1) : { x: 0, y: 0 };
		var p2 = c2 ? this     .lr(c2) : { x: size.width, y: 0 };

		context.strokeStyle = "#aaa";
		var curve = CCurve.create(depth - this.mPoint.y, this.mPoint);
		curve.draw(context, Math.max(p1.x, 0), Math.min(p2.x, size.width));
	}
})();