const ab = (a, b) => {
    return { a: a, b: b };
}

const xyab = (xa, xb, ya, yb) => {
    return { x: ab(xa, xb), y: ab(ya, yb) };
}

class Affine {
    constructor(a, b, c, d, e, f) {
        // Affine matrix
        // a, b, c
        // d, e, f
        // 0, 0, 1
        this.a = a;
        this.b = b;
        this.c = ab(c.a, c.b);
        this.d = d;
        this.e = e;
        this.f = ab(f.a, f.b);
    }

    static identity() {
        return new Affine(1, 0, ab(0, 0), 0, 1, ab(0, 0));
    }

    mul(m) {
        return new Affine(
            m.a * this.a + m.b * this.d,
            m.a * this.b + m.b * this.e,
            ab(m.a * this.c.a + m.b * this.f.a + m.c.a, m.a * this.c.b + m.b * this.f.b + m.c.b),
            m.d * this.a + m.e * this.d,
            m.d * this.b + m.e * this.e,
            ab(m.d * this.c.a + m.e * this.f.a + m.f.a, m.d * this.c.b + m.e * this.f.b + m.f.b),
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

    transition(x, y) {
        return new Affine(this.a, this.b, ab(this.c.a + x.a, this.c.b + x.b), this.d, this.e, ab(this.f.a + y.a, this.f.b + y.b));
    }

    static transition(x, y) {
        return new Affine(1, 0, ab(x.a, x.b), 0, 1, ab(y.a, y.b));
    }

    static transitionRot(x, y, i) {
        return this.transition(x, y).mul(this.rotation(i));
    }

    static rotTransition(i, x, y) {
        return this.rotation(i).mul(this.transition(x, y));
    }

    static transitionAdd(x1, y1, x2, y2) {
        return new Affine(1, 0, ab(x1.a + x2.a, x1.b + x2.b), 0, 1, ab(y1.a + y2.a, y1.b + y2.b));
    }

    static flip() {
        // flip matrix [1, 1, 0, -1]
        return this.rotation(3).mul(new Affine(1, 1, ab(0, 0), 0, -1, ab(0, 0)));
    }

    static rotation60() {
        return new Affine(0, -1, ab(0, 0), 1, 1, ab(0, 0));
    }

    static rotation(i) {
        i = (i % 6 + 6) % 6;
        if (i == 0) {
            return this.identity();
        } else {
            return this.rotation(i - 1).mul(this.rotation60());
        }
    }
}