import express from "express";
import jwt from "jsonwebtoken";
import { createPublicKey } from "crypto";

const app = express();

const JWKS_URI = `http://113.198.66.77:10213/realms/test/protocol/openid-connect/certs`;

// 🔹 공개 키 가져오기 (한 번만 가져오고 캐싱)
let publicKey: string | null = null;
const getPublicKey = async () => {
  if (publicKey) return publicKey;

  const response = await fetch(JWKS_URI);
  const { keys } = await response.json();
  if (!keys || keys.length === 0) throw new Error("No JWKS keys found");

  // 서명용 키 찾기 (use: "sig" 및 alg: "RS256")
  const signingKey = keys.find(key => key.use === "sig" && key.alg === "RS256");
  if (!signingKey) throw new Error("No signing key found");

  const cert = `-----BEGIN CERTIFICATE-----\n${signingKey.x5c[0]}\n-----END CERTIFICATE-----`; // pem 형식으로 변환
  publicKey = createPublicKey(cert).export({ type: "spki", format: "pem" }).toString();

  return publicKey;
};

// 🔹 간단한 JWT 검증 미들웨어
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const key = await getPublicKey(); // 공개 키 가져오기
    console.log("Token:", token);
    console.log("Public Key:", key);

    const decoded = jwt.verify(token, key, { algorithms: ["RS256"] });
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

app.get("/movies", authenticateToken, (req, res) => {
  res.json({
    message: "Hello World",
    user: req.user,
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
