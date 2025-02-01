import { createPublicKey } from "crypto";


const getPublicKey = async () => {
  

  const x5c=
    "MIIClzCCAX8CBgGUvJsCzTANBgkqhkiG9w0BAQsFADAPMQ0wCwYDVQQDDAR0ZXN0MB4XDTI1MDEzMTEzNDI0MloXDTM1MDEzMTEzNDQyMlowDzENMAsGA1UEAwwEdGVzdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKj7HnFYr9BTI7NPFdXhPMGu/V2Q609xazjXudPzG/YLsQUztYKngZQOjhLWbwHGGIWMe0kEGU8/3+OWt97ysLtdSmXNFK+OwIMw6GsKMofdj+a+Tjrwg/JTuPU1qElCn/42dllAPH4e8Y4In9HtXInhJodeEkOhyck4Yk6NG1TMiHJjo+eUz++d2MU2EedF+7Rru9MLPUx7GBE2TEDHPpWMrub2XnqjSU9f/F7Ik9TGQdeY9AoybvSmC/f5BE0Xnxbmy6cLvYucxdU1vqJkLvb2mZtHEgfYHPdECtOE9r1Uhr8gxMKg73zDbeFjGrKf0ZEM+f8uBKYz7UpFKmzsFykCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEAIM7CVIBMyi3V1RpoEWNzLlSCBlX/fTENd+SF5SEk84MhrF0oUTFBytMQ/B0zyDfyo3fSF3+IezND2d/JAW0liy+XheFoYtF1x7lSMx5Kh5CuvfFGD6ar5QjdI5SNdHPn87GjiaNXNzlCLs+QRxrULR7Lgek38kOoyyLzDBzBNnlzDhwApqcnM+YeH4V3srsOLyOA89SKRIFQlbAG+cdzBRoyNqU2X7+SOqohTp+fMqzxHVMiwP8qAAymcO5kZQ/AimilzgaWPnbXVOM47nS61rRFhh0AcJrnZ99197Y/TdMaTDdHkR9B8mwUMIzf7dGrXlXcwrkX7HpbzcEc6m71pg==";
  

  const cert = `-----BEGIN CERTIFICATE-----\n${x5c}\n-----END CERTIFICATE-----`; // pem 형식으로 변환
  console.log("🔹 인증서 (cert):", cert);

  const publicKeyObj = createPublicKey(cert);
  console.log("🔹 공개키 객체 (createPublicKey 응답):", publicKeyObj);

  const exportedKey = publicKeyObj.export({ type: "spki", format: "pem" });
  console.log("🔹 내보낸 키 (export 응답):", exportedKey);

  const publicKey = exportedKey.toString();
  console.log("🔹 최종 공개키 문자열 (toString 응답):", publicKey);

  return publicKey;
};

getPublicKey();
