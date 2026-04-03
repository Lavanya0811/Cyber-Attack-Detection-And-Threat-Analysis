import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
} from "@mui/material";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";

import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function Dashboard() {
  // ================= STATES =================
  const [textSuggestions, setTextSuggestions] = useState([]);
  const [voiceSuggestions, setVoiceSuggestions] = useState([]);
  const [urlSuggestions, setUrlSuggestions] = useState([]);
  const [urlConfidence, setUrlConfidence] = useState(0);
  const [phoneConfidence, setPhoneConfidence] = useState(0);

  const [textConfidence, setTextConfidence] = useState(0);
  const [voiceConfidence, setVoiceConfidence] = useState(0);
  const [text, setText] = useState("");

  const [url, setUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [voiceText, setVoiceText] = useState("");

  const [textRisk, setTextRisk] = useState(0);
  const [urlRisk, setUrlRisk] = useState(0);
  const [phoneRisk, setPhoneRisk] = useState(0);
  const [voiceRisk, setVoiceRisk] = useState(0);

  const [textReasons, setTextReasons] = useState([]);
  const [urlReasons, setUrlReasons] = useState([]);
  const [phoneReasons, setPhoneReasons] = useState([]);
  const [voiceReasons, setVoiceReasons] = useState([]);

  const [textSeverity, setTextSeverity] = useState("");
  const [urlSeverity, setUrlSeverity] = useState("");
  const [phoneSeverity, setPhoneSeverity] = useState("");
  const [voiceSeverity, setVoiceSeverity] = useState("");

  const [fraudAlert, setFraudAlert] = useState(null);
  const [history, setHistory] = useState([]);

  const [language, setLanguage] = useState("en-IN");
  const [liveAlerts, setLiveAlerts] = useState([]);

  const [textExplain, setTextExplain] = useState({});
  const [voiceExplain, setVoiceExplain] = useState({});
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const [trendData, setTrendData] = useState([]);
  const [riskDistribution, setRiskDistribution] = useState({});

  const [learningStats, setLearningStats] = useState(0);

  // ================= LOAD HISTORY =================
  useEffect(() => {
    loadHistory();
    loadLiveAlerts();
    loadLearning(); // ✅ move here

    const interval = setInterval(() => {
      loadLiveAlerts();
    }, 15000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/";
    }
  }, []);

  const loadHistory = async () => {
    try {
      const userId = localStorage.getItem("user_id"); // 🔥 ADD THIS

      const res = await axios.get(
        "https://cyber-attack-detection-and-threat-fnth.onrender.com/fraud/history",
        {
          params: { user_id: userId }, // 🔥 ADD THIS
        },
      );

      setHistory(res.data);
    } catch {
      console.log("History error");
    }
  };
  const loadLiveAlerts = async () => {
    try {
      const res = await axios.get(
        "https://cyber-attack-detection-and-threat-fnth.onrender.com/fraud/alerts",
      );
      setLiveAlerts(res.data);

      if (res.data.length > 0) {
        setFraudAlert({
          severity: "Critical",
          reasons: ["Real-time fraud activity detected"],
        });
      }
    } catch {}
  };
  const loadLearning = async () => {
    const res = await axios.get(
      "https://cyber-attack-detection-and-threat-fnth.onrender.com/fraud/learning-stats",
    );
    setLearningStats(res.data.patterns_learned);
  };
  const loadTrend = async () => {
    const res = await axios.get(
      "https://cyber-attack-detection-and-threat-fnth.onrender.com/fraud/trend",
    );
    setTrendData(res.data);
  };

  const loadRiskDistribution = async () => {
    const res = await axios.get(
      "https://cyber-attack-detection-and-threat-fnth.onrender.com/fraud/risk-distribution",
    );
    setRiskDistribution(res.data);
  };

  useEffect(() => {
    loadTrend();
    loadRiskDistribution();
  }, [history]);
  // ================= TEXT =================
  const analyzeText = async () => {
    const userId = localStorage.getItem("user_id");
    const res = await axios.post(
      "https://cyber-attack-detection-and-threat-fnth.onrender.com/fraud/text",
      { text, user_id: userId },
    );

    setTextRisk(res.data.risk);
    setTextReasons(res.data.reasons || []);
    setTextSeverity(res.data.severity || "");
    setTextSuggestions(res.data.suggestions || []);
    setTextConfidence(res.data.confidence ?? res.data.risk);
    setTextExplain(res.data.explanation || {});

    if (res.data.risk >= 60) setFraudAlert(res.data);
    loadHistory();
  };

  // ================= URL =================
  const analyzeUrl = async () => {
    const userId = localStorage.getItem("user_id");
    const res = await axios.post(
      "https://cyber-attack-detection-and-threat-fnth.onrender.com/fraud/url",
      { url, user_id: userId },
    );

    setUrlRisk(res.data.risk);
    setUrlReasons(res.data.reasons || []);
    setUrlSeverity(res.data.severity || "");
    setUrlSuggestions(res.data.suggestions || []);
    setUrlConfidence(res.data.confidence ?? res.data.risk);

    loadHistory();
  };

  // ================= PHONE =================
  const analyzePhone = async () => {
    const userId = localStorage.getItem("user_id");
    const res = await axios.post(
      "https://cyber-attack-detection-and-threat-fnth.onrender.com/fraud/phone",
      { phone, user_id: userId },
    );

    setPhoneRisk(res.data.risk);
    setPhoneReasons(res.data.reasons || []);
    setPhoneSeverity(res.data.severity || "");
    setPhoneConfidence(res.data.confidence ?? res.data.risk);

    loadHistory();
  };
  // ================= VOICE =================
  const startVoice = () => {
    const userId = localStorage.getItem("user_id");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
    }

    const recognition = recognitionRef.current;

    recognition.lang = language; // te-IN or en-IN
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      setIsRecording(false);
    };

    recognition.onresult = async (event) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }

      transcript = transcript.trim();

      if (!transcript) return;

      console.log("Final Transcript:", transcript);

      setVoiceText(transcript);

      try {
        const res = await axios.post(
          "https://cyber-attack-detection-and-threat-fnth.onrender.com/fraud/voice",
          { text: transcript, user_id: userId },
        );

        setVoiceRisk(res.data.risk);
        setVoiceReasons(res.data.reasons || []);
        setVoiceSeverity(res.data.severity || "");
        setVoiceSuggestions(res.data.suggestions || []);
        setVoiceConfidence(res.data.confidence ?? res.data.risk);
        setVoiceExplain(res.data.explanation || {});

        if (res.data.risk >= 60) setFraudAlert(res.data);

        loadHistory();
      } catch (err) {
        console.error("Voice API error:", err);
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopVoice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const resetVoice = () => {
    stopVoice();
    setVoiceText("");
    setVoiceRisk(0);
    setVoiceReasons([]);
    setVoiceSeverity("");
    setVoiceSuggestions([]);
    setVoiceConfidence(0);
    setVoiceExplain({});
  };
  // ================= REPORT =================
  const reportFraud = async (value, type = "text") => {
    try {
      if (!value) return;

      const res = await axios.post(
        "https://cyber-attack-detection-and-threat-fnth.onrender.com/fraud/learn",
        { text: value, type },
      );

      console.log(res.data);
      alert("Fraud saved");
    } catch (err) {
      console.error("REPORT ERROR:", err);
    }
  };

  // ================= GRAPH =================
  const graphData = {
    labels: trendData.map((_, i) => `T${i + 1}`),
    datasets: [
      {
        label: "High Risk Activity",
        data: trendData,
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };
  const distributionData = {
    labels: ["Low", "Medium", "High", "Critical"],
    datasets: [
      {
        label: "Risk Distribution",
        data: [
          riskDistribution.low || 0,
          riskDistribution.medium || 0,
          riskDistribution.high || 0,
          riskDistribution.critical || 0,
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Box
      sx={{
        background: "#0f172a",
        minHeight: "100vh",
        p: 4,
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* HEADER */}
      <Typography variant="h4" sx={{ color: "#38bdf8", mb: 1 }}>
        🚨 AI Fraud Intelligence Platform
      </Typography>
      <Button
        variant="contained"
        color="error"
        sx={{ float: "right" }}
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/";
        }}
      >
        Logout
      </Button>

      <Typography sx={{ color: "#22c55e", mb: 4 }}>
        System learned {learningStats} fraud patterns
      </Typography>

      {/* ================= ROW 1 ================= */}
      <Grid container spacing={3} sx={{ mb: 3, alignItems: "stretch" }}>
        <Grid item xs={12} sm={6} lg={6}>
          <Card sx={{ background: "#1e293b", borderRadius: 3, height: "360" }}>
            <CardContent>
              <Typography color="white" variant="h6" mb={2}>
                Text Detection
              </Typography>

              <TextField
                fullWidth
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setTextRisk(0);
                  setTextExplain({});
                }}
                sx={{ mt: 2, background: "white" }}
              />
              <Button sx={{ mt: 2 }} variant="contained" onClick={analyzeText}>
                Analyze
              </Button>
              <Button
                sx={{ mt: 2, ml: 1 }}
                onClick={() => {
                  setText("");
                  setTextRisk(0);
                  setTextReasons([]);
                  setTextSuggestions([]);
                  setTextSeverity("");
                  setTextConfidence(0);
                }}
              >
                Reset
              </Button>

              <Typography color="#22c55e">Risk: {textRisk}</Typography>

              <Typography color="orange">{textSeverity}</Typography>

              <Typography color="#38bdf8">Confidence: {textConfidence}%</Typography>

              {textReasons.map((r, i) => (
                <Typography key={i} color="white">
                  • {r}
                </Typography>
              ))}

              {textSuggestions?.map((s, i) => (
                <Typography key={i} color="#22c55e" fontSize={13}>
                  ✔ {s}
                </Typography>
              ))}
              {Object.entries(textExplain).map(
                ([k, v], i) =>
                  v > 0 && (
                    <Typography key={i} color="#38bdf8" fontSize={13}>
                      {k}: {v}
                    </Typography>
                  ),
              )}

              <Button
                sx={{ mt: 2 }}
                color="error"
                variant="contained"
                onClick={() => reportFraud(text, "text")}
              >
                REPORT AS FRAUD
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={6}>
          <Card sx={{ background: "#1e293b", borderRadius: 3, height: "360" }}>
            <CardContent>
              <Typography color="white" variant="h6" mb={2}>
                URL Detection
              </Typography>
              {/* 🔁 PASTE YOUR EXISTING URL MODULE CONTENT HERE */}
              <TextField
                fullWidth
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                sx={{ mt: 2, background: "white" }}
              />
              <Button sx={{ mt: 2 }} onClick={analyzeUrl} variant="contained">
                Check
              </Button>
              <Button
                sx={{ mt: 2, ml: 1 }}
                onClick={() => {
                  setUrl("");
                  setUrlRisk(0);
                  setUrlReasons([]);
                  setUrlSeverity("");
                  setUrlConfidence(0);
                }}
              >
                Reset
              </Button>

              <Typography color="#22c55e">Risk: {urlRisk}</Typography>
              <Typography color="orange">{urlSeverity}</Typography>
              <Typography color="#38bdf8">Confidence: {urlConfidence}%</Typography>

              {urlSuggestions?.map((s, i) => (
                <Typography key={i} color="#22c55e" fontSize={13}>
                  ✔ {s}
                </Typography>
              ))}

              {urlReasons.map((r, i) => (
                <Typography key={i} color="white">
                  • {r}
                </Typography>
              ))}

              <Button
                sx={{ mt: 2 }}
                color="error"
                variant="contained"
                onClick={() => reportFraud(url, "url")}
              >
                REPORT AS FRAUD
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ================= ROW 2 ================= */}
      <Grid container spacing={3} sx={{ mb: 3, alignItems: "stretch" }}>
        <Grid item xs={12} sm={6} lg={6}>
          <Card sx={{ background: "#1e293b", borderRadius: 3, height: "360" }}>
            <CardContent>
              <Typography color="white" variant="h6" mb={2}>
                Phone Detection
              </Typography>
              {/* 🔁 PASTE YOUR EXISTING PHONE MODULE CONTENT HERE */}
              <TextField
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                sx={{ mt: 2, background: "white" }}
              />
              <Button sx={{ mt: 2 }} onClick={analyzePhone} variant="contained">
                Check
              </Button>
              <Button
                sx={{ mt: 2, ml: 1 }}
                onClick={() => {
                  setPhone("");
                  setPhoneRisk(0);
                  setPhoneReasons([]);
                  setPhoneSeverity("");
                  setPhoneConfidence(0);
                }}
              >
                Reset
              </Button>

              <Typography color="#22c55e">Risk: {phoneRisk}</Typography>
              <Typography color="#38bdf8">Confidence: {phoneConfidence}%</Typography>

              <Typography color="orange">{phoneSeverity}</Typography>

              {phoneReasons.map((r, i) => (
                <Typography key={i} color="white">
                  • {r}
                </Typography>
              ))}

              <Button
                sx={{ mt: 2 }}
                color="error"
                variant="contained"
                onClick={() => reportFraud(phone, "phone")}
              >
                REPORT AS FRAUD
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} lg={6}>
          <Card sx={{ background: "#1e293b", borderRadius: 3, height: "360" }}>
            <CardContent>
              <Typography color="white" variant="h6" mb={2}>
                Voice Detection
              </Typography>
              {/* 🔁 PASTE YOUR EXISTING VOICE MODULE CONTENT HERE */}
              <Select
                fullWidth
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                sx={{ mt: 2, background: "white" }}
              >
                <MenuItem value="en-IN">English</MenuItem>
                <MenuItem value="te-IN">Telugu</MenuItem>
              </Select>

              <Button sx={{ mt: 2 }} onClick={startVoice} disabled={isRecording}>
                {isRecording ? "Recording..." : "start"}
              </Button>

              <Button sx={{ mt: 2, ml: 1 }} onClick={stopVoice}>
                Stop
              </Button>

              <Button sx={{ mt: 2, ml: 1 }} onClick={resetVoice}>
                Reset
              </Button>
              <Typography color="white">{voiceText}</Typography>

              <Typography color="#22c55e">Risk: {voiceRisk}</Typography>

              <Typography color="orange">{voiceSeverity}</Typography>

              <Typography color="#38bdf8">Confidence: {voiceConfidence}%</Typography>

              {voiceReasons.map((r, i) => (
                <Typography key={i} color="white">
                  • {r}
                </Typography>
              ))}

              {voiceSuggestions?.map((s, i) => (
                <Typography key={i} color="#22c55e" fontSize={13}>
                  ✔ {s}
                </Typography>
              ))}
              {Object.entries(voiceExplain).map(
                ([k, v], i) =>
                  v > 0 && (
                    <Typography key={i} color="#38bdf8" fontSize={13}>
                      {k}: {v}
                    </Typography>
                  ),
              )}

              <Button
                sx={{ mt: 2 }}
                color="error"
                variant="contained"
                onClick={() => reportFraud(voiceText, "voice")}
              >
                REPORT AS FRAUD
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ================= LIVE FRAUD ================= */}
      {liveAlerts.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 3, alignItems: "stretch", width: "100%" }}>
          <Grid item xs={12}>
            <Card sx={{ background: "#7f1d1d", borderRadius: 3, width: "100%", minHeight: 140 }}>
              <CardContent>
                <Typography color="white" variant="h6" mb={2}>
                  🚨 Live Fraud Monitoring
                </Typography>

                {liveAlerts.map((a, i) => (
                  <Typography key={i} color="white">
                    {a.type} → {a.content}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ================= GRAPH BLOCK ================= */}
      <Grid container spacing={3} sx={{ mb: 3, alignItems: "stretch", width: "100%" }}>
        <Grid item xs={12} md={5}>
          <Card sx={{ background: "#1e293b", borderRadius: 3, p: 3 }}>
            <Typography color="white" variant="h6" mb={3}>
              Fraud Trend Analysis
            </Typography>

            <Box sx={{ height: 200 }}>
              <Line data={graphData} options={{ maintainAspectRatio: false }} />
            </Box>

            <Box sx={{ height: 200, mt: 5 }}>
              <Bar data={distributionData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Card>
        </Grid>

        {/* ================= RECENT ACTIVITY BLOCK ================= */}
        <Grid item xs={12} md={7}>
          <Card
            sx={{
              background: "#1e293b",
              borderRadius: 3,
              p: 3,
              height: "100%",
              maxHeight: 300,
              overflow: "hidden",
            }}
          >
            <Typography color="white" variant="h6" mb={3}>
              Recent Activity
            </Typography>

            <Box sx={{ maxHeight: 500, overflow: "auto" }}>
              {history.map((h, i) => (
                <Box
                  key={i}
                  sx={{
                    background: "#0f172a",
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                  }}
                >
                  <Typography color="#38bdf8">
                    {h.type} → Risk: {h.risk_score}
                  </Typography>
                  <Typography color="white">{h.content}</Typography>
                </Box>
              ))}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
