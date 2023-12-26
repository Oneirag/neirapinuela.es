# Neirapinuela.es site code
Code for generating [neirapinuela.es](https://www.neirapinuela.es) website and its nginx configuration.

Uses frozen-flask for generating a static website under build directory.

* Run `build.py` to generate code for the site
* Point nginx root directory (using root directive inside server directive) to point to build directory
* Include `build/.config/nginx/nginx.conf` in the nginx configuration so i18n pages and custom error pages work properly. For example, replace `<your_user>`by your user name in:
```commandline
server {
    listen   80;
    server_name www.neirapinuela.es neirapinuela.es localhost;
    add_header X-Frame-Options SAMEORIGIN;
    add_header Strict-Transport-Security max-age=63072000;
    return 301 https://$server_name$request_uri;
}


server {
        client_max_body_size 20M;
        listen 443 ssl default_server; 
        server_name www.neirapinuela.es neirapinuela.es;
        include /etc/nginx/include/ssl.include;


        root /home/<your_user>/PycharmProjects/neirapinuela.es/src/neirapinuela/build/;
        include /home/<jour_user>/PycharmProjects/neirapinuela.es/src/neirapinuela/build/.config/nginx/nginx.conf;
}
```
* copy `build/.config/supervisor/neirapinuela.conf` into `/etc/supervisor/conf.d`
* i18n translations are included in `i18n_translations.yaml`. Currently, only `en` and `es` translations are available.
