import { CreateUser } from "src/@types/user";
import User from "../../../modals/userModal";
import { generateToken } from "../../../utils/helpers";
import { sendVerificationMail } from "../../../utils/mail";
import {
  hashEmailCode,
  signEmailVerificationToken,
} from "../../../utils/authTokens";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendSuccess } from "../../../utils/apiResponse";
import { AppError } from "../../../utils/AppError";


export const CreateNewUser = asyncHandler(async (req: CreateUser, res) => {
  const { email, password, userName } = req.body;
  const user = await User.create({
    email,
    password,
    userName,
  });

  const tempToken = generateToken(6);
  const verificationToken = signEmailVerificationToken(
    user._id.toString(),
    await hashEmailCode(tempToken),
  );

  try {
    await sendVerificationMail(tempToken, {
      email,
      name: userName,
      userId: user._id.toString(),
    });
  } catch (error) {
    await User.findByIdAndDelete(user._id);

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      "Email delivery is temporarily unavailable.",
      503,
      "EMAIL_DELIVERY_UNAVAILABLE",
    );
  }

  return sendSuccess(res, {
    user_id: user._id,
    verificationToken,
  }, 201);
});
