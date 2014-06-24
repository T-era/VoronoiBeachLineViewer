function toCircleEvent(removing, voronoiPoints) {
	var circle = removing.circle;
	return {
		eventBorder: circle.center.y + circle.r,
		action: function(topNode) {
			// 削除される場合、その中心はボロノイ点
			voronoiPoints.addVPoint(removing.circle.center, removing.mPoint, removing.prev.mPoint, removing.next.mPoint);
			return removing.remove();
		},
		center: circle.center,
		draw: function(context) {
			circle.draw(context);
		},
		toString: function() {
			return "Circle " + showPoint(removing.circle.center);
		}
	};
}
function toSightEvent(newPoint, voronoiPoints, size) {
	return {
		eventBorder: newPoint.y,
		action: function(topNode) {
			if (topNode) {
				var ownerNode = topNode.seek(function(node) {
					return node.containsRangeX(newPoint.x, newPoint.y);
				});
				var node = ownerNode.addChild(newPoint);
				return node.topNode();
			} else {
				return new BeachLineNode(newPoint, size);
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
			return "Sight " + showPoint(newPoint);
		}
	};
}
