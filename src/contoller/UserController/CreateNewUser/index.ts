import { CreateUser } from "src/@types/user";
import User from "../../../modals/userModal";
import { asyncHandler } from "../../../utils/asyncHandler";
import { sendSuccess } from "../../../utils/apiResponse";


export const CreateNewUser = asyncHandler(async (req: CreateUser, res) => {
  const { email, password, userName } = req.body;
  const user = await User.create({
    email,
    password,
    userName,
    verified: true,
  });

  // Email verification is temporarily disabled until transactional email is configured.

  return sendSuccess(res, {
    user_id: user._id,
  }, 201, "Account created successfully. You can now sign in.");
});
