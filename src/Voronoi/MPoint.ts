import { Point, Size, VoronoiSetting } from '../types';
import Line from '../Line';
import VoronoiLine from './VoronoiLine';

class Kvw {
	k:MPoint
	v:Point
	w:MPoint
}

export default class MPoint implements Point {
	x :number;
	y :number;
	private str :string;

	constructor(p :Point) {
		this.x = p.x;
		this.y = p.y;

		/// toString用(キーに使うため)
		this.str = this.x + "," + this.y;
	}

	/// (連想配列のキーに使うため)
	toString() :string {
		return this.str;
	}
}
