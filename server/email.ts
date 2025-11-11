// Referenced integration: connection:conn_resend_01K7FXNR5Q07Q24MGDV9TZ26Z1
import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email};
}

async function getUncachableResendClient() {
  const {apiKey, fromEmail} = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: fromEmail
  };
}

export async function sendLeadNotification(lead: {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  dealershipName: string;
  dealerWebsite?: string;
  message?: string;
}) {
  const { client, fromEmail } = await getUncachableResendClient();

  console.log('Sending email notification...');
  console.log('From email:', fromEmail);
  console.log('To email:', fromEmail);
  
  const result = await client.emails.send({
    from: fromEmail,
    to: fromEmail, // Send to your own email for now
    subject: `New Demo Request from ${lead.dealershipName}`,
    html: `
      <h2>New Demo Request Received</h2>
      <p><strong>Name:</strong> ${lead.name}</p>
      <p><strong>Email:</strong> ${lead.email}</p>
      <p><strong>Phone:</strong> ${lead.countryCode} ${lead.phone}</p>
      <p><strong>Dealership:</strong> ${lead.dealershipName}</p>
      ${lead.dealerWebsite ? `<p><strong>Website:</strong> <a href="${lead.dealerWebsite}">${lead.dealerWebsite}</a></p>` : ''}
      ${lead.message ? `<p><strong>Message:</strong> ${lead.message}</p>` : ''}
      <hr>
      <p>Submitted at: ${new Date().toLocaleString()}</p>
    `
  });
  
  console.log('Email sent successfully:', result);
}

export async function sendWelcomeEmail(user: {
  email: string;
  dealershipName: string;
  trialEndsAt: Date;
}) {
  const { client, fromEmail } = await getUncachableResendClient();

  console.log('Sending welcome email...');
  console.log('From email:', fromEmail);
  console.log('To email:', user.email);
  
  const trialDays = Math.ceil((user.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  const result = await client.emails.send({
    from: fromEmail,
    to: user.email,
    subject: `Welcome to DealerDelight, ${user.dealershipName}!`,
    html: `
      <h2>Welcome to DealerDelight!</h2>
      <p>Hi there,</p>
      <p>Thank you for signing up for DealerDelight! Your dealership website platform is now ready.</p>
      
      <h3>Your Trial Details</h3>
      <p>You have <strong>${trialDays} days</strong> of free access to explore all features.</p>
      
      <h3>Next Steps</h3>
      <ol>
        <li><a href="https://dealerdelight.com/login">Login to your dashboard</a></li>
        <li>Choose your website template (Luxury, Classic, or Modern)</li>
        <li>Add your first vehicle listing</li>
        <li>Start receiving leads!</li>
      </ol>
      
      <h3>Need Help?</h3>
      <p>Our support team is here to help you get started. Reply to this email or contact us at support@dealerdelight.com</p>
      
      <p>Best regards,<br>The DealerDelight Team</p>
      
      <hr>
      <p style="color: #666; font-size: 12px;">
        This email was sent because you created an account at DealerDelight.
      </p>
    `
  });
  
  console.log('Welcome email sent successfully:', result);
}

export async function sendInquiryNotification(inquiry: {
  dealerEmail: string;
  dealershipName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  message: string;
  vehicleTitle?: string;
}) {
  const { client, fromEmail } = await getUncachableResendClient();

  console.log('Sending inquiry notification...');
  console.log('From email:', fromEmail);
  console.log('To email:', inquiry.dealerEmail);
  
  const result = await client.emails.send({
    from: fromEmail,
    to: inquiry.dealerEmail,
    replyTo: inquiry.customerEmail,
    subject: `New Customer Inquiry${inquiry.vehicleTitle ? ` - ${inquiry.vehicleTitle}` : ''}`,
    html: `
      <h2>New Customer Inquiry for ${inquiry.dealershipName}</h2>
      ${inquiry.vehicleTitle ? `<p><strong>Vehicle of Interest:</strong> ${inquiry.vehicleTitle}</p>` : ''}
      
      <h3>Customer Details</h3>
      <p><strong>Name:</strong> ${inquiry.customerName}</p>
      <p><strong>Email:</strong> <a href="mailto:${inquiry.customerEmail}">${inquiry.customerEmail}</a></p>
      <p><strong>Phone:</strong> ${inquiry.customerPhone}</p>
      
      <h3>Message</h3>
      <p>${inquiry.message}</p>
      
      <hr>
      <p><strong>Reply directly to this email to contact the customer.</strong></p>
      <p style="color: #666; font-size: 12px;">
        Submitted at: ${new Date().toLocaleString()}
      </p>
    `
  });
  
  console.log('Inquiry notification sent successfully:', result);
}
