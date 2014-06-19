function BeachLine(seed, size) {
	this.getSize = function() { return size; };
	this.voronoiPoints = [];
	this.sightPointIndex = 0;
	this.depth = 0;
	this.seedCount = seed.length;
	var seedSortedByY = seed.sort(function(a, b) {
		if (a.y == b.y) {
			return a.x - b.x;
		} else {
			return a.y - b.y;
		}
	});

	this.getSeedAt = function(i) {
		if (seedSortedByY.length > i) {
			return seedSortedByY[i];
		} else {
			return null;
		}
	};
	this.getNextSight = function() {
		return this.getSeedAt(this.sightPointIndex);
	};
}

BeachLine.prototype.stepNextEvent = function() {
	var event = null;

	var nextCircle = this.getNextCircleEvent();

	if (nextCircle) { // サークルイベントが起きないなら、サイトイベントを起こす。
		event = toCircleEvent(nextCircle, this.voronoiPoints);
	} else {
		var nextPoint = this.getNextSight();
		if (nextPoint) {
			event = toSightEvent(nextPoint, this.voronoiPoints, this.getSize());
			this.sightPointIndex ++;
		} else {
			event = {
				eventBorder: this.getSize().height * 2,
				action: function(topNode) { return topNode; },
				draw: function(context) {}
			};
		}
	}

	// Fire event
	this.topNode = event.action(this.topNode);
	this.lastEvent = event;
	this.depth = event.eventBorder;
};

BeachLine.prototype.stepPixel = function() {
	var nextDepth = this.depth + 1;
	var nextSight = this.getNextSight();
	var sightEventOccur = nextSight
			&& nextDepth > nextSight.y;
	var nextCircle = this.getNextCircleEvent();
	var circleEventOccur = nextCircle
			&& nextDepth > nextCircle.circleEventDepth;
	if (sightEventOccur
			|| circleEventOccur) {
		this.stepNextEvent();
	} else {
		this.depth = nextDepth;
		this.lastEvent = null;
	}
};

BeachLine.prototype.draw = function(context) {
	var size = this.getSize();
	context.clearRect(0,0, size.width, size.height);

	if (this.lastEvent)
		this.lastEvent.draw(context);

	context.beginPath();
	context.strokeStyle = "#aaa";
	context.moveTo(0, this.depth);
	context.lineTo(this.getSize().width, this.depth);
	context.stroke();

	if (this.topNode) {
		var d = this.depth;
		this.topNode.forEach(function(node) {
			node.draw(context, d);
		});
	}
	for (var i = 0, max = this.seedCount; i < max; i ++) {
		var p = this.getSeedAt(i);
		context.beginPath();
		context.strokeStyle = "#00f";
		context.arc(p.x, p.y, 2, 0, 7);
		context.stroke();
	}
	context.strokeStyle = "#f00";
	this.voronoiPoints.forEach(function(v) {
		context.beginPath();
		context.arc(v.x, v.y, 2, 0, 7);
		context.stroke();
	});
};

BeachLine.prototype.getNextCircleEvent = function() {
	var nextSight = this.getNextSight();
	// Seek circle event
	var circleEventQueue = this.toList(function(o1, o2) {
		if (o1.circleEventDepth
			&& o2.circleEventDepth)
			return o1.circleEventDepth - o2.circleEventDepth;
		else if (o1.circleEventDepth) return -1;
		else if (o2.circleEventDepth) return 1;
		else return 0;
	});
	for (var i = 0, max = circleEventQueue.length; i < max; i ++) {
		var arc = circleEventQueue[i];
		// 最後のポイントのサイトイベント後は、すべてのサークルイベントを処理する。
		// 次のサイトイベントの手前に、サークルイベントがあるばあい、今回処理するのはそのサークルイベント
		if (nextSight != null 
				&& arc.circleEventDepth > nextSight.y) {
			break; // サイトイベントの予定があり、キューにあるサークルイベントはすべてより深いものばかり。
		} else if (arc.willClose()) {
			return arc;
		}
	}
	return null;
};

BeachLine.prototype.toList = function(fSort) {
	var list = [];
	if (this.topNode) {
		this.topNode.forEach(function(n) {
			list.push(n);
		});
	}
	return list.sort(fSort);
}