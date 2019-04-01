from flask import request
from flask_restful import Resource, reqparse, fields, marshal_with, marshal
from sqlalchemy.exc import IntegrityError
from exp.db_model import db, Loan_group, Loan
from exp.resources.common import get_user_id

RESOURCE_FIELDS = {
    'id': fields.Integer,
    'loan_group_id': fields.Integer,
    'date': fields.DateTime,
    'name': fields.String,
    'amount': fields.Float
}

parser = reqparse.RequestParser()
parser.add_argument('loan_group_id', required=True, type=int)
parser.add_argument('date', required=True, type=str)  # to fix type
parser.add_argument('name', required=True, type=str)
parser.add_argument('amount', required=True, type=float)


def check_bg_invalid(user_id, bg_id):
    bg = Loan_group.query.filter_by(
        id=bg_id, user_id=user_id).first()
    if type(bg) is type(None):
        return True
    else:
        return False


class LoanCR(Resource):
    def __init__(self):
        self.user_id = get_user_id(request.authorization.username)

    @marshal_with(RESOURCE_FIELDS)
    def get(self):
        return Loan.query.filter_by(user_id=self.user_id).all()

    def post(self):
        args = parser.parse_args()
        if check_bg_invalid(self.user_id, args['loan_group_id']):
            return {'message': 'User has no such loan group'}, 400
        new = Loan(user_id=self.user_id, loan_group_id=args['loan_group_id'],
                     date=args['date'], name=args['name'], amount=args['amount'])
        db.session.add(new)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {'message': 'No such loan_group_id'}, 400
        return {'message': True}, 201


class LoanUD(Resource):
    def __init__(self):
        self.user_id = get_user_id(request.authorization.username)

    def delete(self, id):
        Loan.query.filter_by(id=id, user_id=self.user_id).delete()
        db.session.commit()
        return None, 204

    def put(self, id):
        args = parser.parse_args()
        if check_bg_invalid(self.user_id, args['loan_group_id']):
            return {'message': 'User has no such loan group'}, 400
        to_update = Loan.query.filter_by(id=id, user_id=self.user_id).first()
        try:
            to_update.loan_group_id = args['loan_group_id']
            to_update.date = args['date']
            to_update.name = args['name']
            to_update.amount = args['amount']
        except AttributeError:
            return {'message': 'No such id'}, 400
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()
            return {'message': 'No such loan_group_id'}, 400
        return marshal(to_update, RESOURCE_FIELDS), 201
