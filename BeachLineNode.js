function BeachLineNode(motherPoint, size) {
	this.mPoint = motherPoint;
	this.getSize = function() { return size; };
}
BeachLineNode.prototype.computeCircle = function() {
	if (this.prev && this.next) {
		var circle = createCircle(this.mPoint, this.prev.mPoint, this.next.mPoint);
		this.circle = circle;
		this.circleEventDepth = circle.center.y + circle.r;
	}
};

BeachLineNode.prototype.willClose = function() {
	if (this.prev && this.next) {
		var c1 = curveCrosses(this.circleEventDepth, this.mPoint, this.prev.mPoint);
		var c2 = curveCrosses(this.circleEventDepth, this.mPoint, this.next.mPoint);
		var pl = this.prev.lr(c1);
		var pr = this.     lr(c2);

		return d_same(pl.y, pr.y)
			&& d_same(pl.x, pr.x);
	} else {
		return false;
	}
};

BeachLineNode.prototype.containsRangeX = function(x, depth) {
	if (this.prev && this.next) {
		var p1 = this.prev.lr(curveCrosses(depth, this.mPoint, this.prev.mPoint));
		var p2 = this     .lr(curveCrosses(depth, this.mPoint, this.next.mPoint));

		return p1.x < x
				&& x <= p2.x;
	} else if (this.next) {
		var p2 = this     .lr(curveCrosses(depth, this.mPoint, this.next.mPoint));
		return x <= p2.x;
	} else if (this.prev) {
		var p1 = this.prev.lr(curveCrosses(depth, this.mPoint, this.prev.mPoint));
		return p1.x < x;
	} else {
		return true;
	}
};
BeachLineNode.prototype.setNext = function(node, fLR) {
	this.next = node;
	this.lr = fLR;
	if (node) {
		node.prev = this;
//		node.lr = fLR; TODO どっちだっけ？
	}
};

BeachLineNode.prototype.addChild = function(newPoint) {
	// 交点が一つしかないケース/交点が2つあるケース。
	var twoCross = !(newPoint.y == this.mPoint.y);
	var oldPrev = this.prev;
	var oldNext = this.next;
	var firstHalf = new BeachLineNode(this.mPoint, this.getSize());
	var newNode = new BeachLineNode(newPoint, this.getSize());
	firstHalf.setNext(newNode, function(c) { return c.left; });
	if (this.prev) {
		this.prev.setNext(firstHalf, this.prev.lr);
	}
	if (twoCross) {
		var secondHalf = new BeachLineNode(this.mPoint, this.getSize());
		newNode.setNext(secondHalf, function(c) { return c.right; });
		secondHalf.setNext(this.next, this.lr);
		secondHalf.computeCircle();
	}
	firstHalf.computeCircle();
	newNode.computeCircle();
	if (oldPrev) oldPrev.computeCircle();
	if (oldNext) oldNext.computeCircle();

	return firstHalf;
};

BeachLineNode.prototype.remove = function() {
	// 要素を削除(LinkedListを切り詰める)
	if (this.prev) {
		// LRを引き継ぐ。 深い方のLRを設定。
		var lr = this.prev.mPoint.y > this.next.mPoint.y
				? this.prev.lr
				: this.     lr;

		this.prev.next = this.next;
		this.prev.lr = lr;

		if (this.next) {
			this.next.prev = this.prev;
		}
		this.prev.computeCircle();
		if (this.next) this.next.computeCircle();
		this.computeCircle(); // TODO 削除？？
		return this.topNode();
	} else {
		// ここはtopNode。
		if (this.next) {
			this.next.prev = null;
		}
		return this.next;
	}
};

// コレクション操作
BeachLineNode.prototype.addToList = function(list) {
	for (var temp = this; temp; temp = temp.next) {
		list.push(temp);
	}
};
BeachLineNode.prototype.topNode = function() {
	for (var temp = this; ; temp = temp.prev) {
		if (! temp.prev) {
			return temp;
		}
	}
};
BeachLineNode.prototype.forEach = function(f) {
	for (var temp = this; temp; temp = temp.next) {
		f(temp);
	}
};
BeachLineNode.prototype.seek = function(f) {
	for (var temp = this; temp; temp = temp.next) {
		if (f(temp)) {
			return temp;
		}
	}
	return null;
}

BeachLineNode.prototype.draw = function(context, depth) {
	var c1 = this.prev ? curveCrosses(depth, this.prev.mPoint, this.mPoint) : null;
	var c2 = this.next ? curveCrosses(depth, this.mPoint, this.next.mPoint) : null;
	var p1 = c1 ? this.prev.lr(c1) : { x: 0, y: 0 };
	var p2 = c2 ? this     .lr(c2) : { x: this.getSize().width, y: 0 };

	context.strokeStyle = "#aaa";
	var curve = getCurve(depth - this.mPoint.y, this.mPoint);
	curve.draw(context, Math.max(p1.x, 0), Math.min(p2.x, this.getSize().width));
}