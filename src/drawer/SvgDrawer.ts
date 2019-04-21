import { Point, VoronoiSetting, Size } from '../types';
import Line from '../Line';
import CCurve , { Curv } from '../Curve';
import Circle from '../Circle';
import VoronoiLine from '../Voronoi/VoronoiLine';
import MPoint from '../Voronoi/MPoint';
import BeachLine from '../Voronoi/BeachLine';
import Node from '../Voronoi/bl/Node';
import { Drawer, Draw } from '../Drawer';

type VoronoiLineType = typeof VoronoiLine;

export default class SvgDrawer implements Drawer {
	parent :HTMLElement;
	size :Size;
	setting :VoronoiSetting;

	constructor(parent :HTMLElement, size :Size, setting :VoronoiSetting) {
		this.parent = parent;
		this.size = size;
		this.setting = setting;
	}

	clearAll() :void {
		let children = this.parent.childNodes;
		for (let i = children.length - 1; i >= 0; i --) {
			let node = children[i];
			this.parent.removeChild(node);
		}
	}
	drawSeed(seed :Point) :void {
		let circle = document.createElementNS('http://www.w3.org/2000/svg', "circle");
		circle.setAttribute("cx", ""+seed.x);
		circle.setAttribute("cy", ""+seed.y);
		circle.setAttribute("r", "2");
		circle.setAttribute("fill", "#000");
		this.parent.appendChild(circle);
	}
	drawScanLine(d :number) :void {
		let l = document.createElementNS('http://www.w3.org/2000/svg', "line");
		l.setAttribute("x1", "0");
		l.setAttribute("y1", ""+d);
		l.setAttribute("x2", ""+this.size.width);
		l.setAttribute("y2", ""+d);
		l.setAttribute("stroke", "#aaa");
		this.parent.appendChild(l);
	}
	drawNode(node :Node, depth :number) :void {
		let c1 = node.prev ? CCurve.curveCrosses(depth, node.prev.mPoint, node.mPoint) : null;
		let c2 = node.next ? CCurve.curveCrosses(depth, node.mPoint, node.next.mPoint) : null;
		let p1 = c1 ? node.prev.lr(c1) : { x: 0, y: 0 };
		let p2 = c2 ? node     .lr(c2) : { x: this.size.width, y: 0 };

		let curve = CCurve.create(node.mPoint);
		let sp = curve.tangentCross(depth, p1.x, p2.x);
		if (sp) {
			let f = curve.getF(depth)
			let x1 = p1.x;
			let y1 = f(x1);
			let x2 = p2.x;
			let y2 = f(x2);
			let path = document.createElementNS('http://www.w3.org/2000/svg', "path");
			path.setAttribute("d", `M ${x1} ${y1} Q ${sp.x} ${sp.y} ${x2} ${y2}`);
			path.setAttribute("stroke", "#aaa");
			path.setAttribute("fill", "#fff");
			this.parent.appendChild(path);
		}
	}
	drawMPoint(mPoint :MPoint) :void {
		if (! this.setting.isGiraffeMode) {
			let circle = document.createElementNS('http://www.w3.org/2000/svg', "circle");
			circle.setAttribute("cx", "" + mPoint.x);
			circle.setAttribute("cy", "" + mPoint.y);
			circle.setAttribute("r", "2");
			circle.setAttribute("fill", "#88f");
			this.parent.appendChild(circle);
		}
	}
	drawVoronoiLine(voronoiLine :VoronoiLineType) :void {
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
		let color = this.setting.isGiraffeMode ? "#ff8" : "#080";
		let width = this.setting.isGiraffeMode ? "10" : "1";
		let g = document.createElementNS('http://www.w3.org/2000/svg', "g");
		let l = document.createElementNS('http://www.w3.org/2000/svg', "line");
		l.setAttribute("x1", ""+line.p1.x);
		l.setAttribute("y1", ""+line.p1.y);
		l.setAttribute("x2", ""+line.p2.x);
		l.setAttribute("y2", ""+line.p2.y);
		l.setAttribute("stroke", color);
		l.setAttribute("stroke-width", width);
		g.appendChild(l);
		this.parent.appendChild(g);
	}
	drawVPoint(v :Point) {
		let circle = document.createElementNS('http://www.w3.org/2000/svg', "circle");
		circle.setAttribute("cx", ""+v.x);
		circle.setAttribute("cy", ""+v.y);
		circle.setAttribute("r", "2");
		circle.setAttribute("fill", "#400");
		this.parent.appendChild(circle);
	}
	sightEventDraw(newPoint :Point) :Draw {
		return () => {
			let line = document.createElementNS('http://www.w3.org/2000/svg', "line");
			line.setAttribute("x1", ""+newPoint.x);
			line.setAttribute("y1", ""+newPoint.y);
			line.setAttribute("x2", ""+newPoint.x);
			line.setAttribute("y2", ""+0);
			line.setAttribute("stroke", "#f00");
			this.parent.appendChild(line);
		};
	}
	circleEventDraw(c :Circle) :Draw {
		return () => {
			let circle = document.createElementNS('http://www.w3.org/2000/svg', "circle");
			circle.setAttribute("cx", ""+c.center.x);
			circle.setAttribute("cy", ""+c.center.y);
			circle.setAttribute("r", ""+c.r);
			circle.setAttribute("stroke", "#f88");
			circle.setAttribute("fill", "#fff");
			this.parent.appendChild(circle);
		}
	}
}
