/**
 * Email Templates
 * Multilingual email templates for the application
 */

export type Language = 'es' | 'en';

export interface ActivationEmailTemplate {
  subject: string;
  greeting: (firstName: string) => string;
  message: string;
  buttonText: string;
  linkInstruction: string;
  expirationNote: string;
  ignoreNote: string;
}

export interface PasswordRecoveryEmailTemplate {
  subject: string;
  greeting: (firstName: string) => string;
  message: string;
  buttonText: string;
  linkInstruction: string;
  expirationNote: string;
  ignoreNote: string;
  securityNote: string;
}

export interface PasswordChangedEmailTemplate {
  subject: string;
  greeting: (firstName: string) => string;
  message: string;
  buttonText: string;
  securityNote: string;
  supportNote: string;
}

export const activationEmailTemplates: Record<
  Language,
  ActivationEmailTemplate
> = {
  es: {
    subject: 'Activa tu cuenta - Livelify',
    greeting: (firstName: string) => `¡Bienvenido a Livelify, ${firstName}!`,
    message:
      'Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente enlace:',
    buttonText: 'Activar mi cuenta',
    linkInstruction:
      'Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:',
    expirationNote: 'Este enlace es válido por 24 horas.',
    ignoreNote: 'Si no solicitaste esta activación, ignora este mensaje.',
  },
  en: {
    subject: 'Activate your account - Livelify',
    greeting: (firstName: string) => `Welcome to Livelify, ${firstName}!`,
    message:
      'Thank you for signing up. To activate your account, click the link below:',
    buttonText: 'Activate my account',
    linkInstruction:
      "If you can't click the button, copy and paste this link into your browser:",
    expirationNote: 'This link is valid for 24 hours.',
    ignoreNote:
      "If you didn't request this activation, please ignore this message.",
  },
};

export const passwordRecoveryEmailTemplates: Record<
  Language,
  PasswordRecoveryEmailTemplate
> = {
  es: {
    subject: 'Recupera tu contraseña - Livelify',
    greeting: (firstName: string) => `Hola ${firstName},`,
    message:
      'Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Para continuar, haz clic en el siguiente enlace:',
    buttonText: 'Restablecer contraseña',
    linkInstruction:
      'Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:',
    expirationNote: 'Este enlace es válido por 1 hora.',
    ignoreNote:
      'Si no solicitaste restablecer tu contraseña, ignora este mensaje.',
    securityNote: 'Por seguridad, nunca compartas este enlace con nadie.',
  },
  en: {
    subject: 'Reset your password - Livelify',
    greeting: (firstName: string) => `Hello ${firstName},`,
    message:
      'We received a request to reset the password for your account. To continue, click the link below:',
    buttonText: 'Reset password',
    linkInstruction:
      "If you can't click the button, copy and paste this link into your browser:",
    expirationNote: 'This link is valid for 1 hour.',
    ignoreNote:
      "If you didn't request to reset your password, please ignore this message.",
    securityNote: 'For security reasons, never share this link with anyone.',
  },
};

export const passwordChangedEmailTemplates: Record<
  Language,
  PasswordChangedEmailTemplate
> = {
  es: {
    subject: 'Tu contraseña ha sido cambiada - Livelify',
    greeting: (firstName: string) => `Hola ${firstName},`,
    message:
      'Te confirmamos que tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.',
    buttonText: 'Iniciar sesión',
    securityNote:
      'Si no realizaste este cambio, contacta inmediatamente a nuestro equipo de soporte.',
    supportNote:
      'Por tu seguridad, te recomendamos usar una contraseña única y fuerte.',
  },
  en: {
    subject: 'Your password has been changed - Livelify',
    greeting: (firstName: string) => `Hello ${firstName},`,
    message:
      'We confirm that your password has been successfully changed. You can now log in with your new password.',
    buttonText: 'Log in',
    securityNote:
      "If you didn't make this change, please contact our support team immediately.",
    supportNote:
      'For your security, we recommend using a unique and strong password.',
  },
};

/**
 * Generates HTML email content for account activation
 */
export function generateActivationEmailHtml(
  firstName: string,
  activationUrl: string,
  language: Language = 'es',
): { subject: string; html: string; text: string } {
  const template = activationEmailTemplates[language];

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">${template.greeting(firstName)}</h2>
      <p style="color: #666; font-size: 16px; line-height: 1.5;">
        ${template.message}
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${activationUrl}"
           style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 16px;">
          ${template.buttonText}
        </a>
      </div>
      <p style="color: #999; font-size: 14px;">
        ${template.linkInstruction}
      </p>
      <p style="color: #666; font-size: 14px; word-break: break-all;">
        ${activationUrl}
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        ${template.expirationNote} ${template.ignoreNote}
      </p>
    </div>
  `;

  const text = `
${template.greeting(firstName)}

${template.message}

${template.buttonText}: ${activationUrl}

${template.expirationNote} ${template.ignoreNote}
  `.trim();

  return {
    subject: template.subject,
    html,
    text,
  };
}

/**
 * Generates HTML email content for password recovery
 */
export function generatePasswordRecoveryEmailHtml(
  firstName: string,
  recoveryUrl: string,
  language: Language = 'es',
): { subject: string; html: string; text: string } {
  const template = passwordRecoveryEmailTemplates[language];

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">${template.greeting(firstName)}</h2>
      <p style="color: #666; font-size: 16px; line-height: 1.5;">
        ${template.message}
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${recoveryUrl}"
           style="background-color: #FF5722; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 16px;">
          ${template.buttonText}
        </a>
      </div>
      <p style="color: #999; font-size: 14px;">
        ${template.linkInstruction}
      </p>
      <p style="color: #666; font-size: 14px; word-break: break-all;">
        ${recoveryUrl}
      </p>
      <div style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
        <p style="color: #856404; font-size: 13px; margin: 0;">
          <strong>⚠️ ${template.securityNote}</strong>
        </p>
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 20px;">
        ${template.expirationNote} ${template.ignoreNote}
      </p>
    </div>
  `;

  const text = `
${template.greeting(firstName)}

${template.message}

${template.buttonText}: ${recoveryUrl}

⚠️ ${template.securityNote}

${template.expirationNote} ${template.ignoreNote}
  `.trim();

  return {
    subject: template.subject,
    html,
    text,
  };
}

/**
 * Generates HTML email content for password changed confirmation
 */
export function generatePasswordChangedEmailHtml(
  firstName: string,
  loginUrl: string,
  language: Language = 'es',
): { subject: string; html: string; text: string } {
  const template = passwordChangedEmailTemplates[language];

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #4CAF50; border-radius: 50%; width: 80px; height: 80px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 48px; color: white;">✓</span>
        </div>
      </div>
      <h2 style="color: #333; text-align: center;">${template.greeting(firstName)}</h2>
      <p style="color: #666; font-size: 16px; line-height: 1.5; text-align: center;">
        ${template.message}
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}"
           style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 16px;">
          ${template.buttonText}
        </a>
      </div>
      <div style="margin-top: 30px; padding: 15px; background-color: #ffebee; border-left: 4px solid #f44336; border-radius: 4px;">
        <p style="color: #c62828; font-size: 13px; margin: 0;">
          <strong>⚠️ ${template.securityNote}</strong>
        </p>
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
        💡 ${template.supportNote}
      </p>
    </div>
  `;

  const text = `
${template.greeting(firstName)}

${template.message}

${template.buttonText}: ${loginUrl}

⚠️ ${template.securityNote}

💡 ${template.supportNote}
  `.trim();

  return {
    subject: template.subject,
    html,
    text,
  };
}
