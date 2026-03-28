import { useState } from "react";
import axios from "axios";

function Fraud() {
  const [sms, setSms] = useState("");
  const [url, setUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState("");

  const checkSMS = async () => {
    const res = await axios.post("http://localhost:5000/fraud/sms", {
      text: sms,
    });
    setResult("SMS Risk: " + res.data.risk_score);
  };

  const checkURL = async () => {
    const res = await axios.post("http://localhost:5000/fraud/url", {
      url: url,
    });
    setResult("URL Risk: " + res.data.risk_score);
  };

  const checkPhone = async () => {
    const res = await axios.post("http://localhost:5000/fraud/phone", {
      phone: phone,
    });
    setResult("Phone Risk: " + res.data.risk_score);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2> Fraud Detection </h2>
      <h3> SMS Check </h3>{" "}
      <input value={sms} onChange={(e) => setSms(e.target.value)} placeholder="Enter SMS" />
      <button onClick={checkSMS}> Check </button>
      <h3> URL Check </h3>{" "}
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter URL" />
      <button onClick={checkURL}> Check </button>
      <h3> Phone Check </h3>{" "}
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone" />
      <button onClick={checkPhone}> Check </button>
      <h2> {result} </h2>{" "}
    </div>
  );
}

export default Fraud;
