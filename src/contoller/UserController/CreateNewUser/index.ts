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

  await sendVerificationMail(tempToken, {
    email,
    name: userName,
    userId: user._id.toString(),
  });

  return sendSuccess(res, {
    user_id: user._id,
    verificationToken,
  }, 201);
});
