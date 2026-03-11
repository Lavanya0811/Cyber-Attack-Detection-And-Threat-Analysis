from app.extensions import db

class FraudLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(20))
    content = db.Column(db.Text)
    risk_score = db.Column(db.Integer)

    # 🔥 new columns
    severity = db.Column(db.String(20))
    reasons = db.Column(db.Text)