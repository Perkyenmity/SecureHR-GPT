from sqlalchemy.orm import Session

from app.db.models import AuditLog, User


def log_access_attempt(
    db: Session,
    user: User,
    action: str,
    query: str,
    decision: str,
    reason: str,
):
    audit_entry = AuditLog(
        user_id=user.id,
        username=user.username,
        action=action,
        query=query,
        decision=decision,
        reason=reason,
    )

    db.add(audit_entry)
    db.commit()