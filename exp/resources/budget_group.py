from flask import request
from flask_restful import Resource, reqparse, fields, marshal_with, marshal
from sqlalchemy.exc import IntegrityError
from exp.db_model import db, User, Budget_group
from exp.resources.common import get_user_id

RESOURCE_FIELDS = {
    'id': fields.Integer,
    'name': fields.String,
    'direction': fields.String
}

parser = reqparse.RequestParser()
parser.add_argument('name', required=True, type=str)
parser.add_argument('direction', required=True, choices=('+', '-'))


class BudgetGroupCR(Resource):
    def __init__(self):
        self.user_id = get_user_id(request.authorization.username)

    @marshal_with(RESOURCE_FIELDS)
    def get(self):
        return User.query.filter_by(id=self.user_id).first().budget_groups

    def post(self):
        args = parser.parse_args()
        new = Budget_group(user_id=self.user_id,
                           name=args['name'].capitalize(), direction=args['direction'])
        db.session.add(new)
        try:
            db.session.commit()
        except IntegrityError as err:
            db.session.rollback()
            print(err.__cause__)
            return {'message': str(err.__cause__)}, 400
        return {'message': True}, 201


class BudgetGroupUD(Resource):
    def __init__(self):
        self.user_id = get_user_id(request.authorization.username)

    def delete(self, id):
        Budget_group.query.filter_by(id=id, user_id=self.user_id).delete()
        db.session.commit()
        return None, 204

    def put(self, id):
        args = parser.parse_args()
        bg = Budget_group.query.filter_by(id=id, user_id=self.user_id).first()
        try:
            bg.name = args['name']
            bg.direction = args['direction']
        except AttributeError:
            return {'message': 'No such id'}, 400
        try:
            db.session.commit()
        except IntegrityError as err:
            db.session.rollback()
            print(err.__cause__)
            return {'message': str(err.__cause__)}, 400
        return marshal(bg, RESOURCE_FIELDS), 201
