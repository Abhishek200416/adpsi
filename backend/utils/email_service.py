import os
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

logger = logging.getLogger(__name__)

EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_USER = os.environ.get('EMAIL_USER')
EMAIL_PASSWORD = os.environ.get('EMAIL_PASSWORD')
EMAIL_FROM = os.environ.get('EMAIL_FROM', EMAIL_USER)

async def send_email(to_email: str, subject: str, html_content: str):
    try:
        message = MIMEMultipart('alternative')
        message['From'] = EMAIL_FROM
        message['To'] = to_email
        message['Subject'] = subject
        
        html_part = MIMEText(html_content, 'html')
        message.attach(html_part)
        
        await aiosmtplib.send(
            message,
            hostname=EMAIL_HOST,
            port=EMAIL_PORT,
            username=EMAIL_USER,
            password=EMAIL_PASSWORD,
            start_tls=True
        )
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

async def send_report_confirmation(to_email: str, name: str, report_id: str):
    subject = "Pollution Report Submitted - Delhi Air Command"
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0F766E;">Thank You for Your Report</h2>
                <p>Dear {name},</p>
                <p>Your pollution report has been successfully submitted and logged in our system.</p>
                <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Report ID:</strong> {report_id}</p>
                </div>
                <p>Our team will review your report and take appropriate action. You will receive updates via email as the status changes.</p>
                <p style="color: #64748B; font-size: 14px; margin-top: 30px;">
                    Best regards,<br>
                    Delhi Air Command Team
                </p>
            </div>
        </body>
    </html>
    """
    return await send_email(to_email, subject, html)

async def send_status_update(to_email: str, name: str, report_id: str, new_status: str):
    subject = f"Report Status Update: {new_status.title()} - Delhi Air Command"
    
    status_messages = {
        'viewed': 'Your report has been reviewed by our team.',
        'processing': 'We are actively working on addressing the issue you reported.',
        'completed': 'The issue has been resolved. Thank you for helping us keep Delhi clean!'
    }
    
    message = status_messages.get(new_status, 'Your report status has been updated.')
    
    html = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0F766E;">Report Status Update</h2>
                <p>Dear {name},</p>
                <p>{message}</p>
                <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Report ID:</strong> {report_id}</p>
                    <p style="margin: 10px 0 0 0;"><strong>New Status:</strong> <span style="color: #0F766E; text-transform: uppercase;">{new_status}</span></p>
                </div>
                <p style="color: #64748B; font-size: 14px; margin-top: 30px;">
                    Best regards,<br>
                    Delhi Air Command Team
                </p>
            </div>
        </body>
    </html>
    """
    return await send_email(to_email, subject, html)