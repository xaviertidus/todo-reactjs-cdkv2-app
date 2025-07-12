#!/bin/bash

# Section: Set strict mode for safety
set -euo pipefail

# Section: Define project directories to clean (adjust if new subprojects are added)
PROJECT_DIRS=("core-infrastructure" "api" "apphosting" "reactjs-app" "reactjs-app/cdk-deploy")

# Section: Clean NPM cache globally
echo "Cleaning NPM cache..."
npm cache clean --force

# Section: Loop through each project directory and clean
for dir in "${PROJECT_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    cd "$dir"
    echo "Cleaning $dir..."
    
    # Remove node_modules if exists
    if [ -d "node_modules" ]; then
      rm -rf node_modules
    fi
    
    # Remove package-lock.json if exists (to ensure fresh installs)
    if [ -f "package-lock.json" ]; then
      rm -f package-lock.json
    fi
    
    # For CDK projects, remove cdk.out
    if [ -d "cdk.out" ]; then
      rm -rf cdk.out
    fi
    
    cd ..
  fi
done

# Section: Clean React build folder
if [ -d "reactjs-app/build" ]; then
  echo "Cleaning React build folder..."
  rm -rf reactjs-app/build
fi

# Section: Clean generated outputs folder (if it exists, as it's runtime-generated)
if [ -d "outputs" ]; then
  echo "Cleaning outputs folder..."
  rm -rf outputs
fi

# Section: Optional: Clean any temporary files or caches (e.g., .npm)
rm -rf ~/.npm

echo "Clean complete. The project tree is now suitable for git add/commit."