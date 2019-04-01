import os
import sys
PACKAGE_HOME, file = os.path.split(__file__)
sys.path.insert(0, PACKAGE_HOME)
from . api import api_bp
from . basic_db_auth import BasicDBAuth
from . db_model import db, User
from . config import config, get_db_uri
from flask import Flask, send_from_directory, send_file


TEMPLATE_FOLDER = 'templates'
STATIC_FOLDER = 'static'


def create_app():
    app = Flask(__name__, template_folder=TEMPLATE_FOLDER,static_url_path='/',static_folder=STATIC_FOLDER)
    app.config['SQLALCHEMY_DATABASE_URI'] = get_db_uri()
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['BASIC_AUTH_FORCE'] = True

    if int(config['Log']['debug']):
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
        app.config['SQLALCHEMY_ECHO'] = True

    # Init DB
    # with app.app_context():
    db.app = app
    db.init_app(app)
    db.create_all()

    # Init Basic DB Auth
    BasicDBAuth(app)

    # Register Blueprints
    app.register_blueprint(api_bp, url_prefix='/api')

    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    @app.route('/<path:path>')
    def static_file(path):
        return app.send_static_file(path)

    return app
