from flask import request
from flask_restful import Resource, reqparse, fields, marshal_with, marshal
from sqlalchemy.exc import IntegrityError
from exp.db_model import db, Real
from exp.resources.common import get_user_id

RESOURCE_FIELDS = {
    'id': fields.Integer,
    'name': fields.String,
    'amount': fields.Float
}

parser = reqparse.RequestParser()

parser.add_argument('name', required=True, type=str)
parser.add_argument('amount', required=True, type=float)

class RealCR(Resource):
    def __init__(self):
        self.user_id = get_user_id(request.authorization.username)

    @marshal_with(RESOURCE_FIELDS)
    def get(self):
        return Real.query.filter_by(user_id=self.user_id).all()

    def post(self):
        args = parser.parse_args()
        new = Real(user_id=self.user_id, name=args['name'], amount=args['amount'])
        db.session.add(new)
        db.session.commit()
        return {'message': True}, 201
    

class RealUD(Resource):
    def __init__(self):
        self.user_id = get_user_id(request.authorization.username)

    def delete(self, id):
        Real.query.filter_by(id=id, user_id=self.user_id).delete()
        db.session.commit()
        return None, 204

    def put(self, id):
        args = parser.parse_args()
        to_update = Real.query.filter_by(id=id, user_id=self.user_id).first()
        try:
            to_update.name = args['name']
            to_update.amount = args['amount']
        except AttributeError:
            return {'message': 'No such id'}, 400
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {'message': 'No such real_id'}, 400
        return marshal(to_update, RESOURCE_FIELDS), 201