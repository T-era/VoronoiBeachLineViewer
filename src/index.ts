import jr from './JunkRack';
import Line from './Line';
import Curve from './Curve';
import Circle from './Circle';
import MPoint from './Voronoi/MPoint';
import Node from './Voronoi/bl/Node';
import Events from './Voronoi/bl/Events';
import BeachLine from './Voronoi/BeachLine';

$(function() {
	let cnv = $("#canvas");
	let canvas = cnv[0] as HTMLCanvasElement;
	// 表示上のサイズに合わせて、描画領域のサイズを設定。(円が丸っこく見えるように)
	canvas.height = canvas.width * canvas.offsetHeight / canvas.offsetWidth;

	let isInitMode = false;
	let seed = [];
	let beachLine :BeachLine;
	let setting = { isGiraffeMode: false };

	let context = canvas.getContext("2d");
	function context_clearAll() {
		context.clearRect(0,0,canvas.width, canvas.height);
	};
	setCommonEvents();
	initMode();

	function setCommonEvents() {
		cnv.mousemove(
			function(e) {
				let l = oToL(e, e.target);
				let str = jr.showPoint(l);
				$("#showPosition").val(str);
			});
		$("#eventButton").click(function() {
			beachLine.stepNextEvent(canvas);
			beachLine.draw(context, canvas, setting);
		});
		$("#pixelButton").click(function() {
			beachLine.stepPixel(canvas);
			beachLine.draw(context, canvas, setting);
		});
		$("#runButton").click(runAll);
		$("#runButton1").click(skipAll);
		$("#putRandom").click(function() {
			for (let i = 0; i < 10; i ++) {
				seed.push({
					x: Math.random() * canvas.width,
					y: Math.random() * canvas.height
				});
			}
			drawSeed();
		});
		$("#clearPoints").click(function() {
			seed.length = 0;
			context_clearAll();
		});
		$("#backToInit").click(initMode);
		$("#done").click(stepMode);
		$("#giraffeMode").click(setGiraffeMode);
		cnv.click(function(arg) {
			if (isInitMode) {
				let target = arg.target;
				let l = oToL(arg, target);
				seed.push(l);
				drawSeed();
			}
		});

		function drawSeed() {
			seed.forEach(function(p) {
				context.beginPath();
				context.strokeStyle = "#000";
				context.arc(p.x, p.y, 2, 0, 7);
				context.stroke();
			});
		}
		function runAll() {
			let done = beachLine.stepNextEvent(canvas);
			beachLine.draw(context, canvas, setting);

			if (!done) {
				setTimeout(runAll, 1);
			}
		}
		function skipAll() {
			do {
			} while (!beachLine.stepNextEvent(canvas));
			beachLine.draw(context, canvas, setting);
		}
		function setGiraffeMode(event) {
			let flg = event.target.checked;
			if (!flg) alert("マジで...!?");
			cnv.css({background: flg ? "#a80" : "#fff" });
			setting.isGiraffeMode = flg;
		}
	}

	function initMode() {
		isInitMode = true;
		logClear();

		$("#Initializer").show();
		$("#BeachLineControl").hide();
	}

	function stepMode() {
		isInitMode = false;
		$("#Initializer").hide();
		$("#BeachLineControl").show();

		beachLine = new BeachLine(seed, logAppend);
	}

	function logAppend(str) {
		$("#logView").val($("#logView").val() + str + "\n");
	}
	function logClear() {
		$("#logView").val("");
	}
	function oToL(p, target) {
		return {
			x: (p.clientX - target.getBoundingClientRect().left)
				* target.width / target.offsetWidth,
			y: (p.clientY - target.getBoundingClientRect().top)
				* target.height / target.offsetHeight
		};
	}
	/** デバッグ **/
	$("#exportPoints").click(function() {
		console.log(seed.map(show).join(","));
	});
	function show(p) {
		return "{x:" + p.x + ",y:" + p.y + "}"
	}
	/** /デバッグ **/
});
