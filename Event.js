function toCircleEvent(removing, voronoiPoints) {
	var circle = removing.circle;
	return {
		eventBorder: circle.center.y + circle.r,
		action: function(topNode) {
			// 削除される場合、その中心はボロノイ点
			voronoiPoints.push(removing.circle.center);
			return removing.remove();
		},
		center: circle.center,
		draw: function(context) {
			circle.draw(context);
		}
	};
}
function toSightEvent(newPoint, voronoiPoints, size) {
	return {
		eventBorder: newPoint.y,
		action: function(topNode) {
			if (topNode) {
				for (var temp = topNode; temp; temp = temp.next) {
					if (temp.isXOn(newPoint.x, newPoint.y, {
						whenContains: function() {
							temp.addChild(newPoint);
						},
						whenJustEdge: function() {
							// レアケース:newPointがちょうど交点の真下(xが一致する位置)にある場合
							// 同時にボロノイ点追加。
							voronoiPoints.push(createCircle(newPoint,temp.mPoint,temp.next.mPoint).center);
							temp.addBetweenNext(newPoint);
							delete temp.next.circleEventDepth;// ボロノイ点処理済み
						}
					})) {
						return temp.topNode();
					}
				}
				throw "??";
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
		}
	};
}
