import sqlite3

def fix_db():
    conn = sqlite3.connect('ecommerce.db')
    cursor = conn.cursor()
    
    # Update all orders with legacy statuses
    cursor.execute("UPDATE orders SET status = 'ORDER_CONFIRMED' WHERE status IN ('pending', 'processing')")
    cursor.execute("UPDATE orders SET status = 'SHIPPED' WHERE status = 'shipped'")
    cursor.execute("UPDATE orders SET status = 'DELIVERED' WHERE status = 'delivered'")
    cursor.execute("UPDATE orders SET status = 'CANCELLED' WHERE status = 'cancelled'")
    
    conn.commit()
    conn.close()
    print("Database updated successfully.")

if __name__ == '__main__':
    fix_db()
