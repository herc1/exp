from flask import request
from exp.db_model import User
from flask_restful import fields
import datetime

def get_user_id(username):
    return User.query.filter_by(username=username).first().id

class Date(fields.Raw):
    def format(self,value):
        return value.strftime('%Y-%m-%d')