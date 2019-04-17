import { Point, Size, VoronoiSetting } from '../types';
import Line from '../Line';

class Kvw {
	k:MPoint
	v:Point
	w:MPoint
}

export default class MPoint implements Point {
	x :number;
	y :number;
	str :string;
	lonleyNeighbor : { [key :string] :Kvw };
	voronoiLines :Line[];

	constructor(p :Point) {
		this.x = p.x;
		this.y = p.y;
		this.lonleyNeighbor = {};
		this.voronoiLines = [];

		/// toString用(キーに使うため)
		this.str = this.x + "," + this.y;
	};

	/// (連想配列のキーに使うため)
	toString() :string {
		return this.str;
	};

	/// ボロノイ点を追加します。
	/// ボロノイ点を囲む残り2つの母点を受け取ります。
	addVPoint(vPoint :Point, buddy1 :MPoint, buddy2 :MPoint) :void {
		addImpl.call(this, buddy1, buddy2);
		addImpl.call(this, buddy2, buddy1);

		function addImpl(mp1, mp2) {
			let ln = this.lonleyNeighbor[mp1];
			if (ln) {
				let newVPoint = ln.v;
				this.voronoiLines.push(new Line(vPoint, newVPoint));
				delete this.lonleyNeighbor[mp1];
			} else {
				this.lonleyNeighbor[mp1] = { k: mp1, v: vPoint, w: mp2 };
			}
		}
	};

	/// MPointを囲むボロノイ領域が閉じていない場合、画面縁辺までの線分を追加して領域を(視覚的に)閉じます。
	/// このメソッドを処理途中で呼ぶと、正しくボロノイ図を計算できません。
	finalize(size :Size) :void {
		for (let str in this.lonleyNeighbor) {
			let mp = this.lonleyNeighbor[str].k;
			let vp = this.lonleyNeighbor[str].v;
			let another = this.lonleyNeighbor[str].w;
			let l = Line.getBisector(vp, this, mp, another, size);
			this.voronoiLines.push(l);
		}
	}

	draw(context, setting :VoronoiSetting) :void {
		if (! setting.isGiraffeMode) {
			context.beginPath();
			context.strokeStyle = "#88f";
			context.arc(this.x, this.y, 2, 0, 7);
			context.stroke();
		}

		if (setting.isGiraffeMode) {
			context.lineWidth = 10;
			context.strokeStyle = "#ff8";
		} else {
			context.strokeStyle = "#080"
		}
		this.voronoiLines.forEach(function(l) {
			l.draw(context);
		});
		context.lineWidth = 1;
	};
}
