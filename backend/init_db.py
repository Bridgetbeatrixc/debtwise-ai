"""
Run once to create tables and seed the admin user.
Usage: python init_db.py
"""
import psycopg2
from passlib.context import CryptContext
from config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ADMIN_EMAIL = "admin@debtwise.ai"
ADMIN_PASSWORD = "admin123"


def main():
    settings = get_settings()
    conn = psycopg2.connect(settings.database_url)
    conn.autocommit = True
    cur = conn.cursor()

    print("Creating tables...")
    with open("schema.sql", "r") as f:
        cur.execute(f.read())
    print("Tables created.")

    # Add is_admin column if it doesn't exist (safe for re-runs)
    cur.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_schema = 'public'
                  AND table_name = 'users'
                  AND column_name = 'is_admin'
            ) THEN
                ALTER TABLE public.users ADD COLUMN is_admin boolean NOT NULL DEFAULT false;
            END IF;
        END $$;
    """)

    # Create admin user if not exists
    cur.execute("SELECT id FROM users WHERE email = %s", (ADMIN_EMAIL,))
    if cur.fetchone():
        print(f"Admin user already exists: {ADMIN_EMAIL}")
    else:
        hashed = pwd_context.hash(ADMIN_PASSWORD)
        cur.execute(
            """
            INSERT INTO users (email, password_hash, is_admin)
            VALUES (%s, %s, true)
            RETURNING id, email
            """,
            (ADMIN_EMAIL, hashed),
        )
        row = cur.fetchone()
        print(f"Admin user created: {row[1]} (id: {row[0]})")

    cur.close()
    conn.close()
    print("Done! You can now login with:")
    print(f"  Email:    {ADMIN_EMAIL}")
    print(f"  Password: {ADMIN_PASSWORD}")


if __name__ == "__main__":
    main()
