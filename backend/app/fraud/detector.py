import re

# 🌍 Multilingual fraud keywords
RISK_KEYWORDS = [
    # English
    "otp", "urgent", "verify", "bank", "account", "password",
    "transfer", "blocked", "suspend", "freeze", "security",
    "update", "reactivate", "click", "link", "immediately",

    # Telugu
    "otp ఇవ్వండి", "తక్షణం", "బ్యాంక్", "ఖాతా", "పాస్వర్డ్",
    "బ్లాక్", "సస్పెండ్", "అత్యవసరం",

    # Hindi
    "ओटीपी", "तुरंत", "खाता", "पासवर्ड", "सत्यापित",

    # Tamil
    "ஓடிபி", "அவசரம்", "வங்கி", "கணக்கு",

    # Kannada
    "ಒಟಿಪಿ", "ತಕ್ಷಣ", "ಬ್ಯಾಂಕ್", "ಖಾತೆ"
]


def calculate_risk_score(text):
    text = text.lower()
    score = 0

    for word in RISK_KEYWORDS:
        if word in text:
            score += 20

    return min(score, 100)


# 📞 Phone detection
def check_phone(phone):
    if re.match(r"^[6-9]\d{9}$", phone):
        return {"status": "Valid number", "risk": 10}
    return {"status": "Suspicious phone", "risk": 70}


# 🌐 URL detection
def check_url(url):
    suspicious_words = ["login", "verify", "update", "bank", "secure"]

    score = 0
    for word in suspicious_words:
        if word in url.lower():
            score += 20

    return {"risk": min(score, 100)}
