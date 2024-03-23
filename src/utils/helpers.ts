export const generateToken = (length: number): string => {
  let token: string = "";
  const digits = "0123456789";
  const digitsLength = digits.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digitsLength);
    token += digits.charAt(randomIndex);
  }

  return token;
};
