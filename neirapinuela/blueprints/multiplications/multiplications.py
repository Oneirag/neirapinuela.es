from flask import Blueprint, render_template, abort, request, redirect, g, make_response, flash
import os

mult = Blueprint('multiplications', __name__,
                 # subdomain="<app>",
                 template_folder='templates',
                 static_folder="static",
                 static_url_path='/static/multiplications'
                 )


@mult.record_once
def on_load(state):
    """add i18n files so they are loaded on start"""
    state.app.config['I18N_TRANSLATION_FILES'] += [os.path.join(os.path.dirname(__file__), "i18n_translations.yaml")]


@mult.route("/<lang_code>/multiplications/<int:max_value>")
@mult.route("/<lang_code>/mult/", defaults={"max_value": 9})
def multiplications(max_value):
    return render_template("multiplications.html", max_value=max_value)
