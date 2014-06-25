(function() {
	/// 母点
	Voronoi.MPoint = function(p) {
		this.x = p.x;
		this.y = p.y;
		this.lonleyNeighbor = {};
		this.voronoiLines = [];

		/// toString用(キーに使うため)
		this.str = this.x + "," + this.y;
	};

	/// (連想配列のキーに使うため)
	Voronoi.MPoint.prototype.toString = function() {
		return this.str;
	};

	/// ボロノイ点を追加します。
	/// ボロノイ点を囲む残り2つの母点を受け取ります。
	Voronoi.MPoint.prototype.addVPoint = function(vPoint, buddy1, buddy2) {
		addImpl.call(this, buddy1, buddy2);
		addImpl.call(this, buddy2, buddy1);

		function addImpl(mp1, mp2) {
			var ln = this.lonleyNeighbor[mp1];
			if (ln) {
				var newVPoint = ln.v;
				this.voronoiLines.push(new Line(vPoint, newVPoint));
				delete this.lonleyNeighbor[mp1];
			} else {
				this.lonleyNeighbor[mp1] = { k: mp1, v: vPoint, w: mp2 };
			}
		}
	};

	/// MPointを囲むボロノイ領域が閉じていない場合、画面縁辺までの線分を追加して領域を(視覚的に)閉じます。
	/// このメソッドを処理途中で呼ぶと、正しくボロノイ図を計算できません。
	Voronoi.MPoint.prototype.finalize = function() {
		for (var str in this.lonleyNeighbor) {
			var mp = this.lonleyNeighbor[str].k;
			var vp = this.lonleyNeighbor[str].v;
			var another = this.lonleyNeighbor[str].w;
			var l = Line.getBisector(vp, this, mp, another);
			this.voronoiLines.push(l);
		}
	}

	Voronoi.MPoint.prototype.draw = function(context) {
		if (! Voronoi.MPoint.isGiraffeMode) {
			context.beginPath();
			context.strokeStyle = "#88f";
			context.arc(this.x, this.y, 2, 0, 7);
			context.stroke();
		}

		if (Voronoi.MPoint.isGiraffeMode) {
			context.lineWidth = 10;
			context.strokeStyle = "#ff0";
		} else {
			context.strokeStyle = "#080"
		}
		this.voronoiLines.forEach(function(l) {
			l.draw(context);
		});
		context.lineWidth = 1;
	};
})();

