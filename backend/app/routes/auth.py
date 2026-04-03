from flask import Blueprint, request, jsonify
from app.services.user_service import create_user, get_user_by_email
import bcrypt

auth_bp = Blueprint("auth", __name__)

# temporary dummy user
users = {
    "test@gmail.com": "123456"
}

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    success = create_user(email, password)

    if not success:
        return jsonify({"error": "User already exists"}), 400

    return jsonify({"message": "Signup success"}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = get_user_by_email(email)

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    stored_password = user[2]  # password column

    if not bcrypt.checkpw(password.encode('utf-8'), stored_password):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login success",
        "token": "dummy-token"
    }), 200
