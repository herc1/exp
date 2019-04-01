import os
import sys
from . config import config, get_db_uri
from . __init__ import create_app


app=create_app()

if __name__ == '__main__':
    app.run(host = config['WEB']['bind_address'],
            port = config['WEB']['web_port'], debug = True)
