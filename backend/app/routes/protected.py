from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

protected_bp = Blueprint("protected", __name__)


@protected_bp.route("/profile")
@jwt_required()
def profile():
    current_user = get_jwt_identity()
    return jsonify({"message": f"Welcome {current_user}"})
