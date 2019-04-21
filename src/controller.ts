import { Point, Size, VoronoiSetting } from './types';
import jr from './JunkRack';
import Line from './Line';
import Curve from './Curve';
import Circle from './Circle';
import MPoint from './Voronoi/MPoint';
import Node from './Voronoi/bl/Node';
import Events from './Voronoi/bl/Events';
import BeachLine from './Voronoi/BeachLine';
import Visualizer, { Drawer } from './Drawer';

interface Logger {
	logAppend(str :string) :void;
	logClear() :void;
}
interface Window { initialSeeds :Point[]|null; }
declare var window: Window;


export default class InitController {
	private logger :Logger;
	private seed :Point[] = window.initialSeeds || [];
	private beachLine :BeachLine;
	private drawer :Visualizer;
	private size :Size;

	constructor(drawer :Drawer, logger :Logger, worldSize :Size) {
		this.logger = logger;
		this.drawer = new Visualizer(drawer)
		this.size = worldSize;
	}
	addSeed(point :Point) :void {
		this.seed.push(point);
		this.drawer.clearAll();
		this.drawer.drawSeeds(this.seed);
	}
	initDrawing() {
		this.beachLine = new BeachLine(this.seed, this.logger.logAppend);
	}
	finishDrawing() {
		this.beachLine = null;
	}
	addRandomSeed(count :number) :void {
		for (let i = 0; i < count; i ++) {
			this.seed.push({
				x: Math.random() * this.size.width,
				y: Math.random() * this.size.height
			});
		}
		this.drawer.clearAll();
		this.drawer.drawSeeds(this.seed);
	}
	clearSeed() :void {
		this.seed = [];
		this.drawer.clearAll();
	}

	stepPixel() :void {
		this.drawer.clearAll();
		this.beachLine.stepPixel(this.size);
		this.drawer.drawBeachLine(this.beachLine);
	}
	stepEvent() :boolean {
		this.drawer.clearAll();
		let done = this.beachLine.stepNextEvent(this.size)
		this.drawer.drawBeachLine(this.beachLine);
		return done;
	}
	runAll() :void {
		let done = this.stepEvent();
		this.drawer.clearAll();
		this.drawer.drawBeachLine(this.beachLine);

		if (!done) {
			setTimeout(() => { this.runAll(); }, 1);
		}
	}
	skipAll() :void {
		do {
		} while (!this.beachLine.stepNextEvent(this.size));
		this.drawer.clearAll();
		this.drawer.drawBeachLine(this.beachLine);
	}
	debugSeed(debugShow :(p:Point)=>string) :string {
		return this.seed.map(debugShow).join(",")
	}
	setGiraffeMode(val :boolean) :void {
		this.drawer.setting().isGiraffeMode = val;
	}
}
