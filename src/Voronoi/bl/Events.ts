import jr from '../../JunkRack';
import MPoint from '../MPoint';
import Node from './Node';
import BeachLine from '../BeachLine';
import { Drawer, Draw } from '../../Drawer';

export interface Event {
	eventBorder :number;
	action(topNode :Node|null):void;
	selectDraw(drawer :Drawer) :Draw;
	toString() :string;
}
export default {
	toCircleEvent(removing :Node, beachLine :BeachLine) :Event {
		let circle = removing.circle;
		return {
			eventBorder: circle.center.y + circle.r,
			action: function(topNode) {
				// 削除される場合、その中心はボロノイ点
				beachLine.addVPoint(removing.circle.center, removing.mPoint, removing.prev.mPoint, removing.next.mPoint);
				return removing.remove();
			},
			selectDraw(drawer :Drawer) :Draw {
				return drawer.circleEventDraw(circle);
			},
			toString: function() {
				return "Circle " + jr.showPoint(removing.circle.center);
			}
		};
	},
	toSightEvent(newPoint :MPoint, beachLine :BeachLine) :Event {
		return {
			eventBorder: newPoint.y,
			action: function(topNode) {
				if (topNode) {
					let ownerNode = topNode.seek((node) => {
						return node.containsRangeX(newPoint.x, newPoint.y);
					});
					ownerNode = ownerNode == null ? last(topNode) : ownerNode;
					let node = ownerNode.addChild(newPoint);
					return node.topNode();
				} else {
					return new Node(newPoint);
				}
				function last(node) {
					if (node.next) return last(node.next);
					else return node;
				}
			},
			selectDraw(drawer :Drawer) :Draw {
				return drawer.sightEventDraw(newPoint);
			},
			toString: function() {
				return "Sight " + jr.showPoint(newPoint);
			}
		};
	}
};
