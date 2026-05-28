import sqlite3
conn = sqlite3.connect('ecommerce.db')
cursor = conn.cursor()
cursor.execute("SELECT email, is_superuser, role FROM users")
for row in cursor.fetchall():
    print(row)
