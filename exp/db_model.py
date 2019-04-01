from flask import current_app
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)
    name = db.Column(db.String(160), nullable=False)
    budget_groups = db.relationship('Budget_group', backref='user', lazy=True)
    budget = db.relationship('Budget', backref='user', lazy=True)
    loan_groups = db.relationship('Loan_group', backref='user', lazy=True)
    loan = db.relationship('Loan', backref='user', lazy=True)

    # def __repr__(self):
    #    return '<User %r>' % self.username


class Budget_group(db.Model):
    __table_args__ = (db.UniqueConstraint('name', 'direction',
                                          name='unique_component_commit'),)
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(
        'user.id'), nullable=False)
    direction = db.Column(db.String(3), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    budget = db.relationship('Budget', backref='budget_group', lazy=True)


class Budget(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    budget_group_id = db.Column(db.Integer, db.ForeignKey(
        'budget_group.id'), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)


class Loan_group(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    direction = db.Column(db.String(3), nullable=False)
    name = db.Column(db.String(80), nullable=False)
    active = db.Column(db.Boolean, nullable=False)
    loan = db.relationship('Loan', backref='loan_group', lazy=True)


class Loan(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    loan_group_id = db.Column(db.Integer, db.ForeignKey(
        'loan_group.id'), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)
