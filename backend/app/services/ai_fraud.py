from deep_translator import GoogleTranslator


# 🔥 Auto language detection + translation
def translate_to_english(text):
    try:
        translated = GoogleTranslator(source="auto", target="en").translate(text)
        return translated
    except:
        return text


def ai_fraud_score(text):
    if not text:
        return 0

    # 🔥 Step 1: Translate
    text = translate_to_english(text)
    text = text.lower()

    score = 0

    # 🔥 Fraud keywords
    fraud_words = [
        "otp", "password", "pin", "cvv",
        "transfer", "verify", "account",
        "bank", "blocked", "suspended"
    ]

    urgency = ["urgent", "immediately", "now", "quick"]
    fear = ["danger", "illegal", "warning", "problem"]
    reward = ["lottery", "reward", "bonus", "gift"]
    authority = ["rbi", "government", "police"]

    for w in fraud_words:
        if w in text:
            score += 20

    for w in urgency:
        if w in text:
            score += 10

    for w in fear:
        if w in text:
            score += 15

    for w in reward:
        if w in text:
            score += 15

    for w in authority:
        if w in text:
            score += 20

    if "share" in text or "send" in text:
        score += 15

    if "click" in text or "link" in text:
        score += 15

    return min(score, 100)