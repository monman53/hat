const ab = (a, b) => {
    return { a: a, b: b };
}

const xyab = (xa, xb, ya, yb) => {
    return { x: ab(xa, xb), y: ab(ya, yb) };
}

const vecMinus = (v) => {
    return xyab(-v.x.a, -v.x.b, -v.y.a, -v.y.b);
}

const vecSub = (v, w) => {
    return xyab(
        v.x.a - w.x.a,
        v.x.b - w.x.b,
        v.y.a - w.y.a,
        v.y.b - w.y.b
    );
}

class Affine {
    constructor(a = 1, b = 0, c = ab(0, 0), d = 0, e = 1, f = ab(0, 0)) {
        // Affine matrix
        // a, b, c
        // d, e, f
        // 0, 0, 1
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
    }

    static identity() {
        return new Affine();
    }

    mul(m) {
        return new Affine(
            this.a * m.a + this.b * m.d,
            this.a * m.b + this.b * m.e,
            ab(this.a * m.c.a + this.b * m.f.a + this.c.a, this.a * m.c.b + this.b * m.f.b + this.c.b),
            this.d * m.a + this.e * m.d,
            this.d * m.b + this.e * m.e,
            ab(this.d * m.c.a + this.e * m.f.a + this.f.a, this.d * m.c.b + this.e * m.f.b + this.f.b),
        );
    }

    static mul(m, n) {
        return new Affine(
            m.a * n.a + m.b * n.d,
            m.a * n.b + m.b * n.e,
            ab(m.a * n.c.a + m.b * n.f.a + m.c.a, m.a * n.c.b + m.b * n.f.b + m.c.b),
            m.d * n.a + m.e * n.d,
            m.d * n.b + m.e * n.e,
            ab(m.d * n.c.a + m.e * n.f.a + m.f.a, m.d * n.c.b + m.e * n.f.b + m.f.b),
        );
    }

    mulVec(v) {
        return xyab(
            this.a * v.x.a + this.b * v.y.a + this.c.a,
            this.a * v.x.b + this.b * v.y.b + this.c.b,
            this.d * v.x.a + this.e * v.y.a + this.f.a,
            this.d * v.x.b + this.e * v.y.b + this.f.b,
        );
    }

    transition(v) {
        return new Affine(
            this.a, this.b, ab(this.a * v.x.a + this.b * v.y.a + this.c.a, this.a * v.x.b + this.b * v.y.b + this.c.b),
            this.d, this.e, ab(this.d * v.x.a + this.e * v.y.a + this.f.a, this.d * v.x.b + this.e * v.y.b + this.f.b)
        );
    }

    static transition(v) {
        return new Affine(1, 0, v.x, 0, 1, v.y);
    }

    static rotTransition(i, v) {
        return this.transition(v).mul(this.rotation(i));
    }

    static flip() {
        // flip matrix [1, 1, 0, -1]
        // TODO: remove rotation and use direct affine
        return (new Affine(1, 1, ab(0, 0), 0, -1, ab(0, 0))).mul(this.rotation(3));
    }

    static rotation60() {
        return new Affine(0, -1, ab(0, 0), 1, 1, ab(0, 0));
    }

    static rotation(i) {
        i = (i % 6 + 6) % 6;
        if (i == 0) {
            return this.identity();
        } else {
            return this.rotation60().mul(this.rotation(i - 1));
        }
    }

    rotation(i) {
        return this.mul(Affine.rotation(i));
    }

    static relativeRotation(v, r) {
        return Affine.transition(v).rotation(r).transition(xyab(-v.x.a, -v.x.b, -v.y.a, -v.y.b));
    }
}