import { CreateUser } from "src/@types/user";
import User from "../../../modals/userModal";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendSuccess } from "../../../utils/apiResponse";
import { generateToken } from "../../../utils/helpers";
import {
  hashEmailCode,
  signEmailVerificationToken,
} from "../../../utils/authTokens";
import { sendVerificationMail } from "../../../utils/mail";


export const CreateNewUser = asyncHandler(async (req: CreateUser, res) => {
  const { email, password, userName } = req.body;
  const user = await User.create({
    email,
    password,
    userName,
    verified: false,
  });

  const token = generateToken(6);
  const verificationToken = signEmailVerificationToken(
    user._id.toString(),
    await hashEmailCode(token),
  );

  await sendVerificationMail(token, {
    name: user.userName,
    email: user.email,
    userId: user._id.toString(),
  });

  return sendSuccess(res, {
    user_id: user._id,
    verificationToken,
  }, 201, "Please check your email for verification instructions.");
});
