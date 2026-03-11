from app.extensions import db


class FraudPattern(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pattern = db.Column(db.Text, nullable=False)
    risk = db.Column(db.Integer, default=80)