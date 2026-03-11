"""
Database initialization and migration script.

This script creates all necessary tables in the PostgreSQL database.
Run this before starting the API for the first time.
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.fakey.api.database import engine, Base, init_db
from src.fakey.api.models import Analysis, Feedback, ModelMetrics


def create_tables():
    """Create all database tables."""
    print("Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("✓ Tables created successfully!")
        
        # Print created tables
        print("\nCreated tables:")
        for table in Base.metadata.sorted_tables:
            print(f"  - {table.name}")
            
    except Exception as e:
        print(f"✗ Error creating tables: {e}")
        sys.exit(1)


def drop_tables():
    """Drop all database tables (DANGEROUS - use with caution)."""
    response = input("Are you sure you want to drop all tables? This will delete all data! (yes/no): ")
    if response.lower() == 'yes':
        print("Dropping all tables...")
        Base.metadata.drop_all(bind=engine)
        print("✓ Tables dropped successfully!")
    else:
        print("Operation cancelled.")


def reset_database():
    """Drop and recreate all tables (DANGEROUS - use with caution)."""
    response = input("Are you sure you want to reset the database? This will delete all data! (yes/no): ")
    if response.lower() == 'yes':
        print("Resetting database...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        print("✓ Database reset successfully!")
    else:
        print("Operation cancelled.")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Database management script")
    parser.add_argument(
        "action",
        choices=["create", "drop", "reset"],
        help="Action to perform: create tables, drop tables, or reset database"
    )
    
    args = parser.parse_args()
    
    if args.action == "create":
        create_tables()
    elif args.action == "drop":
        drop_tables()
    elif args.action == "reset":
        reset_database()
