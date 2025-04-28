// Script to seed communications data
import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addSampleCommunications() {
  try {
    console.log('Adding sample communications...');
    
    // Get contact and lead IDs
    const contactsResult = await pool.query('SELECT id FROM contacts LIMIT 10');
    const leadsResult = await pool.query('SELECT id FROM leads LIMIT 10');
    
    const contactIds = contactsResult.rows.map(row => row.id);
    const leadIds = leadsResult.rows.map(row => row.id);
    
    // Communication templates for different channels
    const communicationTemplates = [
      // SMS communications
      {
        channel: 'SMS',
        messages: [
          { direction: 'Inbound', content: 'Hi, I need more information about your product pricing.', status: 'Unread' },
          { direction: 'Outbound', content: 'Thanks for your interest. Our basic package starts at $99/month. Would you like to schedule a demo?', status: 'Read' },
          { direction: 'Inbound', content: 'Yes, that would be great. How about next Tuesday?', status: 'Replied' },
          { direction: 'Outbound', content: 'Perfect! I have scheduled a demo for next Tuesday at 2 PM. I will send a calendar invite shortly.', status: 'Read' }
        ]
      },
      // Email communications
      {
        channel: 'Email',
        messages: [
          { direction: 'Inbound', content: 'I am interested in your enterprise solution. Can you send me more details about your service level agreements?', status: 'Read' },
          { direction: 'Outbound', content: 'Thank you for your interest in our enterprise solutions. I have attached our SLA documentation for your review. Let me know if you have any questions!', status: 'Replied' },
          { direction: 'Inbound', content: 'The SLA looks good. What is the implementation timeline?', status: 'Unread' }
        ]
      },
      // WhatsApp communications
      {
        channel: 'WhatsApp',
        messages: [
          { direction: 'Outbound', content: 'Hi there! Following up on our conversation at the trade show. Would you like to see a demo of our new CRM features?', status: 'Read' },
          { direction: 'Inbound', content: 'Yes, I would be interested. Can you do a virtual demo?', status: 'Replied' },
          { direction: 'Outbound', content: 'Definitely! How does Thursday at 10 AM sound?', status: 'Read' },
          { direction: 'Inbound', content: 'Thursday works. Please send me a meeting link.', status: 'Unread' }
        ]
      },
      // Messenger communications
      {
        channel: 'Messenger',
        messages: [
          { direction: 'Inbound', content: 'Hi, I saw your ad on Facebook. Do you offer any trial period?', status: 'Replied' },
          { direction: 'Outbound', content: 'Yes, we offer a 14-day free trial with full access to all features. Would you like me to set up an account for you?', status: 'Read' },
          { direction: 'Inbound', content: 'That sounds great. What information do you need from me?', status: 'Unread' }
        ]
      },
      // LinkedIn communications
      {
        channel: 'LinkedIn',
        messages: [
          { direction: 'Outbound', content: 'I noticed you are in the finance industry. Our CRM has specialized features for financial services. Would you be interested in learning more?', status: 'Read' },
          { direction: 'Inbound', content: 'We are actually evaluating CRM solutions right now. What sets your product apart?', status: 'Replied' },
          { direction: 'Outbound', content: 'Great timing! Our financial services CRM includes compliance features, portfolio tracking, and client lifecycle management. Would you like a personalized demo?', status: 'Unread' }
        ]
      },
      // Twitter communications
      {
        channel: 'Twitter',
        messages: [
          { direction: 'Inbound', content: 'I tried contacting your support but have not heard back. Can someone help with my integration issue?', status: 'Replied' },
          { direction: 'Outbound', content: 'I am sorry to hear about your trouble. Could you DM us your ticket number so we can look into this right away?', status: 'Read' },
          { direction: 'Inbound', content: 'My ticket number is #34567. It has been 3 days without a response.', status: 'Unread' }
        ]
      },
      // Facebook communications
      {
        channel: 'Facebook',
        messages: [
          { direction: 'Inbound', content: 'Hi, I saw your ad and wanted to learn more about your CRM solution', status: 'Replied' },
          { direction: 'Outbound', content: 'Thank you for your interest! We offer a complete CRM with marketing automation, sales tracking, and customer management. Would you like to schedule a demo?', status: 'Read' },
          { direction: 'Inbound', content: 'Yes, that would be great. I\'m available next Tuesday afternoon.', status: 'Unread' }
        ]
      },
      // Instagram communications
      {
        channel: 'Instagram',
        messages: [
          { direction: 'Inbound', content: 'Your CRM looks amazing! Does it have a mobile app?', status: 'Replied' },
          { direction: 'Outbound', content: 'Thank you! Yes, we have a fully featured mobile app for both iOS and Android with real-time notifications and access to all your customer data.', status: 'Read' },
          { direction: 'Inbound', content: 'Perfect! That\'s exactly what I\'ve been looking for.', status: 'Unread' }
        ]
      },
      // WhatsApp communications
      {
        channel: 'WhatsApp',
        messages: [
          { direction: 'Inbound', content: 'Hello, I\'m interested in your CRM for my consulting business. Do you offer any special pricing for small businesses?', status: 'Replied' },
          { direction: 'Outbound', content: 'Hello! Yes, we have special pricing tiers for small businesses and startups. Our basic plan starts at $29/month for up to 5 users. Would you like to see our full pricing breakdown?', status: 'Read' },
          { direction: 'Inbound', content: 'Yes please, that sounds affordable. Can you also tell me about data migration from our current system?', status: 'Unread' }
        ]
      },
      // LinkedIn communications
      {
        channel: 'LinkedIn',
        messages: [
          { direction: 'Inbound', content: 'I came across your CRM platform on LinkedIn. Our sales team is looking for something more robust than our current solution. Do you offer demos?', status: 'Replied' },
          { direction: 'Outbound', content: 'Thank you for your interest! Yes, we would be happy to schedule a personalized demo for your sales team. We can customize it to focus on the features most relevant to your needs. When would be a good time for your team?', status: 'Read' },
          { direction: 'Inbound', content: 'That would be perfect. How about next Thursday at 2 PM EST? We have about 5 people who would join.', status: 'Unread' }
        ]
      },
      // Messenger communications
      {
        channel: 'Messenger',
        messages: [
          { direction: 'Inbound', content: 'Quick question - does your CRM have API access? We need to connect it with our custom inventory system.', status: 'Replied' },
          { direction: 'Outbound', content: 'Yes, we offer comprehensive REST API access across all our paid plans. We also have pre-built integrations with many popular inventory management systems. I\'d be happy to connect you with one of our integration specialists.', status: 'Read' },
          { direction: 'Inbound', content: 'Great! That sounds exactly like what we need. Let\'s set up a call with your specialist.', status: 'Unread' }
        ]
      },
      // Email communications
      {
        channel: 'Email',
        messages: [
          { direction: 'Inbound', content: 'Subject: Enterprise Plan Inquiry\n\nHello,\n\nI\'m the IT Director at GlobalTech Solutions and we\'re evaluating CRM options for our 250-person sales team. Could you provide details on your enterprise plan, including pricing, implementation timeline, and training options?\n\nRegards,\nMichael Thompson\nIT Director, GlobalTech Solutions', status: 'Replied' },
          { direction: 'Outbound', content: 'Subject: Re: Enterprise Plan Inquiry\n\nDear Mr. Thompson,\n\nThank you for your interest in our Enterprise CRM solution. I\'ve attached our Enterprise brochure with detailed information about our pricing tiers, implementation process, and training packages.\n\nFor an organization of your size, we recommend our Premium Enterprise plan which includes:\n- Unlimited users\n- Dedicated account manager\n- Custom API integrations\n- 24/7 priority support\n- Comprehensive training program\n\nI would be happy to schedule a call to discuss your specific requirements and provide a tailored quote.\n\nBest regards,\nSarah Johnson\nEnterprise Sales Manager', status: 'Read' },
          { direction: 'Inbound', content: 'Subject: Re: Enterprise Plan Inquiry\n\nSarah,\n\nThank you for the information. The Premium Enterprise plan looks promising. Let\'s schedule a call for next week to discuss further. How does Tuesday at 2 PM EST work for you?\n\nRegards,\nMichael', status: 'Unread' }
        ]
      },
      // Phone communications
      {
        channel: 'Phone',
        messages: [
          { direction: 'Inbound', content: 'Call Summary: Customer called regarding a billing question. They were charged twice for the Pro plan upgrade this month and would like a refund for the duplicate charge. Customer ID: CID-38291.', status: 'Replied' },
          { direction: 'Outbound', content: 'Call Summary: Called customer back to confirm that the duplicate charge was identified and a refund has been processed. The refund should appear on their account within 3-5 business days. Also offered a 10% discount on next month\'s subscription as a courtesy for the inconvenience.', status: 'Read' },
          { direction: 'Inbound', content: 'Call Summary: Customer called to confirm receipt of the refund and thanked us for the quick resolution. They mentioned they are considering adding 5 more user licenses in the next quarter.', status: 'Unread' }
        ]
      },
      // More Phone communications
      {
        channel: 'Phone',
        messages: [
          { direction: 'Outbound', content: 'Call Summary: Called to follow up on the product demo from last week. The prospect expressed interest in the premium tier but needs approval from their IT department before proceeding.', status: 'Read' },
          { direction: 'Inbound', content: 'Call Summary: Client called to request additional information about API access and data security measures. They are in the final stage of vendor selection.', status: 'Replied' },
          { direction: 'Outbound', content: 'Call Summary: Called to provide the requested information about our security protocols and API documentation. Went through the SOC 2 compliance details and scheduled a call with our security team for next Tuesday.', status: 'Read' }
        ]
      },
      // Additional Phone conversations
      {
        channel: 'Phone',
        messages: [
          { direction: 'Outbound', content: 'Call Summary: Quarterly review call with client. Discussed usage metrics, upcoming feature rollout, and user adoption rates. Client is satisfied with the platform but requested additional training for new team members.', status: 'Read' },
          { direction: 'Inbound', content: 'Call Summary: Client called about integrating their existing ERP system with our CRM. They need a custom connector developed before fiscal year end.', status: 'Unread' }
        ]
      },
      // SMS communications
      {
        channel: 'SMS',
        messages: [
          { direction: 'Outbound', content: 'AVEROX CRM: Your account has been successfully upgraded to Premium! Enjoy your new features. Reply HELP for support or STOP to unsubscribe from notifications.', status: 'Read' },
          { direction: 'Inbound', content: 'Thank you. When will the new dashboard features be available? I don\'t see them yet.', status: 'Replied' },
          { direction: 'Outbound', content: 'AVEROX CRM: Your new dashboard features will be activated within the next 2 hours. You\'ll receive an email once they\'re ready. Need help? Call us at 1-800-AVEROX or reply to this message.', status: 'Read' },
          { direction: 'Inbound', content: 'Great, thanks! Looking forward to trying the new analytics tools.', status: 'Unread' }
        ]
      },
      // Additional SMS communications
      {
        channel: 'SMS',
        messages: [
          { direction: 'Outbound', content: 'AVEROX CRM: You have 3 tasks due today. Reply VIEW to see your task list or SNOOZE to remind you later.', status: 'Read' },
          { direction: 'Inbound', content: 'VIEW', status: 'Replied' },
          { direction: 'Outbound', content: 'AVEROX CRM Tasks Due Today: 1) Call John Smith about contract renewal 2) Prepare quarterly report 3) Update sales pipeline. Reply COMPLETE followed by task number to mark as done.', status: 'Read' },
          { direction: 'Inbound', content: 'COMPLETE 2', status: 'Unread' }
        ]
      },
      // More SMS messages
      {
        channel: 'SMS',
        messages: [
          { direction: 'Outbound', content: 'AVEROX CRM: Your client meeting with Acme Corp is scheduled in 30 minutes. Reply CONFIRM to confirm attendance or RESCHEDULE to change the time.', status: 'Read' },
          { direction: 'Inbound', content: 'CONFIRM', status: 'Replied' },
          { direction: 'Outbound', content: 'AVEROX CRM: Meeting confirmed! Meeting details and agenda have been sent to your email.', status: 'Read' }
        ]
      }
    ];
    
    // Generate communications data
    const communicationsData = [];
    
    // For contacts (customers)
    for (const contactId of contactIds) {
      // Choose two random communication templates
      const shuffledTemplates = [...communicationTemplates].sort(() => 0.5 - Math.random());
      const selectedTemplates = shuffledTemplates.slice(0, 2);
      
      for (const template of selectedTemplates) {
        for (const message of template.messages) {
          const sentAt = new Date();
          sentAt.setDate(sentAt.getDate() - Math.floor(Math.random() * 10));
          
          // Get contact details
          const contactResult = await pool.query('SELECT first_name, last_name, email, phone FROM contacts WHERE id = $1', [contactId]);
          const contact = contactResult.rows[0];
          
          communicationsData.push({
            contactId: contactId,
            contactType: 'customer',
            channel: template.channel,
            direction: message.direction,
            content: message.content,
            status: message.status,
            sentAt: sentAt.toISOString(),
            receivedAt: message.direction === 'Inbound' ? sentAt.toISOString() : null,
            contactDetails: {
              id: contactId,
              firstName: contact.first_name,
              lastName: contact.last_name,
              email: contact.email,
              phone: contact.phone
            }
          });
        }
      }
    }
    
    // For leads
    for (const leadId of leadIds) {
      // Choose two random communication templates
      const shuffledTemplates = [...communicationTemplates].sort(() => 0.5 - Math.random());
      const selectedTemplates = shuffledTemplates.slice(0, 2);
      
      for (const template of selectedTemplates) {
        for (const message of template.messages) {
          const sentAt = new Date();
          sentAt.setDate(sentAt.getDate() - Math.floor(Math.random() * 10));
          
          // Get lead details
          const leadResult = await pool.query('SELECT first_name, last_name, email, phone, company FROM leads WHERE id = $1', [leadId]);
          const lead = leadResult.rows[0];
          
          communicationsData.push({
            contactId: leadId,
            contactType: 'lead',
            channel: template.channel,
            direction: message.direction,
            content: message.content,
            status: message.status,
            sentAt: sentAt.toISOString(),
            receivedAt: message.direction === 'Inbound' ? sentAt.toISOString() : null,
            contactDetails: {
              id: leadId,
              firstName: lead.first_name,
              lastName: lead.last_name,
              email: lead.email,
              phone: lead.phone,
              company: lead.company
            }
          });
        }
      }
    }
    
    // Insert data in batches
    console.log(`Prepared ${communicationsData.length} communications to insert`);
    
    for (const data of communicationsData) {
      // Determine which ID field to use based on contact type
      const contactIdField = data.contactType === 'customer' ? 'contact_id' : 'lead_id';
      const contactId = data.contactId;
      
      const query = `
        INSERT INTO communications (
          ${contactIdField}, contact_type, channel, direction, content, status, 
          sent_at, received_at, contact_details
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
      `;
      
      await pool.query(query, [
        contactId,
        data.contactType,
        data.channel,
        data.direction,
        data.content,
        data.status,
        data.sentAt,
        data.receivedAt,
        JSON.stringify(data.contactDetails)
      ]);
    }
    
    console.log('Sample communications added successfully!');
  } catch (error) {
    console.error('Error adding sample communications:', error);
  } finally {
    await pool.end();
  }
}

// Run the function
addSampleCommunications();