"""Blueprint de Ecuaciones: practica de ecuaciones de primer grado paso a paso.

Rutas (montadas en /apps/ecuaciones):
    GET  /                              indice con 3 bloques + chuleta
    GET  /bloque/<int:n>                lista de ejercicios del bloque
    GET  /ejercicio/<int:eq_id>         formulario interactivo por pasos
    POST /ejercicio/<int:eq_id>/validar validacion de un paso (JSON)
"""

import re

from flask import Blueprint, abort, jsonify, render_template, request
from sympy import Symbol, expand, simplify, sympify

from .equations import EQUATIONS

bp = Blueprint("ecuaciones", __name__)

x = Symbol("x")

BLOCKS = [
    {
        "id": 1,
        "title": "Bloque 1 · Solo quitar denominadores",
        "description": (
            "Empezamos por lo mas facil: solo quitar denominadores. "
            "Sin parentesis. Tu unico reto es encontrar el m.c.m."
        ),
        "color": "success",
        "icon": "bi-1-circle-fill",
    },
    {
        "id": 2,
        "title": "Bloque 2 · Denominadores + parentesis",
        "description": (
            "Ahora hay que quitar denominadores Y abrir parentesis. "
            "Cuidado con el signo − delante del parentesis."
        ),
        "color": "warning",
        "icon": "bi-2-circle-fill",
    },
    {
        "id": 3,
        "title": "Bloque 3 · Ecuacion completa",
        "description": (
            "El bloque mas completo. Denominadores, parentesis, x en los dos lados... "
            "Vamos a por todas."
        ),
        "color": "danger",
        "icon": "bi-3-circle-fill",
    },
]

METHOD_CHEATSHEET = [
    "Busca el m.c.m. de los denominadores.",
    "Multiplica TODA la ecuacion por ese numero.",
    "Quita los parentesis (cuidado con el − delante).",
    "Junta los terminos con x a un lado.",
    "Junta los numeros al otro lado.",
    "Reduce (suma o resta lo que se pueda).",
    "Despeja x dividiendo.",
]


def get_equation(eq_id):
    return next((e for e in EQUATIONS if e["id"] == eq_id), None)


def get_block_exercises(block_id):
    return [e for e in EQUATIONS if e["block"] == block_id]


_LOCAL = {"x": x}

_IMPLICIT_MUL = [
    (re.compile(r"(\d)([a-zA-Z(])"), r"\1*\2"),
    (re.compile(r"(\))(\()"), r"\1*\2"),
    (re.compile(r"(\))([a-zA-Z])"), r"\1*\2"),
]


def _add_implicit_mul(text):
    """Inserta '*' para que SymPy parsee la multiplicacion implicita: 2x -> 2*x."""
    for pattern, repl in _IMPLICIT_MUL:
        text = pattern.sub(repl, text)
    return text


def _parse_equation(text):
    """Parsea '2x + 3 = 7' -> (sympy_expr, sympy_expr)."""
    if "=" not in text:
        raise ValueError("Falta el signo =")
    lhs_str, rhs_str = text.split("=", 1)
    return (
        sympify(_add_implicit_mul(lhs_str), locals=_LOCAL),
        sympify(_add_implicit_mul(rhs_str), locals=_LOCAL),
    )


def _parse_value(text):
    """Parsea el valor de la solucion. Acepta '4', '4/6', 'x = 4', 'x=4/6'."""
    text = text.strip()
    if text.lower().startswith("x"):
        text = text[1:].strip()
        if text.startswith("="):
            text = text[1:].strip()
    return sympify(_add_implicit_mul(text), locals=_LOCAL)


def _equations_equal(user_lhs, user_rhs, exp_lhs, exp_rhs):
    """Dos ecuaciones son equivalentes si (lhs1 - rhs1) - (lhs2 - rhs2) == 0."""
    diff = expand((user_lhs - user_rhs) - (exp_lhs - exp_rhs))
    return simplify(diff) == 0


def _values_equal(user_val, true_val, tol=1e-6):
    diff = simplify(user_val - true_val)
    if diff == 0:
        return True
    try:
        return abs(float(diff)) < tol
    except (TypeError, ValueError):
        return False


@bp.route("/")
def index():
    return render_template(
        "apps/ecuaciones/index.html", blocks=BLOCKS, cheatsheet=METHOD_CHEATSHEET
    )


@bp.route("/bloque/<int:n>")
def block(n):
    block_info = next((b for b in BLOCKS if b["id"] == n), None)
    if not block_info:
        abort(404)
    exercises = get_block_exercises(n)
    return render_template(
        "apps/ecuaciones/block.html", block=block_info, exercises=exercises
    )


@bp.route("/ejercicio/<int:eq_id>")
def exercise(eq_id):
    eq = get_equation(eq_id)
    if not eq:
        abort(404)
    return render_template(
        "apps/ecuaciones/exercise.html", equation=eq, block_id=eq["block"]
    )


@bp.route("/ejercicio/<int:eq_id>/validar", methods=["POST"])
def validar(eq_id):
    eq = get_equation(eq_id)
    if not eq:
        return jsonify(ok=False, error="Ejercicio no encontrado"), 404

    data = request.get_json(silent=True) or {}
    step_key = data.get("step")
    user_value = (data.get("value") or "").strip()

    if not step_key or not user_value:
        return jsonify(ok=False, hint="Escribe una respuesta antes de comprobar.")

    step = next((s for s in eq["steps"] if s["key"] == step_key), None)
    if not step:
        return jsonify(ok=False, error="Paso no encontrado"), 404

    user_value_norm = user_value.replace("−", "-").replace("–", "-")

    try:
        if step["kind"] == "integer":
            ok = int(user_value_norm) == step["expected"]
        elif step["kind"] == "equation":
            user_lhs, user_rhs = _parse_equation(user_value_norm)
            exp_lhs, exp_rhs = step["expected"]
            ok = _equations_equal(user_lhs, user_rhs, exp_lhs, exp_rhs)
        elif step["kind"] == "value":
            user_val = _parse_value(user_value_norm)
            ok = _values_equal(user_val, step["expected"])
        else:
            ok = False
    except Exception:
        return jsonify(
            ok=False,
            hint=(
                "No he podido leer lo que has escrito. "
                "Revisa la sintaxis (parentesis, signos, =)."
            ),
        )

    return jsonify(ok=ok, hint=None if ok else step["hint_fail"])
