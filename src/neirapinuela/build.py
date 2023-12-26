from flask_frozen import Freezer
from app import app, ERROR_CONFIG


class OngFreezer(Freezer):
    def _generate_all_urls(self):
        for url, endpoint, last_modified in super()._generate_all_urls():
            if not endpoint.startswith("auth."):
                yield url, endpoint, last_modified


freezer = OngFreezer(app)

LANGUAGES = "es", "en"


@freezer.register_generator
def i18n_pages():
    for lang_code in LANGUAGES:
        yield "home", {'lang_code': lang_code}
        for code in ERROR_CONFIG.keys():
            yield "error_page", {'error_code': f"error_{code}.html", 'lang_code': lang_code}


@freezer.register_generator
def measurement_pages():
    for lang_code in LANGUAGES:
        for kind in "longitude", "mass", "volume":
            yield "measure.measurements", {'lang_code': lang_code, "kind": kind}


if __name__ == '__main__':
    freezer.freeze()
