export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail(payload: EmailPayload) {
    console.log("📧 [MOCK EMAIL] Sending email:", payload);

    // TODO: Integrate Resend or Supabase Edge Function here
    // Example:
    // const response = await fetch('https://api.resend.com/emails', { ... });

    return { success: true };
}
