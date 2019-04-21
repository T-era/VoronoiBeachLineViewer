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
	private drawer :Drawer;

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
	setting() {
		return this.drawer.setting;
	}
}

export interface Drawer {
	setting :VoronoiSetting;
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
