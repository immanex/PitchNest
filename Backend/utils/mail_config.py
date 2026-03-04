from fastapi_mail import ConnectionConfig

conf = ConnectionConfig(
    MAIL_USERNAME="Admin",
    MAIL_PASSWORD="oybpdatgtnvawass",
    MAIL_FROM="AbhishekBainsla190@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)