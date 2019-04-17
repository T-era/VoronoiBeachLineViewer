import { Point } from './types';
import jr from './JunkRack';
import Line from './Line';
import Curve from './Curve';
import Circle from './Circle';
import MPoint from './Voronoi/MPoint';
import Node from './Voronoi/bl/Node';
import Events from './Voronoi/bl/Events';
import BeachLine from './Voronoi/BeachLine';

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
	let seed :Point[] = [];
	let beachLine :BeachLine;
	let setting = { isGiraffeMode: false };

	let context :CanvasRenderingContext2D = canvas.getContext("2d");
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
			beachLine.stepNextEvent(canvas);
			beachLine.draw(context, canvas, setting);
		});
		$("#pixelButton").click(() => {
			beachLine.stepPixel(canvas);
			beachLine.draw(context, canvas, setting);
		});
		$("#runButton").click(runAll);
		$("#runButton1").click(skipAll);
		$("#putRandom").click(() => {
			for (let i = 0; i < 10; i ++) {
				seed.push({
					x: Math.random() * canvas.width,
					y: Math.random() * canvas.height
				});
			}
			drawSeed();
		});
		$("#clearPoints").click(() => {
			seed.length = 0;
			context_clearAll();
		});
		$("#backToInit").click(initMode);
		$("#done").click(stepMode);
		$("#giraffeMode").click(setGiraffeMode);
		cnv.click((arg) => {
			if (isInitMode) {
				let target = arg.target;
				let l = oToL(arg, target as HTMLCanvasElement);
				seed.push(l);
				drawSeed();
			}
		});

		function drawSeed() :void {
			seed.forEach((p) => {
				context.beginPath();
				context.strokeStyle = "#000";
				context.arc(p.x, p.y, 2, 0, 7);
				context.stroke();
			});
		}
		function runAll() :void {
			let done = beachLine.stepNextEvent(canvas);
			beachLine.draw(context, canvas, setting);

			if (!done) {
				setTimeout(runAll, 1);
			}
		}
		function skipAll() :void {
			do {
			} while (!beachLine.stepNextEvent(canvas));
			beachLine.draw(context, canvas, setting);
		}
		function setGiraffeMode(event) :void {
			let flg = event.target.checked;
			if (!flg) alert("マジで...!?");
			cnv.css({background: flg ? "#a80" : "#fff" });
			setting.isGiraffeMode = flg;
		}
	}

	function initMode() :void {
		isInitMode = true;
		logClear();

		$("#Initializer").show();
		$("#BeachLineControl").hide();
	}

	function stepMode() :void {
		isInitMode = false;
		$("#Initializer").hide();
		$("#BeachLineControl").show();

		beachLine = new BeachLine(seed, logAppend);
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
		console.log(seed.map(debugShow).join(","));
	});
	function debugShow(p :Point) :string {
		return "{x:" + p.x + ",y:" + p.y + "}"
	}
	/** /デバッグ **/
});
