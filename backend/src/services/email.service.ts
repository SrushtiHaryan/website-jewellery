import env from '../config/env';
import { logger } from '../utils/logger';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Email abstraction. In development (or when SMTP is not configured) emails are
 * logged to the console. Swapping in Nodemailer/SendGrid later only touches
 * this file — call sites stay the same.
 */
export interface EmailProvider {
  send(message: EmailMessage): Promise<void>;
}

class ConsoleEmailProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<void> {
    logger.info(`[email:console] To: ${message.to} — ${message.subject}`);
    logger.debug(`[email:console] Body:\n${message.text ?? message.html}`);
  }
}

// Placeholder for a real SMTP provider (Nodemailer). Kept as a stub so the
// architecture is ready without pulling in the dependency prematurely.
class SmtpEmailProvider implements EmailProvider {
  async send(message: EmailMessage): Promise<void> {
    // TODO: integrate Nodemailer using env.email.* when going to production.
    logger.info(`[email:smtp:stub] Would send "${message.subject}" to ${message.to}`);
  }
}

function createProvider(): EmailProvider {
  if (env.email.host && env.email.user) {
    return new SmtpEmailProvider();
  }
  return new ConsoleEmailProvider();
}

const provider = createProvider();

export const emailService = {
  send: (message: EmailMessage) => provider.send(message),

  async sendWelcome(to: string, name: string): Promise<void> {
    await provider.send({
      to,
      subject: 'Welcome to Aurelia',
      html: `<p>Dear ${name},</p><p>Welcome to Aurelia — timeless jewellery, crafted for every story.</p>`,
      text: `Dear ${name}, welcome to Aurelia.`,
    });
  },

  async sendPasswordReset(to: string, resetUrl: string): Promise<void> {
    await provider.send({
      to,
      subject: 'Reset your Aurelia password',
      html: `<p>You requested a password reset.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 30 minutes. If you did not request this, ignore this email.</p>`,
      text: `Reset your password: ${resetUrl} (expires in 30 minutes).`,
    });
  },

  async sendOrderConfirmation(to: string, orderNumber: string, total: number): Promise<void> {
    await provider.send({
      to,
      subject: `Your Aurelia order ${orderNumber} is confirmed`,
      html: `<p>Thank you for your order <strong>${orderNumber}</strong>.</p><p>Total: ₹${total.toLocaleString('en-IN')}</p>`,
      text: `Order ${orderNumber} confirmed. Total: ₹${total}.`,
    });
  },
};
