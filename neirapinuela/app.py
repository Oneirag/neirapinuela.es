import os
import secrets
import sys
from dataclasses import dataclass

import yaml
from flask import Flask, render_template, url_for, g, request
from gevent.pywsgi import WSGIServer
from ong_utils import OngConfig

from neirapinuela.blueprints.auth.auth import auth

config = OngConfig("neirapinuela").config

app = Flask(__name__, subdomain_matching=True)
app.config['SERVER_NAME'] = config("SERVER_NAME", "neirapinuela.es")
# app.url_map.default_subdomain = "www"
app.config['SECRET_KEY'] = config("SECRET_KEY", secrets.token_urlsafe(24))
# Default translation file
app.config['I18N_TRANSLATION_FILES'] = [os.path.join(os.path.dirname(__file__), "i18n_translations.yaml")]
app.register_blueprint(auth)

#####################################
#   Load internationalization support
#####################################
i18n_cfg = dict()
# Reversed so default values are read last
for i18n_file in reversed(app.config['I18N_TRANSLATION_FILES']):
    if os.path.isfile(i18n_file):
        with open(i18n_file, "r") as f:
            i18n_cfg.update(yaml.safe_load(f))


@app.url_defaults
def add_language_code(endpoint, values):
    if 'lang_code' in values or not g.get('lang_code', None):
        return
    if app.url_map.is_endpoint_expecting(endpoint, 'lang_code'):
        values['lang_code'] = g.lang_code


@app.url_value_preprocessor
def pull_lang_code(endpoint, values):
    g._scheme = config("scheme", "http")
    if values:
        g.lang_code = values.pop('lang_code', "en")  # Defaults to english
        for k, v in i18n_cfg.items():
            if g.lang_code in v:
                setattr(g, k, v[g.lang_code])
            g.flask_port = config("port", 5000)


ERROR_CONFIG = {str(code): (i18n_cfg[f"error_{code}_msg"], i18n_cfg[f"error_{code}_desc"])
                for code in (400, 401, 402, 403, 404, 405, 406, 407, 408, 500, 501, 502, 503, 504)}


def home_link_data(g):
    """Returns config for all links of home root"""
    return [
        {
            "name": "Grafana", "letter": "n",
            "link":  url_for("iframe_page", url="https://grafana.neirapinuela.es/", lang_code=g.lang_code),
            "public": False, "class": "",
            "definition": i18n_cfg['home_link_grafana_definition'][g.lang_code],
            "app_img": url_for("static", filename="screenshot/grafana.png"),
        },
        {
            "name": "Eva", "letter": "e",
        },
        {
            "letter": "i",
        },
        {
            "name": "Oscar", "letter": "r",
        },
        {
            "name": "Carlitos", "letter": "a",
        },
        {
            "name": "Pablo", "letter": "p", "link": url_for('euro_coin_game', lang_code=g.lang_code),
            "public": True, "class": "",
        },
        {
            "name": "Mirubee", "letter": "i",
            "link": url_for("iframe_page", url="https://mirubee.neirapinuela.es/index.html", lang_code=g.lang_code),
            "public": False, "class": "",
            "definition": i18n_cfg['home_link_mirubee_definition'][g.lang_code],
            "app_img": url_for("static", filename="screenshot/mirubee.png"),
        },
        {
            "letter": "n"
        },
        {
            "name": i18n_cfg["home_link_unit_conversion"][g.lang_code], "letter": "u",
            "link": url_for('gas', lang_code=g.lang_code),
            "public": True, "class": "",
            "definition": i18n_cfg['home_link_unit_conversion_definition'][g.lang_code],
            "app_img": url_for("static", filename="screenshot/unit_conversion.png"),
        },
        {
            "name": "Smappee", "letter": "e",
            "link": url_for("iframe_page", url="https://smappee.neirapinuela.es/smappee.html", lang_code=g.lang_code),
            "public": False,
            "class": "",
            "definition": i18n_cfg['home_link_smappee_definition'][g.lang_code],
            "app_img": url_for("static", filename="screenshot/smappee.png"),
        },
        {
            "name": i18n_cfg['home_link_links'][g.lang_code], "link": url_for("links"),
            "letter": "l",
        },
        {
            "name": 'apps', "letter": "a", 'link': url_for('apps')
        },
        {
            "letter": "."
        },
        {
            "name": i18n_cfg["home_link_euro_coin_game"][g.lang_code], "letter": "e",
            "link": url_for('euro_coin_game', lang_code=g.lang_code),
            "public": True, "class": "",
            "definition": i18n_cfg['home_link_euro_coin_game_definition'][g.lang_code],
            "app_img": url_for("static", filename="screenshot/euro_coin_game.png"),
        },
        {
            "name": "Supervisor", "letter": "s",
            "link": url_for("iframe_page", url="https://supervisor.neirapinuela.es", lang_code=g.lang_code),
            "public": False,
            "definition": i18n_cfg['home_link_supervisor_definition'][g.lang_code],
            "app_img": url_for("static", filename="screenshot/supervisor.png"),
        },
    ]


def split_word(word: str, letter: str) -> list:
    """Split a word in tree parts, before  a given letter, the letter itself and after the letter. If no letter is split
    in halves"""
    letter = letter or ""
    letter = letter.upper()
    if word:
        word = word.upper()
        # find all occurrences, returning a tuple with the distance from the center and the original index
        indices = [(abs(i - len(word) / 2), i) for i, x in enumerate(word) if x == letter]
        if indices:
            min_pos = min(indices, key=lambda x: x[0])[1]
            return [word[:min_pos], word[min_pos], word[min_pos + 1:]]
        else:
            pos = round(len(word) / 2)
            return [word[:pos], "", word[pos:]]
    else:
        return ["", letter, ""]


def translate(orig, lang: str) -> str:
    """Returns translation of an element"""
    if isinstance(orig, (str, list, tuple)):
        return orig  # Not translation found
    elif isinstance(orig, dict):
        return orig.get(lang, "en")  # English as a default
    else:
        raise ValueError(f"Could not translate {orig}")


def translate_list_of_dicts(list_of_dicts: list, lang: str) -> list:
    """Translates all values of each dictionary element of a list"""
    return [{k: translate(v, lang) if isinstance(v, dict) else v for k, v in elem.items()} for elem in list_of_dicts]


def generate_crossword(cfg: dict) -> list:
    """Generates a table or lists of lists with a dict with letter and classes for drawing the crossword"""
    # First compute width of the table
    width = 12  # minimum width
    for elem in cfg:
        pre_letter, letter, post_letter = split_word(elem.get('name', ""), elem.get('letter', ""))
        width = max(width, max(len(pre_letter), len(post_letter)) * 2 + 1)
    letter_pos = round(width / 2)
    retval = list()
    for elem in cfg:
        row = []
        for i in range(width):
            row_elem = dict()
            pre_letter, letter, post_letter = split_word(elem.get('name', ""), elem.get('letter', ""))
            link = elem.get('link', "#")
            # if len(link) > 1 and not elem.get("public", True):
            #     link = url_for('login', where=link)
            if i < (letter_pos - len(pre_letter)) or i >= len(post_letter) + letter_pos + len(letter):
                row_elem['value'] = "*"
                row_elem['class'] = "nonletterData"
                row_elem['link'] = link
            elif i == letter_pos and letter != "":
                row_elem['value'] = letter
                row_elem['class'] = "letterData neirapinuela"
                row_elem['link'] = link
            else:
                if i < letter_pos:
                    row_elem['value'] = pre_letter[i - letter_pos]
                else:
                    row_elem['value'] = post_letter[i - letter_pos - len(letter)]
                row_elem['class'] = "letterData"
                row_elem['link'] = link
                letter = letter.upper()
            # Add specific class if configured
            row_elem['class'] = elem.get('class', "") + " " + row_elem['class']
            row.append(row_elem)
        if elem.get("definition", ""):
            # Create fields for render definitions in template
            row[-1]['definition'] = elem['definition']
            row[-1]['definition_link'] = elem.get("link", "#")
            row[-1]['definition_public'] = elem.get("public", True)
            row[-1]['definition_title'] = elem.get("name", "")
        retval.append(row)
    # print(retval)
    return retval


@app.route("/<lang_code>/")
def home():
    link_data = home_link_data(g)
    return render_template("crossword.html",
                           crossword=generate_crossword(translate_list_of_dicts(link_data, g.lang_code)))
    # return render_template("base.html")


@app.route("/<lang_code>/gas.html")
def gas():
    return render_template("gas.html")


@app.route("/<lang_code>/euro_coin_game/euro_coin_game.html")
def euro_coin_game():
    return render_template("euro_coin_game.html")


@app.route("/<lang_code>/internal/<error_code>")
def error_page(error_code):
    code = error_code.split("_")[1].split(".")[0]
    link_data = [
        dict(name=translate("Error", g.lang_code)),
        dict(name=code, definition=translate(ERROR_CONFIG[code][1], g.lang_code),
             link="javascript:history.back()")
    ]
    link_data += [
        dict(name=s, link="/", letter="") for s in translate(ERROR_CONFIG[code][0], g.lang_code)
    ]

    return render_template("crossword.html",
                           crossword=generate_crossword(link_data))


@app.route("/<lang_code>/apps.html")
def apps():
    apps_config = [elem for elem in home_link_data(g) if "app_img" in elem]
    return render_template("apps.html", apps_config=apps_config)


@app.route("/<lang_code>/about.html")
def about():
    @dataclass
    class Icon:
        icon_class: str  # Class of the icon
        link: str = None  # Link of the icon
        tooltip: str = None  # Tooltip of the icon

    @dataclass
    class Person:
        title: str  # Name (title of the card)
        subtitle: str  # Subtitle of the card
        icon: str = "fa-solid fa-person"  # Icon to the left of the card
        hobbies_icons: tuple = ()  # Icons of the hobbies
        links: tuple = ()  # links

    about_cfg = (
        Person(title="Oscar Neira", subtitle=i18n_cfg['about_dad'][g.lang_code],
               hobbies_icons=(
                   Icon(icon_class="fa-brands fa-python", tooltip=i18n_cfg["about_tooltip_python"][g.lang_code]),
                   Icon(icon_class="fa-brands fa-btc", tooltip="Bitcoin"),
                   Icon(icon_class="fa-brands fa-ethereum", tooltip="Ethereum"),
                   Icon(icon_class="fa-brands fa-raspberry-pi", tooltip="Raspberry pi"),
                   Icon(icon_class="fa-brands fa-ubuntu", tooltip="Ubuntu"),
                   Icon(icon_class="fa-brands fa-rebel", tooltip="Star wars"),
                   Icon(icon_class="fas fa-hand-spock", tooltip="Star trek"),
               ),
               links=(
                   Icon(icon_class="bi bi-github", link="https://github.com/Oneirag",
                        tooltip=i18n_cfg["about_tooltip_github"][g.lang_code]),
                   Icon(icon_class="bi bi-linkedin", link="https://linkedin.com/in/oscar-neira-garcia",
                        tooltip=i18n_cfg["about_tooltip_linkedin"][g.lang_code]),
                   Icon(icon_class="bi bi-envelope", link="mailto:admin@neirapinuela.es",
                        tooltip=i18n_cfg["about_tooltip_mail"][g.lang_code]),
               ),
               ),
    )

    return render_template("about.html", about_cfg=about_cfg)


@app.route("/<lang_code>/links.html")
def links():
    @dataclass
    class Link:
        """Class for storing link information"""
        url: str
        desc: str  # description (translated)

    link_data = {
        "Aula virtual":
            [
                Link(url="https://aulavirtual35.educa.madrid.org/",
                     desc="Aula Virtual",
                     ),
            ],
        "Crypto mining":
            [
                Link(url="https://www.cryptobadger.com/build-your-own-ethereum-mining-rig/",
                     desc=i18n_cfg['links_crypto_mining_desc'][g.lang_code],
                     ),
                Link(url="https://www.nanopool.org/",
                     desc="Nanopool",
                     ),
                Link(url="https://phoenixminer.info/downloads/",
                     desc="PhoenixMiner",
                     ),
            ],
        "HTML":
            [
                Link(url="https://getbootstrap.com/",
                     desc="Bootstrap",
                     ),
                Link(url="https://fontawesome.com/",
                     desc="Fontawesome",
                     ),
            ],

    }
    return render_template("links.html", link_data=link_data)


@app.route("/.config/nginx/nginx.conf")
def nginx_conf():
    """Generates configuration file for main server"""
    return render_template("nginx/nginx.conf", ERROR_CONFIG=ERROR_CONFIG)


@app.route("/.config/nginx/servers.conf")
def servers_conf():
    """Generates configuration files for servers"""
    upstreams = config("upstreams")
    return render_template("nginx/servers.conf", default_lang_code="en", upstreams=upstreams)


@app.route("/.config/supervisor/neirapinuela.conf")
def supervisor_conf():
    """Generates configuration file for supervisor, so backend runs allowing auth"""
    user = os.environ.get("USER")
    conda_path = os.environ.get("CONDA_PREFIX")
    pwd = os.environ.get("PWD")
    directory = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    program_name = "neirapinuela.es"
    return render_template("supervisor/neirapinuela.conf", user=user, directory=directory, conda_path=conda_path,
                           program_name=program_name)


@app.route("/<lang_code>/spa/<path:url>")
def iframe_page(url):
    src = url
    return render_template("spa.html", src=src)


if __name__ == '__main__':
    gettrace = sys.gettrace()
    # Check for debugging, if so run debug server
    if gettrace:
        app.run(port=config("dev_port", 5000), host="127.0.0.1", debug=True)
    else:
        http_server = WSGIServer(('', config("port", 5000)), app)
        http_server.serve_forever()
