class Affine {
    constructor(a, b, c, d, e, f) {
        // Affine matrix
        // a, b, c
        // d, e, f
        // 0, 0, 1
        this.a = a;
        this.b = b;
        this.c = { a: c.a, b: c.b };
        this.d = d;
        this.e = e;
        this.f = { a: f.a, b: f.b };
    }

    static identity() {
        return new Affine(1, 0, { a: 0, b: 0 }, 0, 1, { a: 0, b: 0 });
    }

    mul(m) {
        return new Affine(
            m.a * this.a + m.b * this.d,
            m.a * this.b + m.b * this.e,
            { a: m.a * this.c.a + m.b * this.f.a + m.c.a, b: m.a * this.c.b + m.b * this.f.b + m.c.b },
            m.d * this.a + m.e * this.d,
            m.d * this.b + m.e * this.e,
            { a: m.d * this.c.a + m.e * this.f.a + m.f.a, b: m.d * this.c.b + m.e * this.f.b + m.f.b },
        );
    }

    static mul(m, n) {
        return new Affine(
            m.a * n.a + m.b * n.d,
            m.a * n.b + m.b * n.e,
            { a: m.a * n.c.a + m.b * n.f.a + m.c.a, b: m.a * n.c.b + m.b * n.f.b + m.c.b },
            m.d * n.a + m.e * n.d,
            m.d * n.b + m.e * n.e,
            { a: m.d * n.c.a + m.e * n.f.a + m.f.a, b: m.d * n.c.b + m.e * n.f.b + m.f.b },
        );
    }

    mulVec(v) {
        return {
            x: {
                a: this.a * v.x.a + this.b * v.y.a + this.c.a,
                b: this.a * v.x.b + this.b * v.y.b + this.c.b,
            },
            y: {
                a: this.d * v.x.a + this.e * v.y.a + this.f.a,
                b: this.d * v.x.b + this.e * v.y.b + this.f.b,
            },
        };
    }

    transition(x, y) {
        return new Affine(this.a, this.b, { a: this.c.a + x.a, b: this.c.b + x.b }, this.d, this.e, { a: this.f.a + y.a, b: this.f.b + y.b });
    }

    static transition(x, y) {
        return new Affine(1, 0, { a: x.a, b: x.b }, 0, 1, { a: y.a, b: y.b });
    }

    static transitionRot(x, y, i) {
        return this.transition(x, y).mul(this.rotation(i));
    }

    static rotTransition(i, x, y) {
        return this.rotation(i).mul(this.transition(x, y));
    }

    static transitionAdd(x1, y1, x2, y2) {
        return new Affine(1, 0, { a: x1.a + x2.a, b: x1.b + x2.b }, 0, 1, { a: y1.a + y2.a, b: y1.b + y2.b });
    }

    // flip() {
    //     const a = this.a;
    //     const b = this.b;
    //     const c = this.c;
    //     const d = this.d;
    //     const e = this.e;
    //     const f = this.f;
    //     return new Affine(a + d, b + e, { a: c.a + f.a, b: c.b + f.b }, -d, -e, { a: -f.a, b: -f.b });
    // }

    static flip() {
        // flip matrix [1, 1, 0, -1]
        return this.rotation(3).mul(new Affine(1, 1, { a: 0, b: 0 }, 0, -1, { a: 0, b: 0 }));
    }

    static rotation60() {
        return new Affine(0, -1, { a: 0, b: 0 }, 1, 1, { a: 0, b: 0 });
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