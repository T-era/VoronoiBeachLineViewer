# 特異な計算のメモ
　Fortune走査法の実装上特異な点のメモ
## 一般的な算術
　二次曲線の交点は、一般的には2点存在する。
　Sightイベントは、走査線上に新たな母点を"発見"して、元のFortuneに対して新たな曲線が加わること。この時新たな曲線は元のFortuneに2つの交点で交わる。
　Circleイベントは、母点3つからなる円周の下端に走査線が接したタイミング。このタイミングで二次曲線の一つが(両隣の曲線が接することで)区間として消滅する。

## 特異点1: 開始時点
　最初のSightイベントでは、『元のFortune』が存在しないため、特異になる。
　特に最初のSightイベントで同じ高さ母点が複数あると、Sightイベントのタイミングでは、Fortuneはひとつながりの曲線ではなく、離れた複数の平行な半直線を形成する。
　走査線が進むと、その交点は(2点ではなく)1点になる。

## 特異点2: Sightイベントと同時にCircleイベント
　母点XでSightイベントが発生した時、その母点XがFortuneの二次曲線の交点の真下に位置していると、Sightイベントに引き続いて即Circleイベントが発生する。
