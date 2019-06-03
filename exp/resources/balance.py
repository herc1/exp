from flask import request
from flask_restful import Resource
from sqlalchemy import func
from exp.db_model import db, Budget, Budget_group
from exp.resources.common import get_user_id


class Balance(Resource):
    def __init__(self):
        self.user_id = get_user_id(request.authorization.username)

    def get(self):
        spent_res = db.session.query(func.sum(Budget.amount)).join(
            Budget_group).filter(Budget_group.direction == '-').first()
        if spent_res[0] is None:
            spent = 0
        else:
            spent = float(spent_res[0])
        made_res = db.session.query(func.sum(Budget.amount)).join(
            Budget_group).filter(Budget_group.direction == '+').first()
        if made_res[0] is None:
            made = 0
        else:
            made = float(made_res[0])
        return round(made - spent, 2)
