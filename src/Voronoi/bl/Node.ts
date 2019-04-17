import jr from '../../JunkRack';
import { Point, Size } from '../../types';
import MPoint from '../MPoint';
import Circle from '../../Circle';
import CCurve, { Curv, CrossPoints } from '../../Curve';

type Flr = (cp :CrossPoints)=>Point;
type NodeSeek = (arg :Node)=>boolean;

export default class Node {
	mPoint :MPoint;
	prev :Node|null;
	next :Node|null;
	circle :Circle|null;
	circleEventDepth :number|null;
	lr :Flr;

	constructor(motherPoint :MPoint) {
		this.mPoint = motherPoint;
		this.prev = null;
		this.next = null;
	}
	computeCircle() :void {
		if (this.prev && this.next) {
			var circle = Circle.create(this.mPoint, this.prev.mPoint, this.next.mPoint);
			this.circle = circle;
			if (circle) {
				this.circleEventDepth = circle.center.y + circle.r;
			} else {
				delete this.circleEventDepth;
			}
		}
	}

	willClose() :boolean {
		if (this.circleEventDepth === undefined) {
			return false;
		} else if (jr.d_same(this.circleEventDepth, this.mPoint.y)) {
			// 交点直下でSightイベントが発生する場合への対処。
			return false;
		} else if (this.prev && this.next) {
			let c1 = CCurve.curveCrosses(this.circleEventDepth, this.mPoint, this.prev.mPoint);
			let c2 = CCurve.curveCrosses(this.circleEventDepth, this.mPoint, this.next.mPoint);
			let pl = this.prev.lr(c1);
			let pr = this.     lr(c2);

			return jr.d_same(pl.y, pr.y)
				&& jr.d_same(pl.x, pr.x);
		} else {
			return false;
		}
	}

	containsRangeX(x :number, depth :number) :boolean {
		if (this.prev && this.next) {
			let p1 = this.prev.lr(CCurve.curveCrosses(depth, this.mPoint, this.prev.mPoint));
			let p2 = this     .lr(CCurve.curveCrosses(depth, this.mPoint, this.next.mPoint));

			return p1 && p2
				&& p1.x <= x
				&& x < p2.x;
		} else if (this.next) {
			let p2 = this     .lr(CCurve.curveCrosses(depth, this.mPoint, this.next.mPoint));
			return p2
				&& x < p2.x;
		} else if (this.prev) {
			let p1 = this.prev.lr(CCurve.curveCrosses(depth, this.mPoint, this.prev.mPoint));
			return p1
				&& p1.x <= x;
		} else {
			return true;
		}
	};
	setNext(node :Node, fLR :Flr) :void {
		this.next = node;
		this.lr = fLR;
		if (node) {
			node.prev = this;
		}
	};
	addChild(newPoint :MPoint) :Node {

		// 交点が一つしかないケース/交点が2つあるケース。
		var twoCross = (newPoint.y !== this.mPoint.y);
		var oldNext = this.next;
		var firstHalf = this;
		var oldLR = this.lr;
		var newNode = new Node(newPoint);
		firstHalf.setNext(newNode, function(c) { return c == null ? null : c.left; });
		if (twoCross) {
			var secondHalf = new Node(this.mPoint);
			newNode.setNext(secondHalf, function(c) { return c.right; });
			secondHalf.setNext(oldNext, oldLR);
			secondHalf.computeCircle();
		}
		firstHalf.computeCircle();
		newNode.computeCircle();
		if (oldNext) oldNext.computeCircle();

		return firstHalf;
	};

	remove() :Node {
		// 要素を削除(LinkedListを切り詰める)
		// LRを引き継ぐ。 深い方のLRを設定。
		var lr = this.prev.mPoint.y > this.next.mPoint.y
				? this.prev.lr
				: this.     lr;

		this.prev.next = this.next;
		this.prev.lr = lr;

		this.next.prev = this.prev;
		this.prev.computeCircle();
		if (this.next) this.next.computeCircle();
		return this.topNode();
	};

	// コレクション操作
	seek(f :NodeSeek) :Node|null {
		for (var temp :Node = this; temp; temp = temp.next) {
			if (f(temp)) {
				return temp;
			}
		}
		return null;
	}

	addToList(list :Node[]) :void {
		for (var temp :Node = this; temp; temp = temp.next) {
			list.push(temp);
		}
	};
	topNode() :Node {
		for (var temp :Node = this; ; temp = temp.prev) {
			if (! temp.prev) {
				return temp;
			}
		}
	};
	forEachNode(f :(a:Node)=>void) :void {
		for (let temp :Node = this; temp; temp = temp.next) {
			f(temp);
		}
	};

	draw(context, depth :number, size :Size) :void {
		let c1 = this.prev ? CCurve.curveCrosses(depth, this.prev.mPoint, this.mPoint) : null;
		let c2 = this.next ? CCurve.curveCrosses(depth, this.mPoint, this.next.mPoint) : null;
		let p1 = c1 ? this.prev.lr(c1) : { x: 0, y: 0 };
		let p2 = c2 ? this     .lr(c2) : { x: size.width, y: 0 };

		context.strokeStyle = "#aaa";
		let curve = CCurve.create(this.mPoint);
		curve.draw(context, depth, Math.max(p1.x, 0), Math.min(p2.x, size.width));
	}
}
