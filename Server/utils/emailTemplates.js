const getPasswordResetHTML = (name, resetURL, appName) => {
   
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; background-color: #f4f4f4;">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; border: 1px solid #cccccc; background-color: #ffffff; max-width: 600px;">
                        <tr>
                            <td align="center" style="padding: 40px 0 30px 0; background-color: #00466a;">
                                <h1 style="color: #ffffff; margin: 0; font-family: Arial, sans-serif;">${appName}</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 40px 30px 40px 30px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                                    <tr>
                                        <td style="color: #153643; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold;">
                                            Password Reset Request
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 20px 0 30px 0; color: #555555; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px;">
                                            Hi ${name},
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="color: #555555; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px;">
                                            We received a request to reset the password for your ${appName} account. Please click the button below to set a new password. This link is only valid for 10 minutes.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="padding: 30px 0 30px 0;">
                                            <table border="0" cellspacing="0" cellpadding="0">
                                                <tr>
                                                    <td align="center" style="border-radius: 5px; background-color: #00466a;">
                                                        <a href="${resetURL}" target="_blank" style="font-size: 16px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; display: inline-block; padding: 15px 25px; border-radius: 5px; background-color: #00466a; border: 1px solid #00466a;">
                                                            Reset Your Password
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="color: #555555; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px;">
                                            If you did not request a password reset, please ignore this email or contact support.
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 20px 0 0 0; color: #555555; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px;">
                                            Thanks,<br/>The ${appName} Team
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 30px 30px; background-color: #eeeeee;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                                    <tr>
                                        <td align="center" style="color: #999999; font-family: Arial, sans-serif; font-size: 12px;">
                                            &copy; 2024 ${appName}. All rights reserved.
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};


module.exports = {
    getPasswordResetHTML,
};