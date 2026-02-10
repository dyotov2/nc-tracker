# Email Notification Setup Guide

The NC Tracker system can send email notifications when:
- A non-conformance is assigned to someone
- The status of an assigned NC changes

## Quick Setup (Gmail)

### Step 1: Generate App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Select **Security** from the left menu
3. Under "How you sign in to Google," select **2-Step Verification** (you must enable this first if not already enabled)
4. At the bottom, select **App passwords**
5. Select **Mail** as the app and **Other** as the device
6. Name it "NC Tracker" and click **Generate**
7. Copy the 16-character password shown

### Step 2: Configure Environment Variables

1. In the `backend` folder, create a file named `.env` (copy from `.env.example`):

```bash
cd C:\Users\dyotov\Desktop\nc-tracker\backend
copy .env.example .env
```

2. Edit the `.env` file with your details:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

**Important:** Replace with your actual Gmail address and the app password you generated.

### Step 3: Restart Backend Server

Stop the backend server (Ctrl+C) and start it again:

```bash
npm start
```

### Step 4: Test Email Notifications

1. Create a new NC or edit an existing one
2. Fill in:
   - **Responsible Person**: Name of the person
   - **Responsible Person Email**: Their email address
3. Save the NC
4. The person should receive an email notification!

## Other Email Providers

### Microsoft Outlook/Office 365

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Yahoo Mail

1. Enable "Allow apps that use less secure sign in" in Yahoo security settings
2. Use these settings:

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-password
```

### Custom SMTP Server

If you have a custom SMTP server:

```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
EMAIL_USER=nc-tracker@yourdomain.com
EMAIL_PASSWORD=your-password
```

## Troubleshooting

### Emails Not Sending

1. **Check backend terminal for errors**: Look for messages like "Error sending email"

2. **Verify credentials**:
   - Ensure EMAIL_USER and EMAIL_PASSWORD are correct
   - For Gmail, make sure you're using an App Password, not your regular password

3. **Check spam folder**: Sometimes notifications end up in spam

4. **Test SMTP connection**: The system will log connection errors in the backend console

5. **Firewall/Network**: Ensure port 587 (or 465 for SSL) is not blocked

### Common Error Messages

**"Invalid login"**
- Gmail: Use an App Password, not your regular password
- Yahoo: Enable "less secure apps" in security settings

**"Connection timeout"**
- Check firewall settings
- Verify SMTP_HOST and SMTP_PORT are correct

**"Self signed certificate"**
- For custom SMTP servers, you may need to add SSL certificate configuration

## Email Templates

The system sends HTML emails with:
- NC details (title, status, severity, department)
- Direct link to view the NC in the dashboard
- Professional formatting with your organization colors

## Disabling Email Notifications

If you want to use the system without email notifications:
- Simply don't fill in the "Responsible Person Email" field
- Or don't create the `.env` file
- The system will continue to work normally, just without sending emails

## Security Notes

- **Never commit the `.env` file to version control**
- The `.env` file should only be on your server
- Use App Passwords instead of regular passwords when possible
- Keep your email credentials secure

## For Production Deployment

When deploying to production:
1. Set environment variables on your server (don't use .env file)
2. Use a dedicated email account for the NC Tracker
3. Consider using a transactional email service like SendGrid or AWS SES for better reliability
4. Set up DKIM and SPF records to prevent emails from going to spam
