function BeachLine(arg, logger) {
	this.voronoiPoints = [];
	this.voronoiPoints.add = function(vPoint, m1, m2, m3) {
		this.push(vPoint);
		m1.addVPoint(vPoint,m2,m3);
		m2.addVPoint(vPoint,m1,m3);
		m3.addVPoint(vPoint,m1,m2);
	};
	this.sightPointIndex = 0;
	this.depth = 0;
	var seed = [];
	(function() {
		// 重複する要素を除外
		var prev = null;
		arg.sort(function(a, b) {
			if (a.y == b.y) {
				return a.x - b.x;
			} else {
				return a.y - b.y;
			}
		}).forEach(function(p) {
			if (!prev
				|| !d_same(p.x, prev.x, 0.1)
				|| !d_same(p.y, prev.y, 0.1)) {
				seed.push(new MPoint(p));
			}
			prev = p
		});
	})();
	this.seedCount = seed.length;
	logger(seed.length + "　points.");
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

	this.logger = logger;
}

BeachLine.prototype.stepNextEvent = function() {
	var event = null;
	var done = false;

	var nextCircle = this.getNextCircleEvent();

	if (nextCircle) { // サークルイベントが起きないなら、サイトイベントを起こす。
		event = toCircleEvent(nextCircle, this.voronoiPoints);
	} else {
		var nextPoint = this.getNextSight();
		if (nextPoint) {
			event = toSightEvent(nextPoint, this.voronoiPoints);
			this.sightPointIndex ++;
		} else {
			event = {
				eventBorder: getWorldSize().height * 2,
				action: function(topNode) { return topNode; },
				draw: function(context) {}
			};
			done = true;
		}
	}

	// Fire event
	this.topNode = event.action(this.topNode);
	this.lastEvent = event;
	this.depth = event.eventBorder;
	this.logger("Event:@" + dTo_2s(this.depth) + " " + event.toString());
	return done;
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
		this.logger("Step to " + dTo_2s(this.depth));
	}
};

BeachLine.prototype.draw = function(context) {
	var size = getWorldSize();
	context.clearRect(0,0, size.width, size.height);

	if (this.lastEvent)
		this.lastEvent.draw(context);

	context.beginPath();
	context.strokeStyle = "#aaa";
	context.moveTo(0, this.depth);
	context.lineTo(size.width, this.depth);
	context.stroke();

	if (this.topNode) {
		var d = this.depth;
		this.topNode.forEach(function(node) {
			node.draw(context, d);
		});
	}
	for (var i = 0, max = this.seedCount; i < max; i ++) {
		var p = this.getSeedAt(i);
		p.draw(context);
	}
	if (!BeachLine.isGiraffeMode) {
		context.strokeStyle = "#f00";
		this.voronoiPoints.forEach(function(v) {
			context.beginPath();
			context.arc(v.x, v.y, 2, 0, 7);
			context.stroke();
		});
	}
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