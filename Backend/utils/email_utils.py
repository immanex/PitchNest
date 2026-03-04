from fastapi_mail import FastMail, MessageSchema
from utils.mail_config import conf

async def send_verification_email(email: str, token: str):

    verification_link = f"http://localhost:8000/api/auth/verify-email?token={token}"

    message = MessageSchema(
        subject="Verify your email",
        recipients=[email],
        body=f"""
        Click the link below to verify your email:

        {verification_link}
        """,
        subtype="plain"
    )

    fm = FastMail(conf)
    await fm.send_message(message)