import { verifyAuthToken } from "../../../utils/authTokens";
import { AppError } from "../../../utils/AppError";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendSuccess } from "../../../utils/apiResponse";

export const verifyResetPasswordToken = asyncHandler(async (req, res) => {
  const { token } = req.body;

  try {
    verifyAuthToken(token, "password-reset");
  } catch (error) {
    throw new AppError("Token verification failed", 403, "INVALID_RESET_TOKEN");
  }

  return sendSuccess(res, null, 200, "Token is valid");
});
