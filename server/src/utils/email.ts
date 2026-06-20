import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

/**
 * Sends a live OTP verification email to the user.
 * Falls back to console logging if credentials are missing or if the API call fails.
 * 
 * @param toEmail The destination email address
 * @param otp The 6-digit verification code
 * @returns boolean representing whether the email was sent successfully
 */
export const sendOtpEmail = async (toEmail: string, otp: string): Promise<boolean> => {
  const emailUser = process.env.EMAIL_USER;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  // Fallback to console logging if environment configuration is missing
  if (!emailUser || !clientId || !clientSecret || !refreshToken) {
    console.warn('[EMAIL SERVICE] Missing environment variables. Falling back to console log.');
    logOtpToConsole(toEmail, otp);
    return false;
  }

  try {
    const oauth2Client = new OAuth2(
      clientId,
      clientSecret,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });

    const accessTokenRes = await oauth2Client.getAccessToken();
    const accessToken = accessTokenRes.token;

    if (!accessToken) {
      throw new Error('Failed to retrieve OAuth2 access token.');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: emailUser,
        clientId: clientId,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
        accessToken: accessToken
      }
    } as any);

    // Styling the email using a clean, bold, high-contrast Neo-Brutalist theme
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Account</title>
        <style>
          body {
            font-family: 'JetBrains Mono', Courier, monospace, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 40px 20px;
            color: #1a1a1a;
          }
          .container {
            max-width: 500px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 4px solid #000000;
            box-shadow: 8px 8px 0px #000000;
            padding: 30px;
            box-sizing: border-box;
          }
          .header {
            font-size: 24px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            border-bottom: 4px solid #000000;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .description {
            font-size: 16px;
            line-height: 1.5;
            margin-bottom: 25px;
          }
          .otp-box {
            background-color: #ffde4d;
            border: 3px solid #000000;
            box-shadow: 4px 4px 0px #000000;
            padding: 20px;
            text-align: center;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 6px;
            margin-bottom: 25px;
            color: #000000;
          }
          .footer {
            font-size: 12px;
            color: #666666;
            border-top: 2px solid #e5e7eb;
            padding-top: 15px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">RADICAL LEDGER</div>
          <div class="description">
            Hello,<br><br>
            Please use the following 6-digit One-Time Password (OTP) to complete your sign-in / verification process. This code will expire in <strong>5 minutes</strong>.
          </div>
          <div class="otp-box">
            ${otp}
          </div>
          <div class="description" style="font-size: 14px;">
            If you did not request this code, you can safely ignore this email.
          </div>
          <div class="footer">
            Radical Ledger SaaS Invoice & Payroll Platform. &copy; 2026. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Radical Ledger" <${emailUser}>`,
      to: toEmail,
      subject: `[Radical Ledger] Your 6-digit Login OTP is: ${otp}`,
      text: `Your Radical Ledger OTP is: ${otp}. It expires in 5 minutes.`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SERVICE] OTP successfully sent to ${toEmail} via Gmail OAuth2.`);
    return true;
  } catch (error) {
    console.error('[EMAIL SERVICE] Error sending email via OAuth2:', error);
    logOtpToConsole(toEmail, otp);
    return false;
  }
};

/**
 * Helper to log OTP to console as a fallback.
 */
const logOtpToConsole = (toEmail: string, otp: string) => {
  console.log(`\n==========================================`);
  console.log(`[EMAIL SERVICE FALLBACK] Sending OTP to ${toEmail}`);
  console.log(`Your 6-digit verification code is: ${otp}`);
  console.log(`This code will expire in 5 minutes.`);
  console.log(`==========================================\n`);
};

/**
 * Sends a styled invitation email to join a company.
 * Falls back to console logging if email configuration is missing.
 */
export const sendInvitationEmail = async (
  toEmail: string,
  companyName: string,
  inviteToken: string,
  role: string
): Promise<boolean> => {
  const emailUser = process.env.EMAIL_USER;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  const joinLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/create-company?invite_token=${inviteToken}`;

  if (!emailUser || !clientId || !clientSecret || !refreshToken) {
    console.warn('[EMAIL SERVICE] Missing environment variables. Falling back to console log.');
    console.log(`\n==========================================`);
    console.log(`[INVITATION EMAIL FALLBACK] Invitation for ${toEmail}`);
    console.log(`Company: ${companyName} | Role: ${role}`);
    console.log(`Join Link: ${joinLink}`);
    console.log(`==========================================\n`);
    return false;
  }

  try {
    const oauth2Client = new OAuth2(
      clientId,
      clientSecret,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({ refresh_token: refreshToken });
    const accessTokenRes = await oauth2Client.getAccessToken();
    const accessToken = accessTokenRes.token;

    if (!accessToken) {
      throw new Error('Failed to retrieve OAuth2 access token.');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: emailUser,
        clientId,
        clientSecret,
        refreshToken,
        accessToken
      }
    } as any);

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>You're Invited!</title>
        <style>
          body {
            font-family: 'JetBrains Mono', Courier, monospace, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 40px 20px;
            color: #1a1a1a;
          }
          .container {
            max-width: 500px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 4px solid #000000;
            box-shadow: 8px 8px 0px #000000;
            padding: 30px;
            box-sizing: border-box;
          }
          .header {
            font-size: 24px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: -0.5px;
            border-bottom: 4px solid #000000;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .description {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 25px;
          }
          .role-box {
            background-color: #dbeafe;
            border: 3px solid #000000;
            box-shadow: 4px 4px 0px #000000;
            padding: 12px 20px;
            text-align: center;
            font-size: 18px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 25px;
            color: #1e40af;
          }
          .join-btn {
            display: block;
            background-color: #ffde4d;
            border: 3px solid #000000;
            box-shadow: 4px 4px 0px #000000;
            padding: 16px;
            text-align: center;
            font-size: 16px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #000000;
            text-decoration: none;
            margin-bottom: 25px;
          }
          .footer {
            font-size: 12px;
            color: #666666;
            border-top: 2px solid #e5e7eb;
            padding-top: 15px;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">RADICAL LEDGER</div>
          <div class="description">
            Hello,<br><br>
            You've been invited to join <strong>${companyName}</strong> on Radical Ledger as:
          </div>
          <div class="role-box">${role}</div>
          <div class="description" style="font-size: 14px;">
            Click the button below to accept the invitation and join the team.
          </div>
          <a href="${joinLink}" class="join-btn">Accept Invitation →</a>
          <div class="description" style="font-size: 13px; color: #666;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <span style="word-break: break-all; color: #1e40af;">${joinLink}</span>
          </div>
          <div class="footer">
            Radical Ledger SaaS Invoice & Payroll Platform. &copy; 2026. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Radical Ledger" <${emailUser}>`,
      to: toEmail,
      subject: `[Radical Ledger] You're invited to join ${companyName}`,
      text: `You've been invited to join ${companyName} as ${role}. Accept here: ${joinLink}`,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SERVICE] Invitation email sent to ${toEmail} for company "${companyName}".`);
    return true;
  } catch (error) {
    console.error('[EMAIL SERVICE] Error sending invitation email:', error);
    console.log(`\n==========================================`);
    console.log(`[INVITATION EMAIL FALLBACK] Invitation for ${toEmail}`);
    console.log(`Company: ${companyName} | Role: ${role}`);
    console.log(`Join Link: ${joinLink}`);
    console.log(`==========================================\n`);
    return false;
  }
};
