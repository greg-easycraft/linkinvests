interface MailtoParams {
  to: string;
  subject: string;
  body: string;
}

export function openMailto({ to, subject, body }: MailtoParams): void {
  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailto);
}
