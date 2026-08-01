@echo off
cd /d c:\nyakizu-digital-platform\frontend
npx next build > build_output.log 2>&1
echo BUILD_EXIT_CODE=%errorlevel%

