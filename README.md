# Neirapinuela.es site code
Code for generating [neirapinuela.es](https://www.neirapinuela.es) website and its nginx configuration.

Uses frozen-flask for generating a static website under build directory.

* Run `build.py` to generate code for the site
* Point nginx root directory (using root directive inside server directive) to point to build directory
* Include `build/.config/nginx/nginx.conf` in the nginx configuration so i18n pages and custom error pages work properly
* i18n translations are included in `i18n_translations.yaml`. Currently, only `en` and `es` translations are available.
