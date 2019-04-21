import { Point } from './types';

/// 小物入れ
export default {
	/// 浮動小数値の一致比較をします。計算誤差を吸収するための誤差閾値を指定できます。
	/// 誤差閾値を省略した場合はデフォルトで0.0001とします。
	d_same(a :number, b :number, border = 0.0001) :boolean {
		return Math.abs(a-b) < border;
	},
	/// 浮動小数値を、デバッグのため固定長文字列に整形します。
	dTo_2s(d :number) :string {
		let sign = (d < 0 ? "-" : "");
		let abs = Math.abs(d);
		let op = Math.floor(abs);
		let up = Math.floor(abs * 100 % 100);
		let len = Math.log(abs) / Math.LN10 + (abs < 1 ? 2 : 3);
		return ("      " + sign + String(op)).substr(-7, 7) + "." + ("00" + String(up)).substr(-2, 3);
	},
	/// 受け取ったリストから重複する要素を除外し、新しいリストにして返します。
	uniqueList<S>(arg :S[], fIsSame :(a1:S,a2:S)=>boolean) {
		let temp = [];
		for (let i = 0, iMax = arg.length; i < iMax; i ++) {
			let target = arg[i];
			let hasSame = false;
			for (let j = i + 1, jMax = arg.length; j < jMax; j ++) {
				if (fIsSame(target, arg[j])) {
					hasSame = true;
					break;
				}
			}
			if (! hasSame) temp.push(target);
		}
		return temp;
	},
	showPoint(p :Point) :string {
		return "(" + this.dTo_2s(p.x) + ", " + this.dTo_2s(p.y) + ")";
	}
}
