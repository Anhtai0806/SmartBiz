@echo off
echo ============================================
echo Update Phone Number for owner@smartbiz.com
echo ============================================
echo.
echo This script will update the phone number to: +84902345678
echo.
echo Please enter your MySQL root password when prompted.
echo.
pause

mysql -u root -p -e "USE smartbiz; UPDATE users SET phone = '+84902345678' WHERE email = 'owner@smartbiz.com'; SELECT email, phone, full_name, role FROM users WHERE email = 'owner@smartbiz.com';"

echo.
echo ============================================
echo Done! Phone number updated successfully.
echo Now login again to see the phone number.
echo ============================================
pause
