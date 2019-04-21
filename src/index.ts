import { Point } from './types';
import jr from './JunkRack';
import Line from './Line';
import Curve from './Curve';
import Circle from './Circle';
import MPoint from './Voronoi/MPoint';
import Node from './Voronoi/bl/Node';
import Events from './Voronoi/bl/Events';
import BeachLine from './Voronoi/BeachLine';
import InitController from './controller';

interface EventPointer {
	clientX :number;
	clientY :number;
}
$(function() {
	let cnv = $("#canvas");
	let canvas = cnv[0] as HTMLCanvasElement;
	// 表示上のサイズに合わせて、描画領域のサイズを設定。(円が丸っこく見えるように)
	canvas.height = canvas.width * canvas.offsetHeight / canvas.offsetWidth;

	let isInitMode = false;

	let context :CanvasRenderingContext2D = canvas.getContext("2d");

	let view = {
		logAppend,
		logClear,
		context() { return context; },
		drawSeed,
		clear: context_clearAll
	};
	let controller = new InitController(view, canvas);
	function context_clearAll() :void {
		context.clearRect(0,0,canvas.width, canvas.height);
	};
	setCommonEvents();
	initMode();

	function setCommonEvents() :void {
		cnv.mousemove((e) => {
			let l = oToL(e, e.target as HTMLCanvasElement);
			let str = jr.showPoint(l);
			$("#showPosition").val(str);
		});
		$("#eventButton").click(() => {
			controller.stepEvent(canvas);
		});
		$("#pixelButton").click(() => {
			controller.stepPixel(canvas);
		});
		$("#runButton").click(runAll);
		$("#runButton1").click(skipAll);
		$("#putRandom").click(() => {
			controller.addRandomSeed(10, canvas);
		});
		$("#clearPoints").click(() => {
			controller.clearSeed();
		});
		$("#backToInit").click(initMode);
		$("#done").click(stepMode);
		$("#giraffeMode").click(setGiraffeMode);
		cnv.click((arg) => {
			if (isInitMode) {
				let target = arg.target;
				let l = oToL(arg, target as HTMLCanvasElement);
				controller.addSeed(l);
			}
		});
		function runAll() :void {
			controller.runAll(canvas);
		}
		function skipAll() :void {
			controller.skipAll(canvas);
		}
		function setGiraffeMode(event) :void {
			let flg = event.target.checked;
			if (!flg) alert("マジで...!?");
			cnv.css({background: flg ? "#a80" : "#fff" });
			controller.setGiraffeMode(flg);
		}
	}

	function drawSeed(seed :Point[]) :void {
		seed.forEach((p) => {
			context.beginPath();
			context.strokeStyle = "#000";
			context.arc(p.x, p.y, 2, 0, 7);
			context.stroke();
		});
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
			x: (p.clientX - target.getBoundingClientRect().left)
				* target.width / target.offsetWidth,
			y: (p.clientY - target.getBoundingClientRect().top)
				* target.height / target.offsetHeight
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
