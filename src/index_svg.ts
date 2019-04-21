import { Point, Size } from './types';
import jr from './JunkRack';
import Line from './Line';
import Curve from './Curve';
import Circle from './Circle';
import MPoint from './Voronoi/MPoint';
import Node from './Voronoi/bl/Node';
import Events from './Voronoi/bl/Events';
import BeachLine from './Voronoi/BeachLine';
import InitController from './controller';
import SvgDrawer from './drawer/SvgDrawer';

interface EventPointer {
	clientX :number;
	clientY :number;
}
$(function() {
	let svgs = $("#svg");

	let svg = svgs[0] as HTMLElement;
	let size :Size = svg.getBoundingClientRect();
	let viewport = `0 0 ${size.width} ${size.height}`;
	svg.setAttribute('viewport', viewport);
	let isInitMode = false;

	let logger = {
		logAppend,
		logClear,
	};
	let setting = { isGiraffeMode: false };
	let drawer = new SvgDrawer(svg, size, setting);
	let controller = new InitController(drawer, logger, size);
	setCommonEvents();
	initMode();

	function setCommonEvents() :void {
		svgs.mousemove((e) => {
			let l = oToL(e, e.target as HTMLCanvasElement);
			let str = jr.showPoint(l);
			$("#showPosition").val(str);
		});
		$("#eventButton").click(() => {
			controller.stepEvent();
		});
		$("#pixelButton").click(() => {
			controller.stepPixel();
		});
		$("#runButton").click(runAll);
		$("#runButton1").click(skipAll);
		$("#putRandom").click(() => {
			controller.addRandomSeed(10);
		});
		$("#clearPoints").click(() => {
			controller.clearSeed();
		});
		$("#backToInit").click(initMode);
		$("#done").click(stepMode);
		$("#giraffeMode").click(setGiraffeMode);
		svgs.click((arg) => {
			if (isInitMode) {
				let target = arg.target;
				let l = oToL(arg, target as HTMLCanvasElement);
				controller.addSeed(l);
			}
		});
		function runAll() :void {
			controller.runAll();
		}
		function skipAll() :void {
			controller.skipAll();
		}
		function setGiraffeMode(event) :void {
			let flg = event.target.checked;
			if (!flg) alert("マジで...!?");
			svgs.css({background: flg ? "#a80" : "#fff" });
			controller.setGiraffeMode(flg);
		}
	}

	function initMode() :void {
		isInitMode = true;
		logClear();

		$("#Initializer").show();
		$("#BeachLineControl").hide();
		controller.finishDrawing();
	}

	function stepMode() :void {
		isInitMode = false;
		$("#Initializer").hide();
		$("#BeachLineControl").show();

		controller.initDrawing();
	}

	function logAppend(str :string) :void {
		$("#logView").val($("#logView").val() + str + "\n");
	}
	function logClear() :void {
		$("#logView").val("");
	}
	function oToL(p :EventPointer, target :HTMLCanvasElement) :Point {
		return {
			x: p.clientX,
			y: p.clientY
			// x: (p.clientX - target.getBoundingClientRect().left)
			// 	* target.width / target.offsetWidth,
			// y: (p.clientY - target.getBoundingClientRect().top)
			// 	* target.height / target.offsetHeight
		};
	}
	/** デバッグ **/
	$("#exportPoints").click(() => {
		console.log(controller.debugSeed(debugShow));
	});
	function debugShow(p :Point) :string {
		return "{x:" + p.x + ",y:" + p.y + "}"
	}
	/** /デバッグ **/
});
