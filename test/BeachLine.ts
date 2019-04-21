import { equal } from 'assert';

import { shuffle } from './test_tools';
import BeachLine from '../src/Voronoi/BeachLine';
import VoronoiLine from '../src/Voronoi/VoronoiLine';

describe('BeachLine', () => {
	it('サイトイベントの直上に、両隣の交点があるケース VoronoiTest.htmlで視覚的に確認', () => {
		VoronoiLine.initialize();
		let beachLine = new BeachLine(shuffle([
			{x:790.7278306309031,y:202.64509588996643},
			{x:695.4916914489797,y:173.73006395895248},
			{x:732.5084914267239,y:284.31160630977445}, // 交点の真下でサイトイベントが起きたら、曲線の追加を行いつつサークルイベントを起こす必要がある
		]), (str)=>{});
		let size = { width: 800, height: 300 };

		while(! beachLine.stepNextEvent(size)) {} // すべてのイベントを消化
		equal(0, (VoronoiLine as any).Closed.length);
		equal(3, Object.keys((VoronoiLine as any).Unclosed).length);
	});
	it('市松模様の母点(端のボロノイ線が消えてしまったバグの修正) VoronoTeset.htmlで視覚的に確認', () => {
		VoronoiLine.initialize();
		let beachLine = new BeachLine(shuffle([{x:80,y:80},{x:160,y:80},{x:240,y:80},{x:320,y:80}
			,{x:40,y:120},{x:120,y:120},{x:200,y:120},{x:280,y:120},{x:360,y:120}
			,{x:80,y:160},{x:160,y:160},{x:240,y:160},{x:320,y:160}
			,{x:40,y:200},{x:120,y:200},{x:200,y:200},{x:280,y:200},{x:360,y:200}
			,{x:80,y:240},{x:160,y:240},{x:240,y:240},{x:320,y:240}
		]), (str)=>{});
		let size = { width: 360, height: 300 };

		while(! beachLine.stepNextEvent(size)) {} // すべてのイベントを消化
		equal(39, (VoronoiLine as any).Closed.length);
		equal(12, Object.keys((VoronoiLine as any).Unclosed).length);
	});
});
