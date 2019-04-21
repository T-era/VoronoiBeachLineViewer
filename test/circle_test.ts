import { equal } from 'assert';

import { shuffle } from './test_tools';
import Circle from '../src/Circle';

describe('Circle', () => {
	it('smoke', () => {
		let pu = { x: 0, y: -10 };
		let pb = { x: 0, y: 10 };
		let pl = { x: -10, y: 0 };
		let pr = { x: 10, y: 0 };

		for (let pList of [  // すべての組み合わせ
			[pu, pb, pl],
			[pu, pb, pr],
			[pu, pl, pb],
			[pu, pl, pr],
			[pu, pr, pb],
			[pu, pr, pl],
			[pb, pr, pl],
		]) {
			let actual = Circle.create(pList[0], pList[1], pList[2]);
			equal(0, actual.center.x);
			equal(0, actual.center.y);
			equal(10, actual.r);
		}
	});
	it('exceptional: 円を形成しない', ()=> {
		let pl = shuffle([{x:10, y:10}, {x:10, y:15}, {x:10, y:30}]);
		let actual = Circle.create(pl[0], pl[1], pl[2]);
		equal(null, actual);
	});
});
