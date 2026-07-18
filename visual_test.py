import subprocess
import os
import sys

def main():
    print("🎬 Launching Visual End-to-End Tests with slow-motion...")
    
    # We pass the SLOW_MO environment variable to trigger the delay in playwright.config.ts
    env = os.environ.copy()
    env["SLOW_MO"] = "1"

    try:
        # We increase the test timeout to 120 seconds to compensate for the artificial 800ms delays
        subprocess.run(
            ["npx", "playwright", "test", "--headed", "--timeout=120000"],
            env=env,
            check=True
        )
        print("✅ Visual testing completed successfully!")
    except KeyboardInterrupt:
        print("\n👋 Test stopped by user.")
    except subprocess.CalledProcessError as e:
        print(f"❌ Tests failed or timed out: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print("❌ Error: 'npx' command not found. Please ensure Node.js is installed.")
        sys.exit(1)

if __name__ == "__main__":
    main()
