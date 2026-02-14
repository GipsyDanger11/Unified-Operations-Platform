# Gmail SMTP Setup Guide

This guide will help you configure Gmail SMTP for sending emails from the Unified Operations Platform.

## Prerequisites

- A Gmail account (personal or Google Workspace)
- 2-Step Verification enabled on your Google Account

## Step 1: Enable 2-Step Verification

If you haven't already enabled 2-Step Verification:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "How you sign in to Google", select **2-Step Verification**
3. Follow the prompts to set it up



## Step 2: Generate an App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "How you sign in to Google", select **2-Step Verification**
3. Scroll down to the bottom and select **App passwords**
   - If you don't see this option, make sure 2-Step Verification is enabled
4. In the "Select app" dropdown, choose **Mail**
5. In the "Select device" dropdown, choose **Other (Custom name)**
6. Enter a name like "Unified Operations Platform"
7. Click **Generate**
8. **Copy the 16-character password** (it will look like: `xxxx xxxx xxxx xxxx`)
   - ⚠️ **Important**: You won't be able to see this password again, so copy it now!

## Step 3: Configure in Unified Operations Platform

1. Log in to your Unified Operations Platform workspace
2. Navigate to **Settings** → **Onboarding** → **Communication**
3. Enter the following details:

   | Field | Value |
   |-------|-------|
   | **SMTP Host** | `smtp.gmail.com` (default) |
   | **SMTP Port** | `587` (default, recommended) or `465` |
   | **SMTP User** | Your Gmail address (e.g., `yourname@gmail.com`) |
   | **SMTP Password** | The 16-character App Password you generated |
   | **From Email** | Your Gmail address (e.g., `yourname@gmail.com`) |
   | **From Name** | Your organization name (e.g., `Acme Corp`) |

4. Click **Test Connection** to verify the configuration
5. If successful, click **Save** to activate email sending

## Troubleshooting

### "Invalid credentials" error

- Double-check that you're using the **App Password**, not your regular Gmail password
- Make sure there are no extra spaces when copying the App Password
- Verify that 2-Step Verification is enabled on your Google Account

### "Connection timeout" error

- Check your internet connection
- Verify the SMTP host is `smtp.gmail.com`
- Try using port `465` instead of `587` (and vice versa)
- Check if your firewall is blocking outbound SMTP connections

### Emails not being received

- Check the recipient's spam/junk folder
- Verify the "From Email" matches your Gmail address
- Make sure your Gmail account is in good standing (not suspended)

### "Less secure app access" message

- This is **not needed** when using App Passwords
- App Passwords are the secure, recommended method by Google

## Security Best Practices

✅ **DO:**
- Use App Passwords (never use your main Gmail password)
- Keep your App Password secure and private
- Revoke App Passwords you're no longer using
- Use a dedicated Gmail account for transactional emails (recommended for production)

❌ **DON'T:**
- Share your App Password with anyone
- Commit App Passwords to version control
- Use your personal Gmail account for high-volume sending
- Enable "Less secure app access" (deprecated by Google)

## Gmail Sending Limits

Be aware of Gmail's sending limits:

- **Personal Gmail**: ~500 emails per day
- **Google Workspace**: ~2,000 emails per day

For higher volume needs, consider using a dedicated email service like SendGrid, Mailgun, or Amazon SES.

## Additional Resources

- [Google Account Security](https://myaccount.google.com/security)
- [Google App Passwords Help](https://support.google.com/accounts/answer/185833)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
