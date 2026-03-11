from flask import Blueprint, request, jsonify

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

    if email in users:
        return jsonify({"error": "User already exists"}), 400

    users[email] = password
    return jsonify({"message": "Signup success"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if email not in users or users[email] != password:
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login success",
        "token": "dummy-jwt-token"
    }), 200
