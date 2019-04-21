import { Point, Size, VoronoiSetting } from './types';
import jr from './JunkRack';
import Line from './Line';
import Curve from './Curve';
import Circle from './Circle';
import MPoint from './Voronoi/MPoint';
import Node from './Voronoi/bl/Node';
import Events from './Voronoi/bl/Events';
import BeachLine from './Voronoi/BeachLine';
import Visualizer, { Context2DDrawer } from './Drawer';

interface View {
	logAppend(str :string) :void;
	logClear() :void;
	context() :CanvasRenderingContext2D;
	drawSeed(seed :Point[]) :void;
	clear() :void;
}
interface Window { initialSeeds :Point[]|null; }
declare var window: Window;


export default class InitController {
	private view :View;
	private setting :VoronoiSetting;
	private seed :Point[] = window.initialSeeds || [];
	private beachLine :BeachLine;
	drawer :Visualizer;

	constructor(view :View, worldSize :Size) {
		this.view = view;
		this.setting = { isGiraffeMode: false };
		this.drawer = new Visualizer(new Context2DDrawer(view.context(), worldSize, this.setting))

	}
	addSeed(point :Point) :void {
		this.seed.push(point);
		this.drawer.drawSeeds(this.seed);
	}
	initDrawing() {
		this.beachLine = new BeachLine(this.seed, this.view.logAppend);
	}
	finishDrawing() {
		this.beachLine = null;
	}
	addRandomSeed(count :number, size :Size) :void {
		for (let i = 0; i < count; i ++) {
			this.seed.push({
				x: Math.random() * size.width,
				y: Math.random() * size.height
			});
		}
		this.drawer.drawSeeds(this.seed);
	}
	clearSeed() :void {
		this.seed = [];
		this.drawer.clearAll();
	}

	stepPixel(size :Size) :void {
		this.beachLine.stepPixel(size);
		this.drawer.drawBeachLine(this.beachLine);
	}
	stepEvent(size :Size) :boolean {
		let done = this.beachLine.stepNextEvent(size)
		this.drawer.drawBeachLine(this.beachLine);
		return done;
	}
	runAll(size :Size) :void {
		let done = this.stepEvent(size);
		this.drawer.drawBeachLine(this.beachLine);

		if (!done) {
			setTimeout(() => { this.runAll(size); }, 1);
		}
	}
	skipAll(size :Size) :void {
		do {
		} while (!this.beachLine.stepNextEvent(size));
		this.drawer.drawBeachLine(this.beachLine);
	}
	debugSeed(debugShow :(p:Point)=>string) :string {
		return this.seed.map(debugShow).join(",")
	}
	setGiraffeMode(val :boolean) :void {
		this.setting.isGiraffeMode = val;
	}
}
