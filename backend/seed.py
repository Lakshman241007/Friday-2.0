from app.core.database import SessionLocal
from app.models.role import Role
from app.models.user import User
from app.models.lead import Lead
from app.core.security import hash_password


def seed_data():
    db = SessionLocal()

    try:
        # Create a default role
        role = db.query(Role).filter(Role.name == "Employee").first()

        if not role:
            role = Role(name="Employee")
            db.add(role)
            db.commit()
            db.refresh(role)

        # Create a sample user
        user = db.query(User).filter(
            User.email == "demo@friday.com"
        ).first()

        if not user:
            user = User(
                name="Demo User",
                email="demo@friday.com",
                password_hash=hash_password("Demo@123"),
                role_id=role.id,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Create a sample lead
        lead = db.query(Lead).filter(
            Lead.email == "lead@example.com"
        ).first()

        if not lead:
            lead = Lead(
                name="Sample Lead",
                email="lead@example.com",
                phone="9876543210",
                company="Demo Company",
                source="Seed Data",
                created_by=user.id,
            )
            db.add(lead)
            db.commit()

        print("Seed data inserted successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_data()