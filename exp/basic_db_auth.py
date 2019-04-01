from flask_basicauth import BasicAuth
from sqlalchemy import func
from . db_model import User


class BasicDBAuth(BasicAuth):
    def __init__(self, app):
        BasicAuth.__init__(self, app)

    def check_credentials(self, username, password):
        res = User.query.filter_by(
            username=username, password=func.md5(password)).count()
        return res
