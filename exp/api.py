from flask import Blueprint
from flask_restful import Api
from exp.resources.budget_group import BudgetGroupCR
from exp.resources.budget_group import BudgetGroupUD
from exp.resources.budget import BudgetCR
from exp.resources.budget import BudgetUD
from exp.resources.loan_group import LoanGroupCR
from exp.resources.loan_group import LoanGroupUD
from exp.resources.loan import LoanCR
from exp.resources.loan import LoanUD
from exp.resources.real import RealCR
from exp.resources.real import RealUD
from exp.resources.balance import Balance

api_bp = Blueprint('api', __name__)
api = Api(api_bp)
api.add_resource(BudgetGroupCR, '/budget_group')
api.add_resource(BudgetGroupUD, '/budget_group/<id>')
api.add_resource(BudgetCR, '/budget')
api.add_resource(BudgetUD, '/budget/<id>')
api.add_resource(LoanGroupCR, '/loan_group')
api.add_resource(LoanGroupUD, '/loan_group/<id>')
api.add_resource(LoanCR, '/loan')
api.add_resource(LoanUD, '/loan/<id>')
api.add_resource(RealCR, '/real')
api.add_resource(RealUD, '/real/<id>')
api.add_resource(Balance, '/balance')
