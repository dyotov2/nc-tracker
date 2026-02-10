const nodemailer = require('nodemailer');

// Email configuration
// NOTE: For production, use environment variables for sensitive data
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'your-email@example.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
};

// Create transporter
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// Send email when NC is assigned
const sendAssignmentEmail = async (nc, assignedTo, assignedToEmail) => {
  if (!assignedToEmail || !isValidEmail(assignedToEmail)) {
    console.log('No valid email provided for assignment notification');
    return;
  }

  const mailOptions = {
    from: EMAIL_CONFIG.auth.user,
    to: assignedToEmail,
    subject: `NC #${nc.id} Assigned to You: ${nc.title}`,
    html: `
      <h2>Non-Conformance Assignment Notification</h2>
      <p>Hello ${assignedTo},</p>
      <p>A non-conformance has been assigned to you:</p>

      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">NC #${nc.id}: ${nc.title}</h3>
        <p><strong>Status:</strong> <span style="color: #3b82f6;">${nc.status}</span></p>
        <p><strong>Severity:</strong> <span style="color: ${getSeverityColor(nc.severity)};">${nc.severity}</span></p>
        <p><strong>Department:</strong> ${nc.department || 'Not specified'}</p>
        <p><strong>Due Date:</strong> ${nc.due_date ? new Date(nc.due_date).toLocaleDateString() : 'Not set'}</p>
        <p><strong>Description:</strong></p>
        <p>${nc.description}</p>
      </div>

      <p>Please review and take appropriate action.</p>
      <p><a href="http://localhost:3000/ncs/${nc.id}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View NC Details</a></p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">This is an automated notification from the NC Tracker system.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Assignment email sent to ${assignedToEmail} for NC #${nc.id}`);
  } catch (error) {
    console.error('Error sending assignment email:', error.message);
    // Don't throw error - continue even if email fails
  }
};

// Send email when NC status changes
const sendStatusChangeEmail = async (nc, assignedTo, assignedToEmail, oldStatus) => {
  if (!assignedToEmail || !isValidEmail(assignedToEmail)) {
    return;
  }

  const mailOptions = {
    from: EMAIL_CONFIG.auth.user,
    to: assignedToEmail,
    subject: `NC #${nc.id} Status Updated: ${nc.status}`,
    html: `
      <h2>Non-Conformance Status Update</h2>
      <p>Hello ${assignedTo},</p>
      <p>The status of NC #${nc.id} assigned to you has been updated:</p>

      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">NC #${nc.id}: ${nc.title}</h3>
        <p><strong>Previous Status:</strong> <span style="color: #6b7280;">${oldStatus}</span></p>
        <p><strong>New Status:</strong> <span style="color: #3b82f6;">${nc.status}</span></p>
        <p><strong>Severity:</strong> <span style="color: ${getSeverityColor(nc.severity)};">${nc.severity}</span></p>
        <p><strong>Department:</strong> ${nc.department || 'Not specified'}</p>
      </div>

      <p><a href="http://localhost:3000/ncs/${nc.id}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View NC Details</a></p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px;">This is an automated notification from the NC Tracker system.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Status change email sent to ${assignedToEmail} for NC #${nc.id}`);
  } catch (error) {
    console.error('Error sending status change email:', error.message);
  }
};

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to get severity color
const getSeverityColor = (severity) => {
  const colors = {
    'Low': '#6b7280',
    'Medium': '#eab308',
    'High': '#f97316',
    'Critical': '#ef4444'
  };
  return colors[severity] || '#6b7280';
};

module.exports = {
  sendAssignmentEmail,
  sendStatusChangeEmail
};
