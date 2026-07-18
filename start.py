import subprocess
import sys

def main():
    print("🌱 Seeding the database...")
    try:
        # Run the seed script
        subprocess.run(["node", "server/seed.js"], check=True)
        print("✅ Database seeded successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error seeding database: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print("❌ Error: 'node' command not found. Please ensure Node.js is installed.")
        sys.exit(1)

    print("\n🚀 Starting the application (Frontend + Backend)...")
    try:
        # Start the local development server (concurrently runs Vite and Express)
        subprocess.run(["npm", "run", "dev:full"], check=True)
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user. Goodbye!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting application: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print("❌ Error: 'npm' command not found. Please ensure npm is installed.")
        sys.exit(1)

if __name__ == "__main__":
    main()
