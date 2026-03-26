from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.extensions import db

from app.routes.auth import auth_bp
from app.routes.protected import protected_bp
from app.routes.fraud import fraud_bp


def create_app():
    app = Flask(__name__)

    # 🔥 DATABASE CONFIG (VERY IMPORTANT)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///fraud_platform.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    # 🔥 CORS
    CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

    # 🔥 JWT
    app.config["JWT_SECRET_KEY"] = "super-secret-key"
    JWTManager(app)

    # 🔥 ROUTES
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(protected_bp, url_prefix="/user")
    app.register_blueprint(fraud_bp)

    @app.route("/")
    def home():
        return {"message": "AI Fraud Platform Running"}

    return app