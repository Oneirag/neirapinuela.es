from flask import Blueprint, render_template, current_app, abort
from flask_login import login_required, current_user
from flask_babel import _

bp = Blueprint('apps', __name__)


@bp.route('/mecanografia')
def mecanografia():
    return render_template('apps/mecanografia.html')

@bp.route('/geografia')
def geografia():
    return render_template('apps/geografia.html')


@bp.route('/quiz')
def quiz():
    return render_template('apps/quiz.html')


@bp.route('/gas')
def gas():
    return render_template('apps/gas.html')



@bp.route('/euro_coin_game')
def euro_coin_game():
    return render_template('apps/euro_coin_game.html')


@bp.route('/multiplications')
@bp.route('/multiplications/<int:max_value>')
def multiplications(max_value=9):
    return render_template('apps/multiplications.html', max_value=max_value)


@bp.route('/measurements')
@bp.route('/measurements/<kind>')
def measurements(kind='length'):
    from flask_babel import _
    
    kinds = ['length', 'mass', 'capacity']
    translate_kinds = {
        'length': _('Longitud'),
        'mass': _('Masa'),
        'capacity': _('Capacidad')
    }
    
    if kind not in kinds:
        kind = 'length'
        
    units_data = {
        'length': ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'],
        'mass': ['kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg'],
        'capacity': ['kl', 'hl', 'dal', 'l', 'dl', 'cl', 'ml']
    }
    
    return render_template('apps/measurements.html',
                         kind=kind,
                         kinds=kinds,
                         translate_kinds=translate_kinds,
                         units=units_data[kind])


@bp.route('/grafana')
@login_required
def grafana():
    from flask import redirect
    app_config = current_app.config['APPLICATIONS']['grafana']
    if current_user.username not in app_config['members']:
        abort(403)
    return redirect('https://grafana.neirapinuela.es')


@bp.route('/')
def apps_index():
    apps = current_app.config['APPLICATIONS']
    available_apps = []
    
    for app_id, app_config in apps.items():
        if not app_config['requires_login'] or (current_user.is_authenticated and 
                                               current_user.username in app_config['members']):
            available_apps.append({
                'id': app_id,
                'name': app_config['name'],
                'url': app_config['url'],
                'description': app_config['description'],
                'members': app_config['members'],
                'requires_login': app_config['requires_login']
            })
    
    return render_template('apps/index.html', apps=available_apps)