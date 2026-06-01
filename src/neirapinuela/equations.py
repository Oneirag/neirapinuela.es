"""Banco curado de 22 ecuaciones de primer grado, en 3 bloques de dificultad.

Cada ecuacion expone los pasos canonicos del "metodo unico" para que el
nino los vaya completando uno a uno. Los `expected` se almacenan como
expresiones SymPy (o tuplas (lhs, rhs)) para que la validacion servidor
pueda aceptar formas equivalentes (e.g. 4/6 == 2/3).
"""

from sympy import Symbol, Rational, sympify

x = Symbol("x")


def E(lhs, rhs):
    """Construye una ecuacion simbolica como tupla (lhs, rhs)."""
    return (sympify(lhs), sympify(rhs))


def V(val):
    """Construye un valor simbolico (para el paso de solucion)."""
    return sympify(val)


EQUATIONS = [
    # =====================================================================
    # BLOQUE 1 — solo quitar denominadores (sin parentesis)
    # =====================================================================
    {
        "id": 1,
        "block": 1,
        "statement": "x/2 + 3 = 5",
        "tip": "Multiplica TODA la ecuacion por el m.c.m.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 2,
                "hint_fail": "Cuenta los denominadores que ves (2).",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar por el m.c.m.",
                "kind": "equation",
                "expected": E(x + 6, 10),
                "expected_pretty": "x + 6 = 10",
                "hint_fail": "Multiplica cada termino por el m.c.m.",
            },
            {
                "key": "x_isolated",
                "label": "3) Pasa los numeros al otro lado",
                "kind": "equation",
                "expected": E(x, 4),
                "expected_pretty": "x = 4",
                "hint_fail": "Resta 6 a ambos lados.",
            },
            {
                "key": "solution",
                "label": "4) Solucion:  x =",
                "kind": "value",
                "expected": V(4),
                "expected_pretty": "4",
                "hint_fail": "x ya esta despejada, escribe solo el numero.",
            },
        ],
        "full_solution": [
            "m.c.m.(2) = 2",
            "2·(x/2) + 2·3 = 2·5   →   x + 6 = 10",
            "x + 6 − 6 = 10 − 6   →   x = 4",
        ],
    },
    {
        "id": 2,
        "block": 1,
        "statement": "x/3 − 1 = 2",
        "tip": "Multiplica TODA la ecuacion por el m.c.m.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 3,
                "hint_fail": "El unico denominador es 3.",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar por el m.c.m.",
                "kind": "equation",
                "expected": E(x - 3, 6),
                "expected_pretty": "x − 3 = 6",
                "hint_fail": "Multiplica cada termino por el m.c.m.",
            },
            {
                "key": "x_isolated",
                "label": "3) Pasa los numeros al otro lado",
                "kind": "equation",
                "expected": E(x, 9),
                "expected_pretty": "x = 9",
                "hint_fail": "Suma 3 a ambos lados.",
            },
            {
                "key": "solution",
                "label": "4) Solucion:  x =",
                "kind": "value",
                "expected": V(9),
                "expected_pretty": "9",
                "hint_fail": "x ya esta despejada, escribe solo el numero.",
            },
        ],
        "full_solution": [
            "m.c.m.(3) = 3",
            "3·(x/3) − 3·1 = 3·2   →   x − 3 = 6",
            "x − 3 + 3 = 6 + 3   →   x = 9",
        ],
    },
    {
        "id": 3,
        "block": 1,
        "statement": "2x/5 = 4",
        "tip": "Multiplica TODA la ecuacion por el m.c.m.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 5,
                "hint_fail": "El denominador es 5.",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar por el m.c.m.",
                "kind": "equation",
                "expected": E(2 * x, 20),
                "expected_pretty": "2x = 20",
                "hint_fail": "Multiplica cada termino por el m.c.m.",
            },
            {
                "key": "solution",
                "label": "3) Solucion:  x =",
                "kind": "value",
                "expected": V(10),
                "expected_pretty": "10",
                "hint_fail": "x esta multiplicada por 2. Divide ambos lados entre 2.",
            },
        ],
        "full_solution": [
            "m.c.m.(5) = 5",
            "5·(2x/5) = 5·4   →   2x = 20",
            "x = 20 / 2 = 10",
        ],
    },
    {
        "id": 4,
        "block": 1,
        "statement": "x/4 + x/2 = 3",
        "tip": "Suma los terminos con x despues de quitar denominadores.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 4,
                "hint_fail": "Los denominadores son 4 y 2. ¿Cual los divide a los dos?",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar por el m.c.m.",
                "kind": "equation",
                "expected": E(x + 2 * x, 12),
                "expected_pretty": "x + 2x = 12",
                "hint_fail": "Multiplica cada termino por 4.",
            },
            {
                "key": "reduced",
                "label": "3) Reduce los terminos con x",
                "kind": "equation",
                "expected": E(3 * x, 12),
                "expected_pretty": "3x = 12",
                "hint_fail": "x + 2x = 3x. Combina los terminos con x.",
            },
            {
                "key": "solution",
                "label": "4) Solucion:  x =",
                "kind": "value",
                "expected": V(4),
                "expected_pretty": "4",
                "hint_fail": "x esta multiplicada por 3. Divide ambos lados entre 3.",
            },
        ],
        "full_solution": [
            "m.c.m.(4, 2) = 4",
            "4·(x/4) + 4·(x/2) = 4·3   →   x + 2x = 12",
            "3x = 12",
            "x = 12 / 3 = 4",
        ],
    },
    {
        "id": 5,
        "block": 1,
        "statement": "x/6 + 1 = 3",
        "tip": "Multiplica TODA la ecuacion por el m.c.m.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 6,
                "hint_fail": "El unico denominador es 6.",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar por el m.c.m.",
                "kind": "equation",
                "expected": E(x + 6, 18),
                "expected_pretty": "x + 6 = 18",
                "hint_fail": "Multiplica cada termino por 6.",
            },
            {
                "key": "x_isolated",
                "label": "3) Pasa los numeros al otro lado",
                "kind": "equation",
                "expected": E(x, 12),
                "expected_pretty": "x = 12",
                "hint_fail": "Resta 6 a ambos lados.",
            },
            {
                "key": "solution",
                "label": "4) Solucion:  x =",
                "kind": "value",
                "expected": V(12),
                "expected_pretty": "12",
                "hint_fail": "x ya esta despejada, escribe solo el numero.",
            },
        ],
        "full_solution": [
            "m.c.m.(6) = 6",
            "6·(x/6) + 6·1 = 6·3   →   x + 6 = 18",
            "x = 18 − 6 = 12",
        ],
    },
    {
        "id": 6,
        "block": 1,
        "statement": "3x/2 − 1 = 5",
        "tip": "Multiplica TODA la ecuacion por el m.c.m.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 2,
                "hint_fail": "El denominador es 2.",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar por el m.c.m.",
                "kind": "equation",
                "expected": E(3 * x - 2, 10),
                "expected_pretty": "3x − 2 = 10",
                "hint_fail": "Multiplica cada termino por 2.",
            },
            {
                "key": "x_isolated",
                "label": "3) Pasa los numeros al otro lado",
                "kind": "equation",
                "expected": E(3 * x, 12),
                "expected_pretty": "3x = 12",
                "hint_fail": "Suma 2 a ambos lados.",
            },
            {
                "key": "solution",
                "label": "4) Solucion:  x =",
                "kind": "value",
                "expected": V(4),
                "expected_pretty": "4",
                "hint_fail": "x esta multiplicada por 3. Divide ambos lados entre 3.",
            },
        ],
        "full_solution": [
            "m.c.m.(2) = 2",
            "2·(3x/2) − 2·1 = 2·5   →   3x − 2 = 10",
            "3x = 12",
            "x = 12 / 3 = 4",
        ],
    },
    {
        "id": 7,
        "block": 1,
        "statement": "2x/3 + x/6 = 5",
        "tip": "El m.c.m. de 3 y 6 es 6. Multiplica TODO por 6.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 6,
                "hint_fail": "Los denominadores son 3 y 6. ¿Cual los divide a los dos?",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar por el m.c.m.",
                "kind": "equation",
                "expected": E(4 * x + x, 30),
                "expected_pretty": "4x + x = 30",
                "hint_fail": "Multiplica cada termino por 6.",
            },
            {
                "key": "reduced",
                "label": "3) Reduce los terminos con x",
                "kind": "equation",
                "expected": E(5 * x, 30),
                "expected_pretty": "5x = 30",
                "hint_fail": "4x + x = 5x. Combina los terminos con x.",
            },
            {
                "key": "solution",
                "label": "4) Solucion:  x =",
                "kind": "value",
                "expected": V(6),
                "expected_pretty": "6",
                "hint_fail": "x esta multiplicada por 5. Divide ambos lados entre 5.",
            },
        ],
        "full_solution": [
            "m.c.m.(3, 6) = 6",
            "6·(2x/3) + 6·(x/6) = 6·5   →   4x + x = 30",
            "5x = 30",
            "x = 30 / 5 = 6",
        ],
    },
    # =====================================================================
    # BLOQUE 2 — quitar denominadores + parentesis
    # =====================================================================
    {
        "id": 8,
        "block": 2,
        "statement": "2(x + 1) = 6",
        "tip": "No hay denominadores, m.c.m. = 1. Empieza quitando parentesis.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 1,
                "hint_fail": "No hay denominadores, m.c.m. = 1.",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar (no cambia)",
                "kind": "equation",
                "expected": E(2 * (x + 1), 6),
                "expected_pretty": "2(x + 1) = 6",
                "hint_fail": "Multiplica por 1, queda igual.",
            },
            {
                "key": "no_parens",
                "label": "3) Quita los parentesis",
                "kind": "equation",
                "expected": E(2 * x + 2, 6),
                "expected_pretty": "2x + 2 = 6",
                "hint_fail": "Multiplica el 2 por cada termino del parentesis.",
            },
            {
                "key": "x_isolated",
                "label": "4) Pasa los numeros al otro lado",
                "kind": "equation",
                "expected": E(2 * x, 4),
                "expected_pretty": "2x = 4",
                "hint_fail": "Resta 2 a ambos lados.",
            },
            {
                "key": "solution",
                "label": "5) Solucion:  x =",
                "kind": "value",
                "expected": V(2),
                "expected_pretty": "2",
                "hint_fail": "Divide ambos lados entre 2.",
            },
        ],
        "full_solution": [
            "m.c.m. = 1 (sin denominadores)",
            "2(x + 1) = 6",
            "2x + 2 = 6",
            "2x = 4",
            "x = 2",
        ],
    },
    {
        "id": 9,
        "block": 2,
        "statement": "3(x − 2) = 9",
        "tip": "Multiplica el 3 por cada termino del parentesis.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 1,
                "hint_fail": "No hay denominadores, m.c.m. = 1.",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar (no cambia)",
                "kind": "equation",
                "expected": E(3 * (x - 2), 9),
                "expected_pretty": "3(x − 2) = 9",
                "hint_fail": "Multiplica por 1, queda igual.",
            },
            {
                "key": "no_parens",
                "label": "3) Quita los parentesis",
                "kind": "equation",
                "expected": E(3 * x - 6, 9),
                "expected_pretty": "3x − 6 = 9",
                "hint_fail": "Multiplica el 3 por x y por −2.",
            },
            {
                "key": "x_isolated",
                "label": "4) Pasa los numeros al otro lado",
                "kind": "equation",
                "expected": E(3 * x, 15),
                "expected_pretty": "3x = 15",
                "hint_fail": "Suma 6 a ambos lados.",
            },
            {
                "key": "solution",
                "label": "5) Solucion:  x =",
                "kind": "value",
                "expected": V(5),
                "expected_pretty": "5",
                "hint_fail": "Divide ambos lados entre 3.",
            },
        ],
        "full_solution": [
            "m.c.m. = 1",
            "3(x − 2) = 9",
            "3x − 6 = 9",
            "3x = 15",
            "x = 5",
        ],
    },
    {
        "id": 10,
        "block": 2,
        "statement": "4 − (2x + 1) = 5",
        "tip": "El signo − delante del parentesis cambia TODOS los signos de dentro.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 1,
                "hint_fail": "No hay denominadores, m.c.m. = 1.",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar (no cambia)",
                "kind": "equation",
                "expected": E(4 - (2 * x + 1), 5),
                "expected_pretty": "4 − (2x + 1) = 5",
                "hint_fail": "Multiplica por 1, queda igual.",
            },
            {
                "key": "no_parens",
                "label": "3) Quita los parentesis (¡cuidado con el −!)",
                "kind": "equation",
                "expected": E(4 - 2 * x - 1, 5),
                "expected_pretty": "4 − 2x − 1 = 5",
                "hint_fail": "El − cambia +2x por −2x y +1 por −1.",
            },
            {
                "key": "reduced",
                "label": "4) Reduce los numeros",
                "kind": "equation",
                "expected": E(3 - 2 * x, 5),
                "expected_pretty": "3 − 2x = 5",
                "hint_fail": "4 − 1 = 3. Suma los numeros.",
            },
            {
                "key": "x_isolated",
                "label": "5) Pasa x a un lado y numeros al otro",
                "kind": "equation",
                "expected": E(-2 * x, 2),
                "expected_pretty": "−2x = 2",
                "hint_fail": "Resta 3 a ambos lados.",
            },
            {
                "key": "solution",
                "label": "6) Solucion:  x =",
                "kind": "value",
                "expected": V(-1),
                "expected_pretty": "−1",
                "hint_fail": "Divide ambos lados entre −2.",
            },
        ],
        "full_solution": [
            "m.c.m. = 1",
            "4 − (2x + 1) = 5",
            "4 − 2x − 1 = 5   (el − cambia los signos de dentro)",
            "3 − 2x = 5",
            "−2x = 2",
            "x = −1",
        ],
    },
    {
        "id": 11,
        "block": 2,
        "statement": "(2/3)(x − 1) = 4",
        "tip": "El m.c.m. es 3. Multiplica TODO y el coeficiente (2/3) desaparecera.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 3,
                "hint_fail": "El denominador es 3.",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar por el m.c.m.",
                "kind": "equation",
                "expected": E(2 * (x - 1), 12),
                "expected_pretty": "2(x − 1) = 12",
                "hint_fail": "Multiplica cada termino por 3, tambien dentro del parentesis.",
            },
            {
                "key": "no_parens",
                "label": "3) Quita los parentesis",
                "kind": "equation",
                "expected": E(2 * x - 2, 12),
                "expected_pretty": "2x − 2 = 12",
                "hint_fail": "Multiplica el 2 por x y por −1.",
            },
            {
                "key": "x_isolated",
                "label": "4) Pasa los numeros al otro lado",
                "kind": "equation",
                "expected": E(2 * x, 14),
                "expected_pretty": "2x = 14",
                "hint_fail": "Suma 2 a ambos lados.",
            },
            {
                "key": "solution",
                "label": "5) Solucion:  x =",
                "kind": "value",
                "expected": V(7),
                "expected_pretty": "7",
                "hint_fail": "Divide ambos lados entre 2.",
            },
        ],
        "full_solution": [
            "m.c.m.(3) = 3",
            "3·(2/3)·(x − 1) = 3·4   →   2(x − 1) = 12",
            "2x − 2 = 12",
            "2x = 14",
            "x = 7",
        ],
    },
    {
        "id": 12,
        "block": 2,
        "statement": "4 − (3/4)(2x + 1) = 5",
        "tip": "Atencion: hay denominador Y un signo − delante del parentesis. Los dos errores tipicos.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 4,
                "hint_fail": "El denominador es 4.",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar por el m.c.m.",
                "kind": "equation",
                "expected": E(16 - 3 * (2 * x + 1), 20),
                "expected_pretty": "16 − 3(2x + 1) = 20",
                "hint_fail": "Multiplica cada termino por 4, tambien dentro del parentesis.",
            },
            {
                "key": "no_parens",
                "label": "3) Quita los parentesis (¡cuidado con el −!)",
                "kind": "equation",
                "expected": E(16 - 6 * x - 3, 20),
                "expected_pretty": "16 − 6x − 3 = 20",
                "hint_fail": "El − cambia 3·(2x+1) por −3·(2x+1) = −6x − 3.",
            },
            {
                "key": "reduced",
                "label": "4) Reduce los numeros",
                "kind": "equation",
                "expected": E(13 - 6 * x, 20),
                "expected_pretty": "13 − 6x = 20",
                "hint_fail": "16 − 3 = 13. Suma los numeros.",
            },
            {
                "key": "x_isolated",
                "label": "5) Pasa x a un lado y numeros al otro",
                "kind": "equation",
                "expected": E(-6 * x, 7),
                "expected_pretty": "−6x = 7",
                "hint_fail": "Resta 13 a ambos lados. ¡Ojo con el signo!",
            },
            {
                "key": "solution",
                "label": "6) Solucion:  x =",
                "kind": "value",
                "expected": V(Rational(-7, 6)),
                "expected_pretty": "−7/6",
                "hint_fail": "Divide 7 entre −6.",
            },
        ],
        "full_solution": [
            "m.c.m.(4) = 4",
            "4·4 − 4·(3/4)·(2x + 1) = 4·5   →   16 − 3(2x + 1) = 20",
            "16 − 6x − 3 = 20   (el − delante cambia el signo de todo dentro)",
            "13 − 6x = 20",
            "−6x = 7",
            "x = 7 / (−6) = −7/6",
        ],
    },
    {
        "id": 13,
        "block": 2,
        "statement": "2(x/3 + 1) = 6",
        "tip": "Multiplica por 3 tambien DENTRO del parentesis para quitar la fraccion.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 3,
                "hint_fail": "Hay un denominador 3 dentro del parentesis.",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar por el m.c.m.",
                "kind": "equation",
                "expected": E(2 * (x + 3), 18),
                "expected_pretty": "2(x + 3) = 18",
                "hint_fail": "Multiplica el parentesis entero por 3: x/3 se vuelve x, 1 se vuelve 3.",
            },
            {
                "key": "no_parens",
                "label": "3) Quita los parentesis",
                "kind": "equation",
                "expected": E(2 * x + 6, 18),
                "expected_pretty": "2x + 6 = 18",
                "hint_fail": "Multiplica el 2 por x y por 3.",
            },
            {
                "key": "x_isolated",
                "label": "4) Pasa los numeros al otro lado",
                "kind": "equation",
                "expected": E(2 * x, 12),
                "expected_pretty": "2x = 12",
                "hint_fail": "Resta 6 a ambos lados.",
            },
            {
                "key": "solution",
                "label": "5) Solucion:  x =",
                "kind": "value",
                "expected": V(6),
                "expected_pretty": "6",
                "hint_fail": "Divide ambos lados entre 2.",
            },
        ],
        "full_solution": [
            "m.c.m.(3) = 3",
            "3·2·(x/3 + 1) = 3·6   →   2(x + 3) = 18",
            "2x + 6 = 18",
            "2x = 12",
            "x = 6",
        ],
    },
    {
        "id": 14,
        "block": 2,
        "statement": "(1/2)(2x − 4) = 3",
        "tip": "Multiplica por 2: la fraccion y el parentesis desaparecen a la vez.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 2,
                "hint_fail": "El denominador es 2.",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar por el m.c.m.",
                "kind": "equation",
                "expected": E(2 * x - 4, 6),
                "expected_pretty": "2x − 4 = 6",
                "hint_fail": "Multiplica el parentesis entero por 2.",
            },
            {
                "key": "x_isolated",
                "label": "3) Pasa los numeros al otro lado",
                "kind": "equation",
                "expected": E(2 * x, 10),
                "expected_pretty": "2x = 10",
                "hint_fail": "Suma 4 a ambos lados.",
            },
            {
                "key": "solution",
                "label": "4) Solucion:  x =",
                "kind": "value",
                "expected": V(5),
                "expected_pretty": "5",
                "hint_fail": "Divide ambos lados entre 2.",
            },
        ],
        "full_solution": [
            "m.c.m.(2) = 2",
            "2·(1/2)·(2x − 4) = 2·3   →   2x − 4 = 6",
            "2x = 10",
            "x = 5",
        ],
    },
    # =====================================================================
    # BLOQUE 3 — ecuacion completa
    # =====================================================================
    {
        "id": 15,
        "block": 3,
        "statement": "(3/2)x = 7",
        "tip": "Multiplica por 2 para deshacerte de la fraccion.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 2,
                "hint_fail": "El denominador de (3/2) es 2.",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar por el m.c.m.",
                "kind": "equation",
                "expected": E(3 * x, 14),
                "expected_pretty": "3x = 14",
                "hint_fail": "Multiplica ambos lados por 2.",
            },
            {
                "key": "solution",
                "label": "3) Solucion:  x =",
                "kind": "value",
                "expected": V(Rational(14, 3)),
                "expected_pretty": "14/3",
                "hint_fail": "Divide 14 entre 3. La fraccion no se puede simplificar.",
            },
        ],
        "full_solution": [
            "m.c.m.(2) = 2",
            "2·(3/2)x = 2·7   →   3x = 14",
            "x = 14/3",
        ],
    },
    {
        "id": 16,
        "block": 3,
        "statement": "x/2 + 1/3 = x − 1/6",
        "tip": "Pasa las x a un lado y los numeros al otro. Cuidado con los signos al cambiar de lado.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 6,
                "hint_fail": "Los denominadores son 2, 3 y 6. ¿Cual los divide a los tres?",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar por el m.c.m.",
                "kind": "equation",
                "expected": E(3 * x + 2, 6 * x - 1),
                "expected_pretty": "3x + 2 = 6x − 1",
                "hint_fail": "Multiplica cada termino por 6, tambien la x del segundo miembro.",
            },
            {
                "key": "x_isolated",
                "label": "3) Pasa x a la izquierda y numeros a la derecha",
                "kind": "equation",
                "expected": E(-3 * x, -3),
                "expected_pretty": "−3x = −3",
                "hint_fail": "Resta 6x a ambos lados y resta 2 a ambos lados.",
            },
            {
                "key": "solution",
                "label": "4) Solucion:  x =",
                "kind": "value",
                "expected": V(1),
                "expected_pretty": "1",
                "hint_fail": "Divide ambos lados entre −3.",
            },
        ],
        "full_solution": [
            "m.c.m.(2, 3, 6) = 6",
            "6·(x/2) + 6·(1/3) = 6·x − 6·(1/6)   →   3x + 2 = 6x − 1",
            "3x − 6x = −1 − 2   →   −3x = −3",
            "x = 1",
        ],
    },
    {
        "id": 17,
        "block": 3,
        "statement": "(2x − 1)/3 = (x + 1)/2",
        "tip": "Multiplica por el m.c.m. y luego quita parentesis en ambos lados.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 6,
                "hint_fail": "Los denominadores son 3 y 2. ¿Cual los divide a los dos?",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar por el m.c.m.",
                "kind": "equation",
                "expected": E(2 * (2 * x - 1), 3 * (x + 1)),
                "expected_pretty": "2(2x − 1) = 3(x + 1)",
                "hint_fail": "Multiplica cada lado por 6, simplificando el denominador.",
            },
            {
                "key": "no_parens",
                "label": "3) Quita los parentesis en ambos lados",
                "kind": "equation",
                "expected": E(4 * x - 2, 3 * x + 3),
                "expected_pretty": "4x − 2 = 3x + 3",
                "hint_fail": "Distribuye el 2 a la izquierda y el 3 a la derecha.",
            },
            {
                "key": "x_isolated",
                "label": "4) Pasa x a un lado y numeros al otro",
                "kind": "equation",
                "expected": E(x, 5),
                "expected_pretty": "x = 5",
                "hint_fail": "Resta 3x a ambos lados y suma 2 a ambos lados.",
            },
            {
                "key": "solution",
                "label": "5) Solucion:  x =",
                "kind": "value",
                "expected": V(5),
                "expected_pretty": "5",
                "hint_fail": "x ya esta despejada, escribe solo el numero.",
            },
        ],
        "full_solution": [
            "m.c.m.(3, 2) = 6",
            "6·(2x − 1)/3 = 6·(x + 1)/2   →   2(2x − 1) = 3(x + 1)",
            "4x − 2 = 3x + 3",
            "4x − 3x = 3 + 2   →   x = 5",
        ],
    },
    {
        "id": 18,
        "block": 3,
        "statement": "x/4 + (x − 2)/2 = 5",
        "tip": "Multiplica por 4 tambien DENTRO del parentesis.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 4,
                "hint_fail": "Los denominadores son 4 y 2. ¿Cual los divide a los dos?",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar por el m.c.m.",
                "kind": "equation",
                "expected": E(x + 2 * (x - 2), 20),
                "expected_pretty": "x + 2(x − 2) = 20",
                "hint_fail": "Multiplica cada termino por 4, tambien dentro del parentesis.",
            },
            {
                "key": "no_parens",
                "label": "3) Quita los parentesis",
                "kind": "equation",
                "expected": E(x + 2 * x - 4, 20),
                "expected_pretty": "x + 2x − 4 = 20",
                "hint_fail": "Distribuye el 2: 2·x y 2·(−2) = −4.",
            },
            {
                "key": "reduced",
                "label": "4) Reduce los terminos con x y los numeros",
                "kind": "equation",
                "expected": E(3 * x - 4, 20),
                "expected_pretty": "3x − 4 = 20",
                "hint_fail": "x + 2x = 3x.",
            },
            {
                "key": "x_isolated",
                "label": "5) Pasa los numeros al otro lado",
                "kind": "equation",
                "expected": E(3 * x, 24),
                "expected_pretty": "3x = 24",
                "hint_fail": "Suma 4 a ambos lados.",
            },
            {
                "key": "solution",
                "label": "6) Solucion:  x =",
                "kind": "value",
                "expected": V(8),
                "expected_pretty": "8",
                "hint_fail": "Divide ambos lados entre 3.",
            },
        ],
        "full_solution": [
            "m.c.m.(4, 2) = 4",
            "4·(x/4) + 4·(x − 2)/2 = 4·5   →   x + 2(x − 2) = 20",
            "x + 2x − 4 = 20",
            "3x − 4 = 20",
            "3x = 24",
            "x = 8",
        ],
    },
    {
        "id": 19,
        "block": 3,
        "statement": "(x + 1)/3 − (x − 1)/2 = 1",
        "tip": "Multiplica por 6. Luego reparte los parentesis. Ojo con el signo − entre ellos.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 6,
                "hint_fail": "Los denominadores son 3 y 2. ¿Cual los divide a los dos?",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar por el m.c.m.",
                "kind": "equation",
                "expected": E(2 * (x + 1) - 3 * (x - 1), 6),
                "expected_pretty": "2(x + 1) − 3(x − 1) = 6",
                "hint_fail": "Multiplica el primer parentesis por 2 y el segundo por 3.",
            },
            {
                "key": "no_parens",
                "label": "3) Quita los parentesis (¡cuidado con el −!)",
                "kind": "equation",
                "expected": E(2 * x + 2 - 3 * x + 3, 6),
                "expected_pretty": "2x + 2 − 3x + 3 = 6",
                "hint_fail": "El − delante del segundo parentesis cambia 3x a −3x y −1 a +1.",
            },
            {
                "key": "reduced",
                "label": "4) Reduce terminos",
                "kind": "equation",
                "expected": E(-x + 5, 6),
                "expected_pretty": "−x + 5 = 6",
                "hint_fail": "2x − 3x = −x. 2 + 3 = 5.",
            },
            {
                "key": "x_isolated",
                "label": "5) Pasa los numeros al otro lado",
                "kind": "equation",
                "expected": E(-x, 1),
                "expected_pretty": "−x = 1",
                "hint_fail": "Resta 5 a ambos lados.",
            },
            {
                "key": "solution",
                "label": "6) Solucion:  x =",
                "kind": "value",
                "expected": V(-1),
                "expected_pretty": "−1",
                "hint_fail": "Multiplica ambos lados por −1.",
            },
        ],
        "full_solution": [
            "m.c.m.(3, 2) = 6",
            "2(x + 1) − 3(x − 1) = 6",
            "2x + 2 − 3x + 3 = 6",
            "−x + 5 = 6",
            "−x = 1",
            "x = −1",
        ],
    },
    {
        "id": 20,
        "block": 3,
        "statement": "2x/3 + 1/2 = x/6 + 1",
        "tip": "El m.c.m. de 3, 2 y 6 es 6.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 6,
                "hint_fail": "Los denominadores son 3, 2 y 6. ¿Cual los divide a los tres?",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar por el m.c.m.",
                "kind": "equation",
                "expected": E(4 * x + 3, x + 6),
                "expected_pretty": "4x + 3 = x + 6",
                "hint_fail": "Multiplica cada termino por 6.",
            },
            {
                "key": "x_isolated",
                "label": "3) Pasa x a la izquierda y numeros a la derecha",
                "kind": "equation",
                "expected": E(3 * x, 3),
                "expected_pretty": "3x = 3",
                "hint_fail": "Resta x a ambos lados y resta 3 a ambos lados.",
            },
            {
                "key": "solution",
                "label": "4) Solucion:  x =",
                "kind": "value",
                "expected": V(1),
                "expected_pretty": "1",
                "hint_fail": "Divide ambos lados entre 3.",
            },
        ],
        "full_solution": [
            "m.c.m.(3, 2, 6) = 6",
            "6·(2x/3) + 6·(1/2) = 6·(x/6) + 6·1   →   4x + 3 = x + 6",
            "4x − x = 6 − 3   →   3x = 3",
            "x = 1",
        ],
    },
    {
        "id": 21,
        "block": 3,
        "statement": "(3x − 1)/4 = (x + 1)/2 − 1",
        "tip": "Multiplica por 4. La fraccion (x+1)/2 se queda como 2(x+1) y el 1 como 4.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 4,
                "hint_fail": "Los denominadores son 4 y 2. ¿Cual los divide a los dos?",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar por el m.c.m.",
                "kind": "equation",
                "expected": E(3 * x - 1, 2 * (x + 1) - 4),
                "expected_pretty": "3x − 1 = 2(x + 1) − 4",
                "hint_fail": "Multiplica cada termino por 4.",
            },
            {
                "key": "no_parens",
                "label": "3) Quita los parentesis",
                "kind": "equation",
                "expected": E(3 * x - 1, 2 * x + 2 - 4),
                "expected_pretty": "3x − 1 = 2x + 2 − 4",
                "hint_fail": "Distribuye el 2 a (x+1).",
            },
            {
                "key": "reduced",
                "label": "4) Reduce los numeros del lado derecho",
                "kind": "equation",
                "expected": E(3 * x - 1, 2 * x - 2),
                "expected_pretty": "3x − 1 = 2x − 2",
                "hint_fail": "2 − 4 = −2.",
            },
            {
                "key": "x_isolated",
                "label": "5) Pasa x a un lado y numeros al otro",
                "kind": "equation",
                "expected": E(x, -1),
                "expected_pretty": "x = −1",
                "hint_fail": "Resta 2x a ambos lados y suma 1 a ambos lados.",
            },
            {
                "key": "solution",
                "label": "6) Solucion:  x =",
                "kind": "value",
                "expected": V(-1),
                "expected_pretty": "−1",
                "hint_fail": "x ya esta despejada, escribe solo el numero.",
            },
        ],
        "full_solution": [
            "m.c.m.(4, 2) = 4",
            "4·(3x − 1)/4 = 4·(x + 1)/2 − 4·1   →   3x − 1 = 2(x + 1) − 4",
            "3x − 1 = 2x + 2 − 4",
            "3x − 1 = 2x − 2",
            "x = −1",
        ],
    },
    {
        "id": 22,
        "block": 3,
        "statement": "2 − (x + 1)/3 = (x + 1)/6",
        "tip": "Aparece (x+1) en los dos lados. Multiplica por 6.",
        "steps": [
            {
                "key": "mcm",
                "label": "1) m.c.m. de los denominadores",
                "kind": "integer",
                "expected": 6,
                "hint_fail": "Los denominadores son 3 y 6. ¿Cual los divide a los dos?",
            },
            {
                "key": "multiplied",
                "label": "2) Ecuacion tras multiplicar por el m.c.m.",
                "kind": "equation",
                "expected": E(12 - 2 * (x + 1), x + 1),
                "expected_pretty": "12 − 2(x + 1) = x + 1",
                "hint_fail": "Multiplica cada termino por 6.",
            },
            {
                "key": "no_parens",
                "label": "3) Quita los parentesis (¡cuidado con el −!)",
                "kind": "equation",
                "expected": E(12 - 2 * x - 2, x + 1),
                "expected_pretty": "12 − 2x − 2 = x + 1",
                "hint_fail": "El − delante cambia 2·(x+1) a −2x − 2.",
            },
            {
                "key": "reduced",
                "label": "4) Reduce los numeros",
                "kind": "equation",
                "expected": E(10 - 2 * x, x + 1),
                "expected_pretty": "10 − 2x = x + 1",
                "hint_fail": "12 − 2 = 10.",
            },
            {
                "key": "x_isolated",
                "label": "5) Pasa x a un lado y numeros al otro",
                "kind": "equation",
                "expected": E(-3 * x, -9),
                "expected_pretty": "−3x = −9",
                "hint_fail": "Resta x a ambos lados y resta 10 a ambos lados.",
            },
            {
                "key": "solution",
                "label": "6) Solucion:  x =",
                "kind": "value",
                "expected": V(3),
                "expected_pretty": "3",
                "hint_fail": "Divide ambos lados entre −3.",
            },
        ],
        "full_solution": [
            "m.c.m.(3, 6) = 6",
            "6·2 − 6·(x + 1)/3 = 6·(x + 1)/6   →   12 − 2(x + 1) = x + 1",
            "12 − 2x − 2 = x + 1",
            "10 − 2x = x + 1",
            "10 − 1 = x + 2x   →   9 = 3x",
            "x = 3",
        ],
    },
]


# =============================================================================
# Conversion de texto plano a LaTeX para renderizado con KaTeX
# =============================================================================
# Las fracciones a/b se convierten a \frac{a}{b}, los parentesis se
# envuelven en \left( \right) para que escalen con la fraccion.

import re as _re

_LATEX_REPLACEMENTS = [
    ("\u00b7", r" \cdot "),       # ·
    ("\u2212", "-"),                # −
    ("\u2192", r" \rightarrow "),   # →
]


def _to_latex(s):
    for old, new in _LATEX_REPLACEMENTS:
        s = s.replace(old, new)
    s = s.replace("m.c.m.", r"\text{m.c.m.}")
    # (a)/(b) o (a)/b
    s = _re.sub(
        r"\(([^()]+)\)/(\([^()]*\)|\w+)",
        lambda m: r"\frac{" + m.group(1) + "}{" + m.group(2) + "}",
        s,
    )
    # a/(b)
    s = _re.sub(
        r"([^/\s()]+)/(\([^()]*\))",
        lambda m: r"\frac{" + m.group(1) + "}{" + m.group(2) + "}",
        s,
    )
    # a/b
    s = _re.sub(
        r"([^/\s()]+)/(\w+)",
        lambda m: r"\frac{" + m.group(1) + "}{" + m.group(2) + "}",
        s,
    )
    # Parentesis escalables: asi la barra de la fraccion queda alineada
    s = s.replace("(", r"\left(").replace(")", r"\right)")
    return s


for _eq in EQUATIONS:
    _eq["statement_latex"] = _to_latex(_eq["statement"])
    _eq["full_solution_latex"] = [_to_latex(line) for line in _eq["full_solution"]]

del _eq
