import { Point, Size, VoronoiSetting } from './types';
import jr from './JunkRack';
import Line from './Line';
import Curve from './Curve';
import Circle from './Circle';
import MPoint from './Voronoi/MPoint';
import Node from './Voronoi/bl/Node';
import Events from './Voronoi/bl/Events';
import BeachLine from './Voronoi/BeachLine';

interface View {
	logAppend(str :string) :void;
	logClear() :void;
	context() :CanvasRenderingContext2D;
	drawSeed(seed :Point[]) :void;
	clear() :void;
}

export default class InitController {
	view :View;
	setting :VoronoiSetting;
	seed :Point[] = [];
	beachLine :BeachLine;

	constructor(view :View) {
		this.view = view;
		this.setting = { isGiraffeMode: false };
	}
	addSeed(point :Point) :void {
		this.seed.push(point);
		this.view.drawSeed(this.seed);
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
		this.view.drawSeed(this.seed);
	}
	clearSeed() :void {
		this.seed = [];
		this.view.clear();
	}

	stepPixel(size :Size) :void {
		this.beachLine.stepPixel(size);
		this.beachLine.draw(this.view.context(), size, this.setting);
	}
	stepEvent(size :Size) :boolean {
		let done = this.beachLine.stepNextEvent(size)
		this.beachLine.draw(this.view.context(), size, this.setting);
		return done;
	}
	runAll(size :Size) :void {
		let done = this.stepEvent(size);
		this.beachLine.draw(this.view.context(), size, this.setting);

		if (!done) {
			setTimeout(() => { this.runAll(size); }, 1);
		}
	}
	skipAll(size :Size) :void {
		do {
		} while (!this.beachLine.stepNextEvent(size));
		this.beachLine.draw(this.view.context(), size, this.setting);
	}
	debugSeed(debugShow :(p:Point)=>string) :string {
		return this.seed.map(debugShow).join(",")
	}
	setGiraffeMode(val :boolean) :void {
		this.setting.isGiraffeMode = val;
	}
}
