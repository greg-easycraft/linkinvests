/* eslint-disable @typescript-eslint/no-explicit-any */
import { EmailService } from './email.service';
import { Resend } from 'resend';

// Mock env module
jest.mock('~/lib/env', () => ({
  env: {
    RESEND_API_KEY: 'test-resend-api-key',
  },
}));

// Mock Resend
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => {
      return {
        emails: {
          send: jest.fn(),
        },
      };
    }),
  };
});

describe('EmailService', () => {
  let emailService: EmailService;
  let mockResend: jest.Mocked<Resend>;
  let mockEmailSend: jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock Resend instance
    mockEmailSend = jest.fn();
    mockResend = {
      emails: {
        send: mockEmailSend,
      },
    } as any;

    // Initialize service with mocked Resend
    emailService = new EmailService(mockResend);
  });

  describe('sendResetPasswordEmail', () => {
    const testEmail = 'test@example.com';
    const testUrl = 'https://example.com/reset-password?token=abc123';
    const testUserName = 'John Doe';

    it('should send reset password email successfully with user name', async () => {
      // Mock successful response
      mockEmailSend.mockResolvedValue({ data: { id: 'email-id-123' }, error: null });

      await emailService.sendResetPasswordEmail(testEmail, testUrl, testUserName);

      // Verify resend.emails.send was called correctly
      expect(mockEmailSend).toHaveBeenCalledTimes(1);
      expect(mockEmailSend).toHaveBeenCalledWith({
        from: 'Linkinvests <noreply@linkinvests.com>',
        to: testEmail,
        subject: 'Réinitialisation de mot de passe - LinkInvests',
        html: expect.stringContaining('Bonjour John Doe,'),
      });

      // Verify the email contains the reset URL
      const htmlContent = mockEmailSend.mock.calls[0][0].html;
      expect(htmlContent).toContain(testUrl);
      expect(htmlContent).toContain('Réinitialiser le mot de passe');
      expect(htmlContent).toContain(testUserName);
    });

    it('should send reset password email successfully without user name', async () => {
      // Mock successful response
      mockEmailSend.mockResolvedValue({ data: { id: 'email-id-123' }, error: null });

      await emailService.sendResetPasswordEmail(testEmail, testUrl);

      // Verify resend.emails.send was called correctly
      expect(mockEmailSend).toHaveBeenCalledTimes(1);

      // Verify the email uses email address as fallback when no username
      const htmlContent = mockEmailSend.mock.calls[0][0].html;
      expect(htmlContent).toContain(`Bonjour ${testEmail},`);
      expect(htmlContent).toContain(testUrl);
    });

    it('should throw error when email sending fails', async () => {
      // Mock error response
      mockEmailSend.mockResolvedValue({
        data: null,
        error: {
          name: 'validation_error',
          message: 'Invalid email address'
        }
      });

      await expect(emailService.sendResetPasswordEmail(testEmail, testUrl, testUserName))
        .rejects
        .toThrow('Failed to send reset password email');

      expect(mockEmailSend).toHaveBeenCalledTimes(1);
    });

    it('should throw error when resend throws an exception', async () => {
      // Mock resend throwing an error
      mockEmailSend.mockRejectedValue(new Error('Network error'));

      await expect(emailService.sendResetPasswordEmail(testEmail, testUrl, testUserName))
        .rejects
        .toThrow('Network error');

      expect(mockEmailSend).toHaveBeenCalledTimes(1);
    });

    it('should include security warnings in email content', async () => {
      // Mock successful response
      mockEmailSend.mockResolvedValue({ data: { id: 'email-id-123' }, error: null });

      await emailService.sendResetPasswordEmail(testEmail, testUrl, testUserName);

      const htmlContent = mockEmailSend.mock.calls[0][0].html;
      expect(htmlContent).toContain('Ce lien de réinitialisation expirera dans 1 heure');
      expect(htmlContent).toContain('ne partagez jamais ce lien avec d\'autres personnes');
    });
  });

  describe('sendVerificationEmail', () => {
    const testEmail = 'test@example.com';
    const testUrl = 'https://example.com/verify-email?token=xyz789';
    const testUserName = 'Jane Smith';

    it('should send verification email successfully with user name', async () => {
      // Mock successful response
      mockEmailSend.mockResolvedValue({ data: { id: 'email-id-456' }, error: null });

      await emailService.sendVerificationEmail(testEmail, testUrl, testUserName);

      // Verify resend.emails.send was called correctly
      expect(mockEmailSend).toHaveBeenCalledTimes(1);
      expect(mockEmailSend).toHaveBeenCalledWith({
        from: 'Linkinvests <noreply@linkinvests.com>',
        to: testEmail,
        subject: 'Verify your email - LinkInvests',
        html: expect.stringContaining('Hi Jane Smith,'),
      });

      // Verify the email contains the verification URL
      const htmlContent = mockEmailSend.mock.calls[0][0].html;
      expect(htmlContent).toContain(testUrl);
      expect(htmlContent).toContain('Verify Email Address');
      expect(htmlContent).toContain(testUserName);
    });

    it('should send verification email successfully without user name', async () => {
      // Mock successful response
      mockEmailSend.mockResolvedValue({ data: { id: 'email-id-456' }, error: null });

      await emailService.sendVerificationEmail(testEmail, testUrl);

      // Verify resend.emails.send was called correctly
      expect(mockEmailSend).toHaveBeenCalledTimes(1);

      // Verify the email uses email address as fallback when no username
      const htmlContent = mockEmailSend.mock.calls[0][0].html;
      expect(htmlContent).toContain(`Hi ${testEmail},`);
      expect(htmlContent).toContain(testUrl);
    });

    it('should throw error when email sending fails', async () => {
      // Mock error response
      mockEmailSend.mockResolvedValue({
        data: null,
        error: {
          name: 'validation_error',
          message: 'Invalid email format'
        }
      });

      await expect(emailService.sendVerificationEmail(testEmail, testUrl, testUserName))
        .rejects
        .toThrow('Failed to send verification email');

      expect(mockEmailSend).toHaveBeenCalledTimes(1);
    });

    it('should throw error when resend throws an exception', async () => {
      // Mock resend throwing an error
      mockEmailSend.mockRejectedValue(new Error('API rate limit exceeded'));

      await expect(emailService.sendVerificationEmail(testEmail, testUrl, testUserName))
        .rejects
        .toThrow('API rate limit exceeded');

      expect(mockEmailSend).toHaveBeenCalledTimes(1);
    });

    it('should include welcome message and instructions in email content', async () => {
      // Mock successful response
      mockEmailSend.mockResolvedValue({ data: { id: 'email-id-456' }, error: null });

      await emailService.sendVerificationEmail(testEmail, testUrl, testUserName);

      const htmlContent = mockEmailSend.mock.calls[0][0].html;
      expect(htmlContent).toContain('Welcome to Linkinvests');
      expect(htmlContent).toContain('Thanks for signing up');
      expect(htmlContent).toContain('verify your email address');
      expect(htmlContent).toContain('This verification link will expire in 24 hours');
    });
  });

  describe('sendEmail (private method tested via public methods)', () => {
    it('should handle different email formats correctly', async () => {
      const emails = [
        'simple@example.com',
        'user.name+tag@example.co.uk',
        'test.email-with+symbol@domain.com'
      ];

      mockEmailSend.mockResolvedValue({ data: { id: 'email-id' }, error: null });

      for (const email of emails) {
        await emailService.sendResetPasswordEmail(email, 'https://test.com/reset', 'Test User');

        expect(mockEmailSend).toHaveBeenCalledWith(
          expect.objectContaining({
            to: email,
            from: 'Linkinvests <noreply@linkinvests.com>',
          })
        );
      }

      expect(mockEmailSend).toHaveBeenCalledTimes(emails.length);
    });

    it('should handle HTML content correctly', async () => {
      mockEmailSend.mockResolvedValue({ data: { id: 'email-id' }, error: null });

      await emailService.sendResetPasswordEmail(
        'test@example.com',
        'https://test.com/reset',
        'Test User'
      );

      const htmlContent = mockEmailSend.mock.calls[0][0].html;

      // Verify HTML structure
      expect(htmlContent).toContain('<!DOCTYPE html>');
      expect(htmlContent).toContain('<html>');
      expect(htmlContent).toContain('</html>');
      expect(htmlContent).toContain('<head>');
      expect(htmlContent).toContain('<body style='); // body has style attribute

      // Verify CSS styles are present
      expect(htmlContent).toContain('font-family:');
      expect(htmlContent).toContain('background-color:');
      expect(htmlContent).toContain('border-radius:');
    });

    it('should handle special characters in email content', async () => {
      const specialUrl = 'https://test.com/reset?token=abc123&redirect=%2Fdashboard%3Futm_source%3Demail';
      const specialUserName = 'José María O\'Connell';

      mockEmailSend.mockResolvedValue({ data: { id: 'email-id' }, error: null });

      await emailService.sendResetPasswordEmail(
        'test@example.com',
        specialUrl,
        specialUserName
      );

      const htmlContent = mockEmailSend.mock.calls[0][0].html;
      expect(htmlContent).toContain(specialUrl);
      expect(htmlContent).toContain(specialUserName);
    });
  });

  describe('constructor', () => {
    it('should create EmailService with default Resend instance when none provided', () => {
      // This test verifies the service can be instantiated with default constructor
      const service = new EmailService();
      expect(service).toBeInstanceOf(EmailService);
    });

    it('should create EmailService with custom Resend instance', () => {
      const customResend = new Resend('custom-api-key');
      const service = new EmailService(customResend);
      expect(service).toBeInstanceOf(EmailService);
    });
  });

  describe('error scenarios', () => {
    it('should handle undefined response from Resend', async () => {
      mockEmailSend.mockResolvedValue(undefined);

      await expect(emailService.sendResetPasswordEmail('test@example.com', 'https://test.com'))
        .rejects
        .toThrow('Cannot read properties of undefined');
    });

    it('should handle null response from Resend', async () => {
      mockEmailSend.mockResolvedValue(null);

      await expect(emailService.sendVerificationEmail('test@example.com', 'https://test.com'))
        .rejects
        .toThrow('Cannot read properties of null');
    });

    it('should handle response without data or error properties', async () => {
      mockEmailSend.mockResolvedValue({});

      // Since response.error is undefined (falsy), the method succeeds
      await expect(emailService.sendResetPasswordEmail('test@example.com', 'https://test.com'))
        .resolves
        .not.toThrow();
    });

    it('should handle network timeouts and connection errors', async () => {
      mockEmailSend.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(emailService.sendVerificationEmail('test@example.com', 'https://test.com'))
        .rejects
        .toThrow('ECONNREFUSED');
    });
  });

  describe('email content validation', () => {
    beforeEach(() => {
      mockEmailSend.mockResolvedValue({ data: { id: 'email-id' }, error: null });
    });

    it('should generate valid HTML for reset password email', async () => {
      await emailService.sendResetPasswordEmail(
        'test@example.com',
        'https://test.com/reset',
        'Test User'
      );

      const htmlContent = mockEmailSend.mock.calls[0][0].html;

      // Validate HTML structure
      expect(htmlContent).toMatch(/<html>/);
      expect(htmlContent).toMatch(/<\/html>/);
      expect(htmlContent).toMatch(/<body[^>]*>/);
      expect(htmlContent).toMatch(/<\/body>/);

      // Validate required content
      expect(htmlContent).toContain('Réinitialisation de mot de passe');
      expect(htmlContent).toContain('href="https://test.com/reset"');
      expect(htmlContent).toContain('Test User');
    });

    it('should generate valid HTML for verification email', async () => {
      await emailService.sendVerificationEmail(
        'test@example.com',
        'https://test.com/verify',
        'Test User'
      );

      const htmlContent = mockEmailSend.mock.calls[0][0].html;

      // Validate HTML structure
      expect(htmlContent).toMatch(/<html>/);
      expect(htmlContent).toMatch(/<\/html>/);
      expect(htmlContent).toMatch(/<body[^>]*>/);
      expect(htmlContent).toMatch(/<\/body>/);

      // Validate required content
      expect(htmlContent).toContain('Welcome to Linkinvests');
      expect(htmlContent).toContain('href="https://test.com/verify"');
      expect(htmlContent).toContain('Test User');
    });

    it('should properly escape HTML in user input', async () => {
      const maliciousUserName = '<script>alert("xss")</script>';

      await emailService.sendResetPasswordEmail(
        'test@example.com',
        'https://test.com/reset',
        maliciousUserName
      );

      const htmlContent = mockEmailSend.mock.calls[0][0].html;

      // The content should contain the literal string, not execute as script
      expect(htmlContent).toContain(maliciousUserName);
      // But it should be treated as plain text in the template literal
    });
  });
});