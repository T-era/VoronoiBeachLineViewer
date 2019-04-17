import jr from '../../JunkRack';
import MPoint from '../MPoint';
import Node from './Node';
import BeachLine from '../BeachLine';


export interface Event {
	eventBorder :number;
	action(topNode :Node|null):void;
	draw(context) :void;
	toString() :string;
}
export default {
	toCircleEvent(removing :Node, beachLine :BeachLine) :Event {
		var circle = removing.circle;
		return {
			eventBorder: circle.center.y + circle.r,
			action: function(topNode) {
				// 削除される場合、その中心はボロノイ点
				beachLine.addVPoint(removing.circle.center, removing.mPoint, removing.prev.mPoint, removing.next.mPoint);
				return removing.remove();
			},
			draw: function(context) {
				circle.draw(context);
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
					var ownerNode = topNode.seek(function(node) {
						return node.containsRangeX(newPoint.x, newPoint.y);
					});

					ownerNode = ownerNode == null ? last(topNode) : ownerNode;
					var node = ownerNode.addChild(newPoint);
					return node.topNode();
				} else {
					return new Node(newPoint);
				}
				function last(node) {
					if (node.next) return last(node.next);
					else return node;
				}
			},
			draw: function(context) {
				context.beginPath();
				context.strokeStyle = "#f00";
				context.moveTo(newPoint.x, newPoint.y);
				context.lineTo(newPoint.x, 0);
				context.stroke();
			},
			toString: function() {
				return "Sight " + jr.showPoint(newPoint);
			}
		};
	}
};