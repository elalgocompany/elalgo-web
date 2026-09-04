import crypto from "crypto";


export function generateStableAdvisorKey(
  userId: string,
  accountNumber: string
) {
  const secret =
    process.env.ADVISOR_KEY_SECRET;


  if (!secret) {
    throw new Error(
      "ADVISOR_KEY_SECRET is not configured."
    );
  }


  const normalizedUserId =
    userId.trim();


  const normalizedAccountNumber =
    accountNumber.trim();


  if (!normalizedUserId) {
    throw new Error(
      "User ID is required."
    );
  }


  if (!normalizedAccountNumber) {
    throw new Error(
      "MetaTrader account number is required."
    );
  }


  const payload =
    `${normalizedUserId}:${normalizedAccountNumber}`;


  const digest =
    crypto
      .createHmac(
        "sha256",
        secret
      )
      .update(
        payload
      )
      .digest(
        "hex"
      );


  return (
    `ela_adv_${digest}`
  );
}


export function hashAdvisorKey(
  advisorKey: string
) {
  return crypto
    .createHash(
      "sha256"
    )
    .update(
      advisorKey
    )
    .digest(
      "hex"
    );
}