from flask import Blueprint, render_template, abort, request, redirect, g, make_response, flash
import os

msrm = Blueprint('measure', __name__,
                 # subdomain="<app>",
                 template_folder='templates',
                 static_folder="static")


@msrm.record_once
def on_load(state):
    """add i18n files so they are loaded on start"""
    state.app.config['I18N_TRANSLATION_FILES'] += [os.path.join(os.path.dirname(__file__), "i18n_translations.yaml")]


@msrm.route("/<lang_code>/measurements/<kind>")
@msrm.route("/<lang_code>/measurements/", defaults={"kind": "longitude"})
def measurements(kind):
    units = g.get(f"measurement_units_{kind}")
    if units is None:
        return abort(404)
    kinds = []
    translate_kinds = dict()
    for elem in g.__dict__.keys():
        if elem.startswith("measurement_units_"):
            kind_aux = elem.split("_")[-1]
            kinds.append(kind_aux)
            translate_kinds[kind_aux] = getattr(g, "measurements_" + kind_aux, kind_aux)
    return render_template("measurements.html", units=units, kind=kind, kinds=kinds, translate_kinds=translate_kinds)
