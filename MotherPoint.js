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
	var vWith1 = this.lonleyNeighbor[buddy1];
	var vWith2 = this.lonleyNeighbor[buddy2];
	add.call(this, vWith1, buddy1);
	add.call(this, vWith2, buddy2);

	function add(newVPoint, buddyWith) {
		if (newVPoint) {
			this.voronoiLines.push({
				p1: vPoint,
				p2: newVPoint
			});
		} else {
			this.lonleyNeighbor[buddyWith] = vPoint;
		}
	}
};

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

