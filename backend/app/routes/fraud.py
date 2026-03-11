from flask import Blueprint, request, jsonify
import re
from functools import lru_cache
from app.services.ai_fraud import ai_fraud_score
from app.extensions import db
from app.models.fraud_log import FraudLog
from app.models.fraud_pattern import FraudPattern
from app.models.reputation import Reputation


fraud_bp = Blueprint("fraud", __name__, url_prefix="/fraud")
def calculate_reputation_boost(reports):
    if reports < 3:
        return reports * 2
    elif reports < 7:
        return reports * 3
    else:
        return min(40, reports * 4)

# ================= LANGUAGE =================
def detect_language(text):
    if re.search(r'[\u0C00-\u0C7F]', text):
        return "telugu"
    return "english"


# ================= CACHE PATTERNS =================
from functools import lru_cache

@lru_cache(maxsize=1)
def get_patterns():
    return FraudPattern.query.with_entities(
        FraudPattern.pattern,
        FraudPattern.risk
    ).all()


# ================= FRAUD ENGINE =================
def calculate_fraud_score(text):
    text = text.lower()
    score = 0
    ai_score = 0

    authority = any(w in text for w in ["bank", "rbi", "government", "police","company","kyc","బ్యాంక్","ఆర్బీఐ","ప్రభుత్వం","పోలీసులు","సైబర్ సెల్","కోర్టు","ట్రాఫిక్ పోలీసులు " ])
    urgency = any(w in text for w in ["urgent", "immediately", "now","hurry up","అత్యవసరం",  
"తక్షణం",  
"ఇప్పుడే",
"వెంటనే",  
"ఇప్పుడే చేయండి",  
"లేట్ చేయకండి"  ])
    fear = any(w in text for w in ["blocked", "freeze", "legal","crashed","not working","case",
                                   "బ్లాక్","ఫ్రీజ్","ఖాతా నిలిపివేయబడుతుంది","లీగల్","కేసు","పోలీసులు","జైలు","నోటీసు"  ])
    sensitive = any(w in text for w in ["otp", "pin", "password", "cvv","details","pan","aadhar","adhar","expired","lottory"])
    money = any(w in text for w in ["transfer", "send money", "pay","forward","send","lottery","డబ్బు","చెల్లించండి","పేమెంట్","ట్రాన్స్‌ఫర్","నిధులు","జమ చేయండి","వెయ్యండి","గూగుల్ పే","ఫోన్ పే","యూపీఐ" ])
    link = "http" in text or "bit.ly" in text

    if sensitive: score += 40
    if authority: score += 15
    if urgency: score += 10
    if fear: score += 15
    if money: score += 20
    if link: score += 25

    if authority and urgency: score += 20
    if authority and fear: score += 20
    if urgency and money: score += 15
    if fear and sensitive: score += 25
    if authority and sensitive: score += 25
    if authority and urgency and money: score += 30

    if any(w in text for w in ["ఓటిపి", "డబ్బు", "ఖాతా", "బ్యాంక్","otp","OTP","పిన్","కేవైసీ","ఓటీపీ",
"పాస్‌వర్డ్",  
"సీక్రెట్",  
"సివివి",  
"ఖాతా వివరాలు", 
"బ్యాంక్ వివరాలు ", 
"ఆధార్",
"పాన్",  
"డెబిట్ కార్డ్",  
"క్రెడిట్ కార్డ్"  ]):
        score += 40

    if any(w in text for w in ["hello", "hi", "meeting", "office"]):
        score -= 15

    try:
        ai_score = int(ai_fraud_score(text) * 0.15)
        score += ai_score
    except:
        pass

    try:
        for p in get_patterns():
            if p.pattern.lower() in text:
                score += min(p.risk, 40)
    except:
        pass

    return max(0, min(score, 100)), ai_score


# ================= URL =================
def url_risk(url):
    score, keys = 0, []

    if any(x in url for x in ["bit.ly", "tinyurl"]):
        score += 40
        keys.append("short")

    if any(x in url.lower() for x in ["bank", "login", "verify", "kyc"]):
        score += 30
        keys.append("phishing")

    if re.search(r"\d+\.\d+\.\d+\.\d+", url):
        score += 40
        keys.append("ip")

    return score, keys


# ================= PHONE =================
def phone_risk(phone):
    score, keys = 0, []
    phone = phone.strip()

    if not phone.isdigit() or len(phone) != 10:
        score += 40
        keys.append("invalid")

    if len(set(phone)) == 1:
        score += 50
        keys.append("spam")

    return score, list(set(keys))


# ================= SEVERITY =================
def get_severity(score):
    if score < 20: return "Low"
    elif score < 50: return "Medium"
    elif score < 80: return "High"
    return "Critical"


# ================= AUTO LEARN =================
def auto_learn_pattern(text, risk):
    try:
        if risk >= 80:
            if not FraudPattern.query.filter_by(pattern=text).first():
                db.session.add(FraudPattern(pattern=text, risk=60))
                db.session.commit()
                get_patterns.cache_clear()
    except:
        pass


# ================= TRANSLATION =================
def translate_reasons(keys, lang):
    eng = {
        "sensitive": "Sensitive information request detected",
        "authority": "Authority impersonation detected",
        "urgency": "Urgency pressure detected",
        "threat": "Threat or fear tactics detected",
        "money": "Financial pressure detected"
    }

    tel = {
        "sensitive": "OTP లేదా గోప్య సమాచారం అడుగుతున్నారు",
        "authority": "బ్యాంక్ లేదా అధికారిగా నటిస్తున్నారు",
        "urgency": "అత్యవసర ఒత్తిడి ఉంది",
        "threat": "భయపెట్టే ప్రయత్నం ఉంది",
        "money": "డబ్బు ఒత్తిడి ఉంది"
    }

    return [tel[k] if lang == "telugu" else eng[k] for k in keys if k in eng]


# ================= REASONS =================
def generate_reasons(text, lang):
    text_lower = text.lower()
    keys = []

    if any(w in text_lower for w in ["otp", "pin", "password", "cvv", "ఓటిపి"]):
        keys.append("sensitive")

    if any(w in text_lower for w in ["bank", "rbi", "government", "police", "బ్యాంక్"]):
        keys.append("authority")

    if any(w in text_lower for w in ["urgent", "immediately", "now"]):
        keys.append("urgency")

    if any(w in text_lower for w in ["blocked", "freeze", "legal"]):
        keys.append("threat")

    if any(w in text_lower for w in ["transfer", "money", "pay", "డబ్బు"]):
        keys.append("money")

    return translate_reasons(keys, lang), keys


# ================= SUGGESTIONS =================
def generate_suggestions(score, keys, lang):
    eng, tel = [], []

    if score < 20:
        eng.append("Message seems safe.")
        tel.append("సందేశం సురక్షితంగా ఉంది.")
    elif score < 50:
        eng.append("Do not share sensitive data.")
        tel.append("గోప్య సమాచారం ఇవ్వకండి.")
    elif score < 80:
        eng.append("Looks suspicious. Verify first.")
        tel.append("అనుమానాస్పదంగా ఉంది. ముందుగా ధృవీకరించండి.")
    else:
        eng.append("High fraud risk. Avoid responding.")
        tel.append("మోసం ప్రమాదం ఉంది. స్పందించవద్దు.")

    return tel if lang == "telugu" else eng
# ================= TEXT =================
@fraud_bp.route("/text", methods=["POST"])
def analyze_text():
    text = request.json.get("text", "")
    lang = detect_language(text)

    risk, _ = calculate_fraud_score(text)
    severity = get_severity(risk)

    reasons, keys = generate_reasons(text, lang)
    suggestions = generate_suggestions(risk, keys, lang)

    db.session.add(FraudLog(
        type="text",
        content=text,
        risk_score=risk,
        severity=severity,
        reasons="|".join(reasons)
    ))
    db.session.commit()

    auto_learn_pattern(text, risk)

    return jsonify({
        "risk": risk,
        "severity": severity,
        "reasons": reasons,
        "suggestions": suggestions,
        "language": lang
    })
# ================= VOICE =================
@fraud_bp.route("/voice", methods=["POST"])
def analyze_voice():
    text = request.json.get("text", "").strip()

    if not text:
        return jsonify({
            "risk": 0,
            "severity": "Low",
            "reasons": [],
            "suggestions": []
        })

    lang = detect_language(text)

    risk, _ = calculate_fraud_score(text)
    severity = get_severity(risk)

    reasons, keys = generate_reasons(text, lang)
    suggestions = generate_suggestions(risk, keys, lang)

    db.session.add(FraudLog(
        type="voice",
        content=text,
        risk_score=risk,
        severity=severity,
        reasons="|".join(reasons)
    ))
    db.session.commit()

    auto_learn_pattern(text, risk)

    return jsonify({
        "risk": risk,
        "severity": severity,
        "reasons": reasons,
        "suggestions": suggestions,
        "language": lang
    })
def get_reputation_risk(type_, value):
    rep = Reputation.query.filter_by(type=type_, value=value).first()

    if not rep:
        return 0

    # scale based on reports
    return min(rep.reputation_score, 60)
#========================URL=====================
@fraud_bp.route("/url", methods=["POST"])
def analyze_url():

    url = request.json.get("url", "").strip()

    # base rule risk
    base, _ = calculate_fraud_score(url)
    extra, keys = url_risk(url)

    # reputation
    rep = Reputation.query.filter_by(type="url", value=url).first()
    reputation_boost = rep.reputation_score if rep else 0
    reports = rep.reports if rep else 0

    final_risk = min(base + extra + reputation_boost, 100)

    severity = get_severity(final_risk)

    confidence = min(100, 40 + (reports * 6))

    reasons = translate_reasons(keys, "english")

    # ✅ SAVE to history (VERY IMPORTANT)
    db.session.add(FraudLog(
        type="url",
        content=url,
        risk_score=final_risk,
        severity=severity,
        reasons="Reputation boosted" if reports > 0 else "|".join(reasons)
    ))
    db.session.commit()

    return jsonify({
        "risk": final_risk,
        "severity": severity,
        "confidence": confidence,
        "reports": reports,
        "reasons": reasons
    })
#=====================PHONE=====================
@fraud_bp.route("/phone", methods=["POST"])
def analyze_phone():

    phone = request.json.get("phone", "").strip()

    base_risk, keys = phone_risk(phone)

    rep = Reputation.query.filter_by(type="phone", value=phone).first()

    reputation_boost = rep.reputation_score if rep else 0

    final_risk = min(base_risk + reputation_boost, 100)

    severity = get_severity(final_risk)

    reports = rep.reports if rep else 0
    confidence = min(100, 40 + (reports * 6))

    # ✅ ADD THIS BACK
    db.session.add(FraudLog(
        type="phone",
        content=phone,
        risk_score=final_risk,
        severity=severity,
        reasons="Reputation based" if reports > 0 else ""
    ))
    db.session.commit()

    return jsonify({
        "risk": final_risk,
        "severity": severity,
        "confidence": confidence,
        "reports": reports
    })

# ================= HISTORY =================
@fraud_bp.route("/history", methods=["GET"])
def fraud_history():
    logs = FraudLog.query.order_by(FraudLog.id.desc()).limit(20).all()

    return jsonify([
        {
            "type": l.type,
            "content": l.content,
            "risk_score": l.risk_score,
            "severity": l.severity
        } for l in logs
    ])


# ================= ALERTS =================
@fraud_bp.route("/alerts", methods=["GET"])
def fraud_alerts():
    logs = FraudLog.query.filter(FraudLog.risk_score >= 80)\
        .order_by(FraudLog.id.desc()).limit(5).all()

    return jsonify([
        {"type": l.type, "content": l.content, "risk": l.risk_score}
        for l in logs
    ])
# ================= LEARN =====================
@fraud_bp.route("/learn", methods=["POST", "OPTIONS"])
def learn_fraud():

    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json(force=True)

    value = data.get("text", "").strip()
    type_ = data.get("type", "text")

    if not value:
        return jsonify({"error": "Empty"}), 400

    # 🔥 Reputation only for phone and url
    if type_ in ["phone", "url"]:

        rep = Reputation.query.filter_by(type=type_, value=value).first()

        if rep:
            rep.reports += 1
        else:
            rep = Reputation(
                type=type_,
                value=value,
                reports=1
            )
            db.session.add(rep)

        # calculate reputation boost
        rep.reputation_score = calculate_reputation_boost(rep.reports)

        db.session.commit()

        return jsonify({
            "message": "Reputation updated",
            "reports": rep.reports,
            "reputation_score": rep.reputation_score
        })

    # fallback for text / voice
    return jsonify({"message": "Learned successfully"})
# ================= LEARNING STATS =================
@fraud_bp.route("/learning-stats", methods=["GET"])
def learning_stats():
    total = FraudPattern.query.count()
    return jsonify({"patterns_learned": total})
# ================= FRAUD TREND =================
@fraud_bp.route("/trend", methods=["GET"])
def fraud_trend():

    from sqlalchemy import func
    from datetime import datetime, timedelta

    # last 10 time blocks (simple logic)
    logs = FraudLog.query.order_by(FraudLog.id.desc()).limit(100).all()

    trend_data = []

    # divide into 10 blocks
    block_size = max(1, len(logs) // 10)

    for i in range(0, len(logs), block_size):
        block = logs[i:i + block_size]
        high_count = sum(1 for l in block if l.risk_score >= 60)
        trend_data.append(high_count)

    return jsonify(trend_data[:10])
# ================= RISK DISTRIBUTION =================
@fraud_bp.route("/risk-distribution", methods=["GET"])
def risk_distribution():

    try:
        from app.models.fraud_log import FraudLog

        low = FraudLog.query.filter(FraudLog.risk_score < 30).count()

        medium = FraudLog.query.filter(
            FraudLog.risk_score >= 30,
            FraudLog.risk_score < 60
        ).count()

        high = FraudLog.query.filter(
            FraudLog.risk_score >= 60,
            FraudLog.risk_score < 80
        ).count()

        critical = FraudLog.query.filter(
            FraudLog.risk_score >= 80
        ).count()

        return jsonify({
            "low": low,
            "medium": medium,
            "high": high,
            "critical": critical
        })

    except Exception as e:
        print("RISK DISTRIBUTION ERROR:", e)
        return jsonify({"error": str(e)}), 500