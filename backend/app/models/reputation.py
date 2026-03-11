from app.extensions import db

class Reputation(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    # phone or url
    type = db.Column(db.String(20))

    # phone number or url
    value = db.Column(db.String(255), unique=True)

    # how many users reported
    reports = db.Column(db.Integer, default=1)

    # calculated risk boost
    reputation_score = db.Column(db.Integer, default=0)