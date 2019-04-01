import os
import sys
import configparser


CONFIG_NAME = 'config.ini'

config_path = os.path.join(sys.path[0], CONFIG_NAME)
config = configparser.ConfigParser()
config.read(config_path)
config['DEFAULT'] = {'web_port': '5000', 'bind_address': '127.0.0.1', ' db_host': 'localhost', 'db_port': '3306',
                     'db_name': 'expenser', 'db_user': 'expenser', 'db_pass': 1, 'debug': 0}


def get_db_uri():
    return 'mysql+pymysql://'+config['DB']['db_user']+':' + \
        config['DB']['db_pass']+'@'+config['DB']['db_host']+':' + \
        config['DB']['db_port']+'/'+config['DB']['db_name']
