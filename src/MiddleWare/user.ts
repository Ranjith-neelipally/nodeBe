import User from "../modals/userModal";
import { AppError } from "../utils/AppError";

export const ValidateUserMiddleware = async (
  req: any,
  res: any,
  next: Function
) => {
  const userId = req.user?.id;

  if (!userId) {
    return next(new AppError("Unauthorized request.", 401, "UNAUTHORIZED"));
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("Unauthorized request.", 401, "UNAUTHORIZED"));
    }

    // attach user for later use (optional but recommended)
    req.user = user;

    return next();
  } catch (error) {
    return next(error);
  }
};
