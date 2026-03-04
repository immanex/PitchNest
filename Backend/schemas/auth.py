from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str | None = None


class UserRead(BaseModel):
    id: str
    email: EmailStr
    name: str | None = Field(default=None, alias="full_name")
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True
        populate_by_name = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    status: str
    message: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=8)
