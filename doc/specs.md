# Curve
focus (x, y)とdepth (y2)として表現する。
y==y2 なら半直線
y<y2 なら二次曲線

xaが与えられた場合、yaは以下になる

```
(x-xa)^2 + (y-ya)^2 = (y2-ya)^2
(x-xa)^2 + y^2 - 2*y*ya + ya^2 = y2^2 - 2*y2*ya + ya^2
(x-xa)^2 + y^2 - y2^2 = 2*y*ya - 2*y2*ya
(x-xa)^2 + y^2 - y2^2 = (2*y - 2*y2) * ya
⇒ ya = ((x-xa)^2 + y^2 - y2^2) / 2 / (y-y2)
```
