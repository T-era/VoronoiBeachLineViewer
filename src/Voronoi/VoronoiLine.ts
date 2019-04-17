import { Point, Size, VoronoiSetting } from '../types';
import MPoint from './MPoint';
import Line from '../Line';

export default class VoronoiLine {
	mPoint1 :MPoint;
	mPoint2 :MPoint;
	another :MPoint;
	vPoint :Point;
	str :string;

	static Unclosed : { [key :string] :VoronoiLine } = {};
	static Closed :Line[] = [];

	constructor(mPoint1 :MPoint, mPoint2 :MPoint, vPoint :Point, another :MPoint) {
		this.mPoint1 = mPoint1;
		this.mPoint2 = mPoint2;
		this.vPoint = vPoint;
		this.another = another;
		this.str = createStrForKey(mPoint1, mPoint2);
	}
	toString() :string {
		return this.str;
	}
	static initialize() {
		VoronoiLine.Unclosed = {};
		VoronoiLine.Closed = [];
	}
	static add(mPoint1 :MPoint, mPoint2 :MPoint, vPoint :Point, another :MPoint) {
		let vLine = new VoronoiLine(mPoint1, mPoint2, vPoint, another);
		let uKey = vLine.toString();
		let registered = VoronoiLine.Unclosed[uKey];

		if (registered) {
			VoronoiLine.Closed.push(new Line(registered.vPoint, vPoint));
			delete VoronoiLine.Unclosed[uKey];
		} else {
			VoronoiLine.Unclosed[uKey] = vLine;
		}
	}
	static draw(context :CanvasRenderingContext2D, size :Size, setting :VoronoiSetting) :void {
		if (setting.isGiraffeMode) {
			context.lineWidth = 10;
			context.strokeStyle = "#ff8";
		} else {
			context.strokeStyle = "#080"
		}
		VoronoiLine.Closed.forEach((l) => {
			l.draw(context);
		});
		for (let key in VoronoiLine.Unclosed) {
			let vl = VoronoiLine.Unclosed[key];
			let l = Line.getBisector(vl.vPoint, vl.mPoint1, vl.mPoint2, vl.another, size);
			l.draw(context);
		}
	}
}

function createStrForKey(mPoint1 :MPoint, mPoint2 :MPoint) :string {
	if (mPoint1.x < mPoint2.x) {
		return toStringOrdered(mPoint1, mPoint2);
	} else if (mPoint2.x < mPoint1.x) {
		return toStringOrdered(mPoint2, mPoint1);
	} else if (mPoint1.y < mPoint2.y) {
		return toStringOrdered(mPoint1, mPoint2);
	} else {
		return toStringOrdered(mPoint2, mPoint1);
	}
}

function toStringOrdered(mPointA :MPoint, mPointB :MPoint) :string {
	return mPointA.toString() + "," + mPointB.toString();
}
