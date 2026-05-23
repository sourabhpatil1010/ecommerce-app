"""Validation helper functions."""

import re

EMAIL_REGEX = re.compile(r"^[\w\.\+\-]+@[\w\-]+\.[\w\.\-]+$")


def is_valid_email(email: str) -> bool:
    """Check if a string is a valid email address."""
    return bool(EMAIL_REGEX.match(email))


def is_strong_password(password: str, min_length: int = 8) -> bool:
    """Check if a password meets minimum strength requirements."""
    if len(password) < min_length:
        return False
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    return has_upper and has_lower and has_digit
