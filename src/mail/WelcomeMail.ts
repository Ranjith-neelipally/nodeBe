interface EmailOptions {
  title?: string;
  message: string;
  Otp?: string;
  userName?: string;
  subject?: string;
  button?: string;
}

export const Email = (options: EmailOptions) => {
  const {
    title,
    message = "Wekcome to Research Pal",
    Otp,
    userName,
    subject,
    button,
  } = options;
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body>
        <table
        style="text-align: left; margin: 0 auto; width: 80vw; border-top: 10px solid #616CD5; padding: 20px; background-color: white; font-family: 'Poppins'; border-left: 2px solid #ECEBFF;border-right: 2px solid #ECEBFF;border-bottom: 2px solid #ECEBFF; border-collapse: collapse; height: 30vh;">
        <tr>
            <th style="font-size: 16px;  color: #263757; padding-left: 30px;">
                Hello ${userName}
            </th>
        </tr>
        <tr>
            <th style="font-size: 16px;  color: #263757;padding: 10px 30px;">
                Subject: ${subject}
            </th>
        </tr>
        <tr>
            <td style="font-size: 14px;  color: #65738E;padding:10px 30px; line-height: 30px;">
                ${message}
            </td>
        </tr>

        <tr>
            <td style="font-size: 14px;  color: #65738E;padding:10px 30px; line-height: 30px;">
                 ${Otp ? `<h1>${Otp}</h1>` : `<a href="${button}">Reset Password</a>`}
            </td>
        </tr>
        <tr>
            <td style="font-size: 16px;  color: #65738E;padding-left: 30px;">
                Regards,
            </td>
        </tr>
        <tr>
            <td style="font-size: 16px;  color: #65738E;padding-left: 30px;">
                Team Research Pal
            </td>
        </tr>
    </table>
</body>
</html>`;
};
