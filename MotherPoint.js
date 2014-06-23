function MPoint(p) {
	this.x = p.x;
	this.y = p.y;
	this.lonleyNeighbor = {};
	this.voronoiLines = [];

	/// toString用(キーに使うため)
	this.str = this.x + "," + this.y;
};

MPoint.prototype.toString = function() {
	return this.str;
};
MPoint.prototype.addVPoint = function(vPoint, buddy1, buddy2) {
	add.call(this, buddy1, buddy2);
	add.call(this, buddy2, buddy1);

	function add(mp1, mp2) {
		var ln = this.lonleyNeighbor[mp1];
		if (ln) {
			var newVPoint = ln.v;
			this.voronoiLines.push({
				p1: vPoint,
				p2: newVPoint
			});
			delete this.lonleyNeighbor[mp1];
		} else {
			this.lonleyNeighbor[mp1] = { k: mp1, v: vPoint, w: mp2 };
		}
	}
};

MPoint.prototype.finalize = function() {
	for (var str in this.lonleyNeighbor) {
		var mp = this.lonleyNeighbor[str].k;
		var vp = this.lonleyNeighbor[str].v;
		var another = this.lonleyNeighbor[str].w;
		var l = getBisector(vp, this, mp, another);
		this.voronoiLines.push(l);
	}
}

MPoint.prototype.draw = function(context) {
	if (! MPoint.isGiraffeMode) {
		context.beginPath();
		context.strokeStyle = "#88f";
		context.arc(this.x, this.y, 2, 0, 7);
		context.stroke();
	}
	this.voronoiLines.forEach(function(l) {
		context.beginPath();
		if (MPoint.isGiraffeMode) {
			context.lineWidth = 10;
			context.strokeStyle = "#ff0";
		} else {
			context.strokeStyle = "#080";
		}
		context.moveTo(l.p1.x, l.p1.y);
		context.lineTo(l.p2.x, l.p2.y);
		context.stroke();
		context.lineWidth = 1;
	});
};

