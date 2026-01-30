# Lesson 3: Email Notifications with Nodemailer

## 🎣 Hook: Send Emails from Your API—Confirmations, Notifications, Resets

"Sorry, we didn't receive your application."
"I never got a confirmation email."
"The password reset link never arrived."

Email is the backbone of user communication in web applications. It's how you confirm registrations, send password resets, notify users of activity, and keep them engaged. Yet many developers treat email as an afterthought—something that "just works" until it doesn't.

In this lesson, you'll learn to send emails **properly**: with templates for consistency, proper error handling, development sandboxing, and production-ready patterns. We'll use Nodemailer—the standard Node.js email library—and integrate it with templating engines for beautiful, maintainable emails.

By the end, DevJobs Pro will send welcome emails, application notifications, status updates, and password resets. Your users will always know what's happening with their job search.

---

## 📚 Theory: How Email Sending Works

### The Email Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMAIL SENDING FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────┐                                               │
│   │  Your App   │ "Send welcome email to user@example.com"      │
│   │  (Trigger)  │                                               │
│   └──────┬──────┘                                               │
│          │                                                      │
│          ▼                                                      │
│   ┌─────────────┐                                               │
│   │  Template   │ "Compile HTML with user's name"               │
│   │  Engine     │                                               │
│   └──────┬──────┘                                               │
│          │                                                      │
│          ▼                                                      │
│   ┌─────────────┐                                               │
│   │ Nodemailer  │ "Format MIME message, connect to SMTP"        │
│   │             │                                               │
│   └──────┬──────┘                                               │
│          │                                                      │
│          ▼ SMTP Connection                                      │
│   ┌─────────────┐                                               │
│   │Email Service│ SendGrid, Mailgun, SES, Gmail...              │
│   │   (SMTP)    │                                               │
│   └──────┬──────┘                                               │
│          │                                                      │
│          ▼ Internet delivery                                    │
│   ┌─────────────┐                                               │
│   │ Recipient's │ "Check spam, deliver to inbox"                │
│   │ Mail Server │                                               │
│   └──────┬──────┘                                               │
│          │                                                      │
│          ▼                                                      │
│   ┌─────────────┐                                               │
│   │   Inbox     │ 📧 "Welcome to DevJobs Pro!"                  │
│   │   📬        │                                               │
│   └─────────────┘                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### What is SMTP?

**Simple Mail Transfer Protocol (SMTP)** is the standard protocol for sending emails across the Internet. Think of it like HTTP for email.

```
┌──────────────────────────────────────────────────────────────────┐
│                          SMTP Conversation                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Your Server                              SMTP Server            │
│      │                                         │                 │
│      │ ──── CONNECT to port 587 ─────────────▶│                 │
│      │◀──── 220 Ready ───────────────────────│                  │
│      │                                         │                 │
│      │ ──── EHLO myserver.com ───────────────▶│                 │
│      │◀──── 250 Hello, pleased to meet you ──│                  │
│      │                                         │                 │
│      │ ──── AUTH LOGIN (credentials) ────────▶│                 │
│      │◀──── 235 Authenticated ───────────────│                  │
│      │                                         │                 │
│      │ ──── MAIL FROM: <sender@domain.com> ──▶│                 │
│      │◀──── 250 OK ──────────────────────────│                  │
│      │                                         │                 │
│      │ ──── RCPT TO: <user@example.com> ─────▶│                 │
│      │◀──── 250 OK ──────────────────────────│                  │
│      │                                         │                 │
│      │ ──── DATA ────────────────────────────▶│                 │
│      │◀──── 354 Start mail input ────────────│                  │
│      │                                         │                 │
│      │ ──── (email content) ─────────────────▶│                 │
│      │ ──── . ───────────────────────────────▶│                 │
│      │◀──── 250 Mail queued ─────────────────│                  │
│      │                                         │                 │
│      │ ──── QUIT ────────────────────────────▶│                 │
│      │◀──── 221 Bye ─────────────────────────│                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Email Service Comparison

| Service      | Best For                 | Free Tier               | Ease of Setup |
| ------------ | ------------------------ | ----------------------- | ------------- |
| **Mailtrap** | Development/Testing      | 500 emails/month        | ⭐⭐⭐⭐⭐    |
| **SendGrid** | Production transactional | 100 emails/day          | ⭐⭐⭐⭐      |
| **Mailgun**  | Production, good API     | 5,000 emails/month      | ⭐⭐⭐⭐      |
| **AWS SES**  | High volume, cheap       | 62,000/month (from EC2) | ⭐⭐⭐        |
| **Gmail**    | Testing only             | 500/day (rate limited)  | ⭐⭐          |

### Development vs Production

```
┌────────────────────────────────────────────────────────────────┐
│                    EMAIL ENVIRONMENT STRATEGY                   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   DEVELOPMENT                        PRODUCTION                │
│   ┌──────────────┐                   ┌──────────────┐         │
│   │   Mailtrap   │                   │   SendGrid   │         │
│   │  (Sandbox)   │                   │   Mailgun    │         │
│   │              │                   │   AWS SES    │         │
│   └──────────────┘                   └──────────────┘         │
│         │                                   │                  │
│         ▼                                   ▼                  │
│   ┌──────────────┐                   ┌──────────────┐         │
│   │  Catches all │                   │  Delivers to │         │
│   │  emails for  │                   │  real users  │         │
│   │  inspection  │                   │              │         │
│   └──────────────┘                   └──────────────┘         │
│                                                                │
│   Benefits:                          Benefits:                 │
│   ✓ No accidental emails             ✓ High deliverability    │
│   ✓ Preview formatting               ✓ Bounce handling        │
│   ✓ Test without spam risk           ✓ Analytics              │
│   ✓ Free and easy                    ✓ Scale                  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 💻 Code Examples

### Installation

```bash
npm install nodemailer
npm install -D @types/nodemailer
npm install handlebars  # For templates
```

### Email Configuration

**Environment Variables (.env):**

```env
# Development (Mailtrap)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_password

# Production (SendGrid example)
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=465
# SMTP_USER=apikey
# SMTP_PASS=your_sendgrid_api_key

EMAIL_FROM=noreply@devjobs.com
EMAIL_FROM_NAME=DevJobs Pro
```

**JavaScript:**

```javascript
// src/config/email.js
const nodemailer = require("nodemailer");

const createTransporter = () => {
  // Use different config based on environment
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  return nodemailer.createTransport(config);
};

const transporter = createTransporter();

// Verify connection on startup
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log("✅ Email server connected");
    return true;
  } catch (error) {
    console.error("❌ Email config error:", error.message);
    return false;
  }
};

module.exports = { transporter, verifyEmailConfig };
```

**TypeScript:**

```typescript
// src/config/email.ts
import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

const createTransporter = (): Transporter<SMTPTransport.SentMessageInfo> => {
  const config: SMTPTransport.Options = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_PORT === "465",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  return nodemailer.createTransport(config);
};

export const transporter = createTransporter();

export const verifyEmailConfig = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log("✅ Email server connected");
    return true;
  } catch (error) {
    console.error("❌ Email config error:", (error as Error).message);
    return false;
  }
};
```

### Simple Email Sending

**JavaScript:**

```javascript
// src/services/email.service.js
const { transporter } = require("../config/email");

const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    text, // Plain text fallback
    html, // HTML version
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
};

// Simple usage
const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: "Welcome to DevJobs Pro!",
    text: `Hi ${user.name}, welcome to DevJobs Pro!`,
    html: `<h1>Hi ${user.name}</h1><p>Welcome to DevJobs Pro!</p>`,
  });
};

module.exports = { sendEmail, sendWelcomeEmail };
```

**TypeScript:**

```typescript
// src/services/email.service.ts
import { transporter } from "../config/email";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

interface EmailResult {
  success: boolean;
  messageId: string;
}

interface User {
  email: string;
  name: string;
}

export const sendEmail = async (
  options: EmailOptions,
): Promise<EmailResult> => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
};

export const sendWelcomeEmail = async (user: User): Promise<EmailResult> => {
  return sendEmail({
    to: user.email,
    subject: "Welcome to DevJobs Pro!",
    text: `Hi ${user.name}, welcome to DevJobs Pro!`,
    html: `<h1>Hi ${user.name}</h1><p>Welcome to DevJobs Pro!</p>`,
  });
};
```

### Email Templates with Handlebars

**JavaScript:**

```javascript
// src/services/email.service.js (enhanced)
const path = require("path");
const fs = require("fs").promises;
const Handlebars = require("handlebars");
const { transporter } = require("../config/email");

// Cache compiled templates
const templateCache = new Map();

/**
 * Load and compile email template
 */
const getTemplate = async (templateName) => {
  // Check cache first
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName);
  }

  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "emails",
    `${templateName}.hbs`,
  );

  const templateSource = await fs.readFile(templatePath, "utf-8");
  const compiled = Handlebars.compile(templateSource);

  // Cache for reuse
  templateCache.set(templateName, compiled);

  return compiled;
};

/**
 * Send templated email
 */
const sendTemplatedEmail = async ({ to, subject, template, data }) => {
  const compiledTemplate = await getTemplate(template);
  const html = compiledTemplate(data);

  // Generate plain text from HTML (basic)
  const text = html.replace(/<[^>]*>/g, "").trim();

  return sendEmail({ to, subject, text, html });
};

module.exports = {
  sendEmail,
  sendTemplatedEmail,
  getTemplate,
};
```

**TypeScript:**

```typescript
// src/services/email.service.ts (enhanced)
import path from "path";
import fs from "fs/promises";
import Handlebars, { TemplateDelegate } from "handlebars";
import { transporter } from "../config/email";

// Cache compiled templates
const templateCache = new Map<string, TemplateDelegate>();

/**
 * Load and compile email template
 */
const getTemplate = async (templateName: string): Promise<TemplateDelegate> => {
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName)!;
  }

  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "emails",
    `${templateName}.hbs`,
  );

  const templateSource = await fs.readFile(templatePath, "utf-8");
  const compiled = Handlebars.compile(templateSource);

  templateCache.set(templateName, compiled);

  return compiled;
};

interface TemplatedEmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
}

/**
 * Send templated email
 */
export const sendTemplatedEmail = async (
  options: TemplatedEmailOptions,
): Promise<EmailResult> => {
  const compiledTemplate = await getTemplate(options.template);
  const html = compiledTemplate(options.data);

  const text = html.replace(/<[^>]*>/g, "").trim();

  return sendEmail({
    to: options.to,
    subject: options.subject,
    text,
    html,
  });
};

export { getTemplate };
```

### Email Templates

**Base Layout Template:**

```handlebars
{{! src/templates/emails/layouts/base.hbs }}

<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{subject}}</title>
    <style>
      body {
        font-family:
          -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
          Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        background: #2563eb;
        color: white;
        padding: 20px;
        text-align: center;
        border-radius: 8px 8px 0 0;
      }
      .content {
        background: #f9fafb;
        padding: 30px;
        border: 1px solid #e5e7eb;
      }
      .button {
        display: inline-block;
        background: #2563eb;
        color: white;
        padding: 12px 24px;
        text-decoration: none;
        border-radius: 6px;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        padding: 20px;
        color: #6b7280;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>DevJobs Pro</h1>
    </div>
    <div class="content">
      {{{body}}}
    </div>
    <div class="footer">
      <p>© {{year}} DevJobs Pro. All rights reserved.</p>
      <p>You received this email because you have an account with DevJobs Pro.</p>
    </div>
  </body>
</html>
```

**Welcome Email Template:**

```handlebars
{{! src/templates/emails/welcome.hbs }}
<h2>Welcome, {{name}}! 🎉</h2>

<p>Thanks for joining DevJobs Pro! We're excited to help you find your next
  great opportunity.</p>

<p>Here's what you can do now:</p>
<ul>
  <li>Complete your profile to stand out</li>
  <li>Upload your resume for quick applications</li>
  <li>Browse thousands of developer jobs</li>
  <li>Set up job alerts for new opportunities</li>
</ul>

<a href="{{dashboardUrl}}" class="button">Go to Dashboard</a>

<p>If you have any questions, just reply to this email—we're here to help!</p>

<p>Happy job hunting,<br />The DevJobs Pro Team</p>
```

**Application Received Template:**

```handlebars
{{! src/templates/emails/application-received.hbs }}
<h2>New Application Received! 📬</h2>

<p>Hi {{employerName}},</p>

<p>You've received a new application for <strong>{{jobTitle}}</strong>.</p>

<div
  style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;"
>
  <h3 style="margin-top: 0;">Applicant Details</h3>
  <p><strong>Name:</strong> {{applicantName}}</p>
  <p><strong>Email:</strong> {{applicantEmail}}</p>
  <p><strong>Applied:</strong> {{appliedDate}}</p>
  {{#if coverLetter}}
    <p><strong>Cover Letter:</strong></p>
    <blockquote
      style="border-left: 3px solid #2563eb; padding-left: 15px; color: #4b5563;"
    >
      {{coverLetter}}
    </blockquote>
  {{/if}}
</div>

<a href="{{applicationUrl}}" class="button">View Application</a>

<p>Don't keep great candidates waiting—review this application soon!</p>
```

**Status Update Template:**

```handlebars
{{! src/templates/emails/status-update.hbs }}
<h2>Application Update 📋</h2>

<p>Hi {{applicantName}},</p>

<p>There's an update on your application for
  <strong>{{jobTitle}}</strong>
  at
  <strong>{{companyName}}</strong>.</p>

<div
  style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;"
>
  <p style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Status Changed
    To:</p>
  {{#if (eq status "interview")}}
    <p style="font-size: 24px; color: #059669; font-weight: bold;">🎉 Interview
      Scheduled</p>
  {{else if (eq status "rejected")}}
    <p style="font-size: 24px; color: #dc2626; font-weight: bold;">Application
      Not Selected</p>
  {{else if (eq status "offered")}}
    <p style="font-size: 24px; color: #2563eb; font-weight: bold;">🎊 Offer
      Extended!</p>
  {{else}}
    <p
      style="font-size: 24px; color: #6b7280; font-weight: bold;"
    >{{status}}</p>
  {{/if}}
</div>

{{#if message}}
  <p><strong>Message from employer:</strong></p>
  <blockquote
    style="border-left: 3px solid #2563eb; padding-left: 15px; color: #4b5563;"
  >
    {{message}}
  </blockquote>
{{/if}}

<a href="{{applicationUrl}}" class="button">View Application</a>

<p>Keep up the great work on your job search!</p>
```

**Password Reset Template:**

```handlebars
{{! src/templates/emails/password-reset.hbs }}
<h2>Reset Your Password 🔐</h2>

<p>Hi {{name}},</p>

<p>We received a request to reset your password. Click the button below to
  create a new password:</p>

<a href="{{resetUrl}}" class="button">Reset Password</a>

<p style="color: #6b7280; font-size: 14px;">
  This link will expire in
  {{expiresIn}}
  minutes.
</p>

<p>If you didn't request this, you can safely ignore this email. Your password
  won't change until you create a new one.</p>

<hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />

<p style="color: #6b7280; font-size: 12px;">
  For security, this request was received from
  {{ipAddress}}
  using
  {{userAgent}}. If this wasn't you, please contact support immediately.
</p>
```

### Register Handlebars Helpers

```typescript
// src/config/handlebars.ts
import Handlebars from "handlebars";

// Register custom helpers
Handlebars.registerHelper("eq", (a: unknown, b: unknown) => a === b);

Handlebars.registerHelper("formatDate", (date: Date | string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

Handlebars.registerHelper("uppercase", (str: string) => str.toUpperCase());

export default Handlebars;
```

### Complete Email Service

**TypeScript:**

```typescript
// src/services/email.service.ts (complete)
import path from "path";
import fs from "fs/promises";
import Handlebars from "handlebars";
import { transporter } from "../config/email";
import "../config/handlebars"; // Register helpers

interface EmailResult {
  success: boolean;
  messageId: string;
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface JobApplication {
  id: string;
  jobTitle: string;
  companyName: string;
  applicantName: string;
  applicantEmail: string;
  employerName: string;
  employerEmail: string;
  coverLetter?: string;
  status: string;
}

const BASE_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Cache compiled templates
const templateCache = new Map<string, Handlebars.TemplateDelegate>();

const getTemplate = async (
  templateName: string,
): Promise<Handlebars.TemplateDelegate> => {
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName)!;
  }

  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "emails",
    `${templateName}.hbs`,
  );

  const templateSource = await fs.readFile(templatePath, "utf-8");
  const compiled = Handlebars.compile(templateSource);
  templateCache.set(templateName, compiled);

  return compiled;
};

const sendTemplatedEmail = async (
  to: string,
  subject: string,
  template: string,
  data: Record<string, unknown>,
): Promise<EmailResult> => {
  const compiledTemplate = await getTemplate(template);
  const html = compiledTemplate({ ...data, year: new Date().getFullYear() });
  const text = html.replace(/<[^>]*>/g, "").trim();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent to ${to}: ${subject}`);

  return { success: true, messageId: info.messageId };
};

// ==================== DEVJOBS PRO EMAIL FUNCTIONS ====================

/**
 * Send welcome email on registration
 */
export const sendWelcomeEmail = async (user: User): Promise<EmailResult> => {
  return sendTemplatedEmail(
    user.email,
    "Welcome to DevJobs Pro! 🎉",
    "welcome",
    {
      name: user.name,
      dashboardUrl: `${BASE_URL}/dashboard`,
    },
  );
};

/**
 * Send application received notification to employer
 */
export const sendApplicationReceivedEmail = async (
  application: JobApplication,
): Promise<EmailResult> => {
  return sendTemplatedEmail(
    application.employerEmail,
    `New Application: ${application.jobTitle}`,
    "application-received",
    {
      employerName: application.employerName,
      jobTitle: application.jobTitle,
      applicantName: application.applicantName,
      applicantEmail: application.applicantEmail,
      coverLetter: application.coverLetter,
      appliedDate: new Date().toLocaleDateString(),
      applicationUrl: `${BASE_URL}/employer/applications/${application.id}`,
    },
  );
};

/**
 * Send status update to applicant
 */
export const sendStatusUpdateEmail = async (
  application: JobApplication,
  message?: string,
): Promise<EmailResult> => {
  const subjectMap: Record<string, string> = {
    interview: `🎉 Interview scheduled for ${application.jobTitle}`,
    rejected: `Update on your ${application.jobTitle} application`,
    offered: `🎊 Offer from ${application.companyName}!`,
  };

  return sendTemplatedEmail(
    application.applicantEmail,
    subjectMap[application.status] || `Update: ${application.jobTitle}`,
    "status-update",
    {
      applicantName: application.applicantName,
      jobTitle: application.jobTitle,
      companyName: application.companyName,
      status: application.status,
      message,
      applicationUrl: `${BASE_URL}/applications/${application.id}`,
    },
  );
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  user: User,
  resetToken: string,
  metadata: { ipAddress: string; userAgent: string },
): Promise<EmailResult> => {
  return sendTemplatedEmail(
    user.email,
    "Reset Your Password - DevJobs Pro",
    "password-reset",
    {
      name: user.name,
      resetUrl: `${BASE_URL}/reset-password?token=${resetToken}`,
      expiresIn: 15, // minutes
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
    },
  );
};

/**
 * Send resume viewed notification
 */
export const sendResumeViewedEmail = async (
  user: User,
  viewerCompany: string,
  jobTitle: string,
): Promise<EmailResult> => {
  return sendTemplatedEmail(
    user.email,
    `${viewerCompany} viewed your resume`,
    "resume-viewed",
    {
      name: user.name,
      companyName: viewerCompany,
      jobTitle,
      profileUrl: `${BASE_URL}/profile`,
    },
  );
};
```

### Email with Attachments

```typescript
// Send email with file attachment
export const sendEmailWithAttachment = async (
  to: string,
  subject: string,
  html: string,
  attachments: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>,
): Promise<EmailResult> => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
    attachments: attachments.map((att) => ({
      filename: att.filename,
      content: att.content,
      contentType: att.contentType,
    })),
  };

  const info = await transporter.sendMail(mailOptions);
  return { success: true, messageId: info.messageId };
};
```

---

## 🛠️ Mini-Tutorial: Create Email Service with Templates

Let's build the complete email system step by step.

### Step 1: Create Template Directory Structure

```bash
mkdir -p src/templates/emails
```

### Step 2: Create the Base Template

Create `src/templates/emails/base.hbs` with the layout HTML shown above.

### Step 3: Create Template Partials

```handlebars
{{! src/templates/emails/partials/button.hbs }}
<table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
  <tr>
    <td style="background: #2563eb; border-radius: 6px;">
      <a
        href="{{url}}"
        style="display: inline-block; padding: 12px 24px; color: white; text-decoration: none; font-weight: bold;"
      >
        {{text}}
      </a>
    </td>
  </tr>
</table>
```

### Step 4: Register Partials

```typescript
// src/config/handlebars.ts
import Handlebars from "handlebars";
import fs from "fs";
import path from "path";

// Register partials
const partialsDir = path.join(
  __dirname,
  "..",
  "templates",
  "emails",
  "partials",
);
if (fs.existsSync(partialsDir)) {
  fs.readdirSync(partialsDir).forEach((file) => {
    const partialName = path.basename(file, ".hbs");
    const partialContent = fs.readFileSync(
      path.join(partialsDir, file),
      "utf-8",
    );
    Handlebars.registerPartial(partialName, partialContent);
  });
}

export default Handlebars;
```

### Step 5: Use in Controllers

```typescript
// src/controllers/auth.controller.ts
import { sendWelcomeEmail } from "../services/email.service";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // ... create user logic

    // Send welcome email (don't await - fire and forget)
    sendWelcomeEmail(user).catch((error) => {
      console.error("Failed to send welcome email:", error);
      // Don't fail registration if email fails
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 🏋️ Practice: DevJobs Pro Email Notifications

Implement the email notification system for DevJobs Pro.

### Requirements

1. **Welcome Email** - Sent when user registers
   - Include user's name
   - Link to dashboard
   - List of getting started steps

2. **Application Received** - Sent to employer
   - Applicant details
   - Job title
   - Cover letter preview
   - Link to view full application

3. **Status Update** - Sent to applicant
   - New status with visual indicator
   - Optional message from employer
   - Different styling for interview/rejected/offered

4. **Password Reset** - Sent on reset request
   - Secure token link
   - Expiration notice
   - Security information (IP, browser)

### Implementation Checklist

```typescript
// Test all email functions
describe("Email Service", () => {
  it("should send welcome email", async () => {
    const result = await sendWelcomeEmail({
      id: "123",
      email: "test@example.com",
      name: "John Doe",
    });
    expect(result.success).toBe(true);
  });

  it("should send application received email", async () => {
    // ... test implementation
  });

  it("should send status update email", async () => {
    // ... test implementation
  });

  it("should send password reset email", async () => {
    // ... test implementation
  });
});
```

---

## 🎯 Pro Tips vs Junior Traps

| Pro Tips 🏆                                                  | Junior Traps 🪤                                 |
| ------------------------------------------------------------ | ----------------------------------------------- |
| **Use email queue** (Bull, Agenda) for reliability           | Sending emails synchronously in request handler |
| **Sandbox in development** (Mailtrap)                        | Sending to real emails during development       |
| **Fire and forget** registration emails—don't block response | Awaiting email send before responding to user   |
| **Track bounces and complaints**                             | Ignoring delivery failures                      |
| **Use proper FROM address** on verified domain               | Using gmail.com as FROM (gets flagged as spam)  |
| **Include plain text version**                               | Only sending HTML (some clients can't render)   |
| **Test email rendering** across clients                      | Assuming all clients render the same            |
| **Log email sends** for debugging                            | No logging of email activity                    |

---

## 🔧 5-Minute Debugger

### Problem: "Connection refused" SMTP Error

```
Error: connect ECONNREFUSED 127.0.0.1:25
```

**Causes:**

1. Wrong SMTP host/port
2. Firewall blocking connection
3. SMTP server not running

**Solution:**

```typescript
// Debug connection
console.log("SMTP Config:", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER?.substring(0, 5) + "...",
});

// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Error:", error.message);
  } else {
    console.log("SMTP Ready");
  }
});
```

### Problem: Emails Going to Spam

**Causes:**

1. No SPF/DKIM records
2. Using free email as FROM
3. Spammy content/subject

**Solutions:**

1. Set up SPF/DKIM/DMARC records for your domain
2. Use a verified domain email address
3. Avoid spam trigger words
4. Include unsubscribe link
5. Use reputable email service (SendGrid, etc.)

### Problem: Template Not Rendering

**Symptom:** Email shows raw template syntax.

**Cause:** Template not found or Handlebars error.

**Solution:**

```typescript
// Debug template loading
const getTemplate = async (templateName: string) => {
  const templatePath = path.join(
    __dirname,
    "..",
    "templates",
    "emails",
    `${templateName}.hbs`,
  );

  console.log("Looking for template at:", templatePath);
  console.log("Exists:", fs.existsSync(templatePath));

  // ...
};
```

### Problem: Special Characters Breaking Template

**Symptom:** HTML/JS in user data executes or breaks email.

**Solution:**

```handlebars
{{! Use triple braces for HTML content, double for escaped }}
<p>Name: {{name}}</p>
{{! Escaped (safe) }}
<div>{{{htmlContent}}}</div>
{{! Unescaped (trust only safe data) }}
```

---

## ✅ Definition of Done Checklist

Before moving to the next lesson, ensure you can check all these boxes:

- [ ] Nodemailer configured with SMTP credentials
- [ ] Development emails sandboxed (Mailtrap or similar)
- [ ] Handlebars templates created for all email types
- [ ] Templates include plain text fallback
- [ ] Custom Handlebars helpers registered
- [ ] Welcome email sent on user registration
- [ ] Application received email working
- [ ] Status update email working
- [ ] Password reset email with secure token link
- [ ] Emails don't block request handling (fire and forget)
- [ ] Email errors logged but don't crash app

---

## 🔗 Navigation

| Previous                                                             | Up                                  | Next                                                                      |
| -------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------- |
| [← Lesson 2: Cloudinary Integration](./02-cloudinary-integration.md) | [↑ Module 12 Overview](./README.md) | [Lesson 4: DevJobs Resume System →](./04-devjobs-resume-upload-system.md) |

---

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [Handlebars Guide](https://handlebarsjs.com/guide/)
- [Mailtrap - Email Sandbox](https://mailtrap.io/)
- [SendGrid Node.js Quickstart](https://docs.sendgrid.com/for-developers/sending-email/quickstart-nodejs)
- [Email Best Practices](https://postmarkapp.com/guides/email-best-practices)

---

> **Senior Insight:** "Email reliability is more important than speed. I've seen systems lose customer trust because password reset emails never arrived, or took hours. Use a proper email queue, monitor delivery rates, and always have a fallback plan. And never, ever send real emails during development—one bug can blast your entire user list. Mailtrap saved me from that disaster more than once."
