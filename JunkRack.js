function d_same(a, b) {
	return Math.abs(a-b) < 0.000001;
}

function dTo_2s(d) {
	var hect = d * 100;
	var len = Math.log(Math.abs(hect)) / Math.LN10 + (hect < 0 ? 3 : 2); // 切り上げ分と、符号
	var val = Math.round(d * 100) / 100 + 0.0001; // 小数点を出すために
	return (val.toString()).substr(0, len);
}
