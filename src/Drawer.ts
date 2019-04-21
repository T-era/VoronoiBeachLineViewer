import { Point, VoronoiSetting, Size } from './types';
import Line from './Line';
import CCurve , { Curv } from './Curve';
import Circle from './Circle';
import VoronoiLine from './Voronoi/VoronoiLine';
import MPoint from './Voronoi/MPoint';
import BeachLine from './Voronoi/BeachLine';
import Node from './Voronoi/bl/Node';

type VoronoiLineType = typeof VoronoiLine;

export type Draw = ()=>void;

export default class Visualizer {
	drawer :Drawer;

	constructor(drawer :Drawer) {
		this.drawer = drawer;
	}
	drawSeeds(seeds :Point[]) :void {
		seeds.forEach((seed) => {
			this.drawer.drawSeed(seed);
		});
	}
	clearAll() {
		this.drawer.clearAll();
	}
	drawBeachLine(beachLine :BeachLine) {
		this.drawer.clearAll();
		if (beachLine.lastEvent) {
			let eventDraw = beachLine.lastEvent.selectDraw(this.drawer);
			eventDraw();
		}
		let d = beachLine.depth;
		this.drawer.drawScanLine(d);

		if (beachLine.topNode) {
			beachLine.topNode.forEachNode((node) => {
				this.drawer.drawNode(node, d);
			});
		}
		for (let i = 0, max = beachLine.seedCount; i < max; i ++) {
			let p = beachLine.getSeedAt(i);
			this.drawer.drawMPoint(p);
		}
		this.drawer.drawVoronoiLine(VoronoiLine);

		beachLine.voronoiPoints.forEach((v) => {
			this.drawer.drawVPoint(v);
		})
	}
}

export interface Drawer {
	clearAll() :void;
	drawSeed(seeds :Point) :void;
	drawScanLine(d :number) :void;
	drawNode(node :Node, depth :number) :void;
	drawMPoint(mPoint :MPoint) :void;
	drawVoronoiLine(voronoiLine :VoronoiLineType) :void;
	drawVPoint(vPoint :Point) :void;
	sightEventDraw(newPoint :Point) :Draw;
	circleEventDraw(circle :Circle) :Draw;
}

export class Context2DDrawer implements Drawer {
	context :CanvasRenderingContext2D;
	size :Size;
	setting :VoronoiSetting;

	constructor(context :CanvasRenderingContext2D, size :Size, setting :VoronoiSetting) {
		this.context = context;
		this.size = size;
		this.setting = setting;
	}

	clearAll() :void {
		this.context.clearRect(0, 0, this.size.width, this.size.height);
	}
	drawSeed(seed :Point) :void {
		this.context.beginPath();
		this.context.strokeStyle = "#000";
		this.context.arc(seed.x, seed.y, 2, 0, 7);
		this.context.stroke();
	}
	drawScanLine(d :number) :void {
		this.context.beginPath();
		this.context.strokeStyle = "#aaa";
		this.context.moveTo(0, d);
		this.context.lineTo(this.size.width, d);
		this.context.stroke();
	}
	drawNode(node :Node, depth :number) :void {
		let c1 = node.prev ? CCurve.curveCrosses(depth, node.prev.mPoint, node.mPoint) : null;
		let c2 = node.next ? CCurve.curveCrosses(depth, node.mPoint, node.next.mPoint) : null;
		let p1 = c1 ? node.prev.lr(c1) : { x: 0, y: 0 };
		let p2 = c2 ? node     .lr(c2) : { x: this.size.width, y: 0 };

		this.context.strokeStyle = "#aaa";
		let curve = CCurve.create(node.mPoint);
		this.drawCurve(curve, depth, Math.max(p1.x, 0), Math.min(p2.x, this.size.width));
	}
	private drawCurve(curve :Curv, depth :number, left :number, right :number) {
		if (curve.focus.y === depth) {
			return;
		}
		let f = curve.getF(depth);
		let px = left;
		let py = f(px);

		this.context.beginPath();
		this.context.moveTo(px, py);
		for (let x = left; x < right; x += 0.1) {
			let y = f(x);
			this.context.lineTo(x, y);
		}
		this.context.stroke();
	}
	drawMPoint(mPoint :MPoint) :void {
		if (! this.setting.isGiraffeMode) {
			this.context.beginPath();
			this.context.strokeStyle = "#88f";
			this.context.arc(mPoint.x, mPoint.y, 2, 0, 7);
			this.context.stroke();
		}
	}
	drawVoronoiLine(voronoiLine :VoronoiLineType) :void {
		if (this.setting.isGiraffeMode) {
			this.context.lineWidth = 10;
			this.context.strokeStyle = "#ff8";
		} else {
			this.context.strokeStyle = "#080"
		}
		voronoiLine.Closed.forEach((l) => {
			this.drawVLine(l);
		});
		for (let key in VoronoiLine.Unclosed) {
			let vl = VoronoiLine.Unclosed[key];
			let l = Line.getBisector(vl.vPoint, vl.mPoint1, vl.mPoint2, vl.another, this.size);
			this.drawVLine(l);
		}
	}
	private drawVLine(line :Line) :void {
		this.context.beginPath();
		this.context.moveTo(line.p1.x, line.p1.y);
		this.context.lineTo(line.p2.x, line.p2.y);
		this.context.stroke();
	}
	drawVPoint(v :Point) {
		this.context.beginPath();
		this.context.arc(v.x, v.y, 2, 0, 7);
		this.context.stroke();
	}
	sightEventDraw(newPoint :Point) :Draw {
		return () => {
			this.context.beginPath();
			this.context.strokeStyle = "#f00";
			this.context.moveTo(newPoint.x, newPoint.y);
			this.context.lineTo(newPoint.x, 0);
			this.context.stroke();
		};
	}
	circleEventDraw(circle :Circle) :Draw {
		return () => {
			this.context.beginPath();
			this.context.strokeStyle = "#f88";
			this.context.arc(circle.center.x, circle.center.y, circle.r, 0, 7);
			this.context.stroke();
			this.context.beginPath();
			this.context.strokeStyle = "#f00";
			this.context.arc(circle.center.x, circle.center.y, 2, 0, 7);
			this.context.stroke();
		}
	}
}
