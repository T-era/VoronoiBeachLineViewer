import { Point, Size, VoronoiSetting } from '../types';
import jr from '../JunkRack';
import MPoint from './MPoint';
import Events, { Event } from './bl/Events';
import Node from './bl/Node';

type Logger = (msg :string)=>void;
type NodeSort = (a :Node, b:Node)=>number;

export default class BeachLine {
	voronoiPoints :Point[];
	sightPointIndex :number;
	depth :number;
	seedCount :number;
	seedSortedByY :MPoint[];
	logger :Logger;
	topNode :Node|null;
	lastEvent :Event|null;

	constructor(arg :Point[], logger :Logger) {
		this.voronoiPoints = [];
		this.sightPointIndex = 0;
		this.depth = 0;
		let seed = jr.uniqueList(arg, function(p1, p2) {
			return jr.d_same(p1.x, p2.x, 3)
				&& jr.d_same(p1.y, p2.y, 3);
		}).map(function(p) { return new MPoint(p); });
		this.seedCount = seed.length;
		logger(seed.length + "　points.");
		this.seedSortedByY = seed.sort(function(a, b) {
			if (a.y == b.y) {
				return a.x - b.x;
			} else {
				return a.y - b.y;
			}
		});

		this.logger = logger;
	}
	addVPoint(vPoint :Point, m1 :MPoint, m2 :MPoint, m3 :MPoint) :void {
		this.voronoiPoints.push(vPoint);
		m1.addVPoint(vPoint,m2,m3);
		m2.addVPoint(vPoint,m1,m3);
		m3.addVPoint(vPoint,m1,m2);
	};
	getSeedAt(i :number) :MPoint|null {
		if (this.seedSortedByY.length > i) {
			return this.seedSortedByY[i];
		} else {
			return null;
		}
	};
	getNextSight() :MPoint|null {
		return this.getSeedAt(this.sightPointIndex);
	};

	stepNextEvent(size :Size) :boolean {
		let event = null;
		let done = false;

		let nextCircle = this.getNextCircleEvent();

		if (nextCircle) { // サークルイベントが起きないなら、サイトイベントを起こす。
			event = Events.toCircleEvent(nextCircle, this);
		} else {
			let nextPoint = this.getNextSight();
			if (nextPoint) {
				event = Events.toSightEvent(nextPoint, this);
				this.sightPointIndex ++;
			} else {
				event = {
					eventBorder: size.height * 2,
					action: function(topNode) {
						topNode.forEachNode(function(node) {
							node.mPoint.finalize(size);
						});
						return topNode;
					},
					draw: function(context) {}
				};
				done = true;
			}
		}

		// Fire event
		this.topNode = event.action(this.topNode);
		this.lastEvent = event;
		this.depth = event.eventBorder;
		this.logger("Event:@" + jr.dTo_2s(this.depth) + " " + event.toString());
		return done;
	};

	stepPixel(size :Size) :void {
		let nextDepth = this.depth + 1;
		let nextSight = this.getNextSight();
		let sightEventOccur = nextSight
				&& nextDepth > nextSight.y;
		let nextCircle = this.getNextCircleEvent();
		let circleEventOccur = nextCircle
				&& nextDepth > nextCircle.circleEventDepth;
		if (sightEventOccur
				|| circleEventOccur) {
			this.stepNextEvent(size);
		} else {
			this.depth = nextDepth;
			this.lastEvent = null;
			this.logger("Step to " + jr.dTo_2s(this.depth));
		}
	};

	draw(context :CanvasRenderingContext2D, size :Size, setting :VoronoiSetting) :void {
		context.clearRect(0,0, size.width, size.height);

		if (this.lastEvent)
			this.lastEvent.draw(context);

		context.beginPath();
		context.strokeStyle = "#aaa";
		context.moveTo(0, this.depth);
		context.lineTo(size.width, this.depth);
		context.stroke();

		if (this.topNode) {
			let d = this.depth;
			this.topNode.forEachNode(function(node) {
				node.draw(context, d, size);
			});
		}
		for (let i = 0, max = this.seedCount; i < max; i ++) {
			let p = this.getSeedAt(i);
			p.draw(context, setting);
		}
		if (!setting.isGiraffeMode) {
			context.strokeStyle = "#f00";
			this.voronoiPoints.forEach(function(v) {
				context.beginPath();
				context.arc(v.x, v.y, 2, 0, 7);
				context.stroke();
			});
		}
	};

	getNextCircleEvent() :Node|null {
		let nextSight = this.getNextSight();
		// Seek circle event
		let circleEventQueue = this.toList(function(o1, o2) {
			if (o1.circleEventDepth
				&& o2.circleEventDepth)
				return o1.circleEventDepth - o2.circleEventDepth;
			else if (o1.circleEventDepth) return -1;
			else if (o2.circleEventDepth) return 1;
			else return 0;
		});
		for (let i = 0, max = circleEventQueue.length; i < max; i ++) {
			let arc = circleEventQueue[i];
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

	toList(fSort :NodeSort) :Node[] {
		let list = [];
		if (this.topNode) {
			this.topNode.forEachNode(function(n) {
				list.push(n);
			});
		}
		return list.sort(fSort);
	}
}
