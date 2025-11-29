import { getDocIdFromSuccessionExternalId, type Succession } from "@linkinvests/shared";

interface MailtoParams {
  to: string;
  subject: string;
  body: string;
}

export function openMailto({ to, subject, body }: MailtoParams): void {
  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailto, '_blank');
}

export function contactMairie(succession: Succession): void {
  const email = succession.mairieContact?.email;
  if (!email) return;

  openMailto({
    to: email,
    subject: "Demande d'acte de décès",
    body: `Madame, Monsieur,\n\nJe souhaiterais obtenir l'acte de décès de ${succession.firstName} ${succession.lastName} (acte n° ${getDocIdFromSuccessionExternalId(succession.externalId)}).\n\nCordialement,`,
  });
}