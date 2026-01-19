@echo off
echo ============================================
echo Update Phone Numbers for All Test Users
echo ============================================
echo.
echo This will add phone numbers to all test accounts:
echo - admin@smartbiz.com    : +84901234567
echo - owner@smartbiz.com    : +84902345678
echo - staff@smartbiz.com    : +84903456789
echo - cashier@smartbiz.com  : +84904567890
echo.
echo Please enter your MySQL root password when prompted.
echo.
pause

mysql -u root -p -e "USE smartbiz; UPDATE users SET phone = '+84901234567' WHERE email = 'admin@smartbiz.com'; UPDATE users SET phone = '+84902345678' WHERE email = 'owner@smartbiz.com'; UPDATE users SET phone = '+84903456789' WHERE email = 'staff@smartbiz.com'; UPDATE users SET phone = '+84904567890' WHERE email = 'cashier@smartbiz.com'; SELECT email, phone, full_name, role FROM users ORDER BY role;"

echo.
echo ============================================
echo Done! Phone numbers updated successfully.
echo Login again to see the phone number.
echo ============================================
pause
