const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const encoding = "base32";

const generateQRcode = async (username) => {
  const { base32: secret } = speakeasy.generateSecret();
  const url = speakeasy.otpauthURL({
    secret,
    label: username,
    issuer: "EduAdmin",
    encoding,
  });
  console.log("🚀 ~ generateQRcode ~ url:", url);
  const qrCodeImage = await qrcode.toDataURL(url);

  return { secret, qrCodeImage };
};

const verifyOTP = (token, secret) => {
  const verified = speakeasy.totp.verify({
    secret,
    encoding,
    token,
  });
  return verified;
};

module.exports = { generateQRcode, verifyOTP };
