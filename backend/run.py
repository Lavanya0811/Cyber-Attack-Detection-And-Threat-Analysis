import os
from app.main import create_app
from app.services.user_service import create_user_table

app = create_app()

# 🔥 create users table
with app.app_context():
    create_user_table()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))