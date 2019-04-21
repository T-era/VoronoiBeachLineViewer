import jr from '../src/JunkRack';
import { Point } from '../src/types';
import Line from '../src/Line';

export function samePoint(p1 :Point, p2 :Point) :boolean {
	return jr.d_same(p1.x, p2.x)
		&& jr.d_same(p1.y, p2.y);
}
export function sameLine(l1 :Line, l2 :Line) {
	let a1 = (l1 as any);
	let a2 = (l2 as any);
	return (samePoint(a1.p1, a2.p1) && samePoint(a1.p2, a2.p2))
		|| (samePoint(a1.p1, a2.p2) && samePoint(a1.p2, a2.p1));
}

export function shuffle<T>(org :T[]) :T[] {
	for(let i = org.length - 1; i > 0; i--){
		let r = Math.floor(Math.random() * (i + 1));
		let tmp = org[i];
		org[i] = org[r];
		org[r] = tmp;
	}
	return org;
}
