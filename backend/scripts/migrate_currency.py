import sqlite3
import os

def migrate():
    db_path = os.path.join(os.path.dirname(__file__), "..", "ecommerce.db")
    print(f"Connecting to database at {db_path}...")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    rate = 83.0
    
    # Check what tables exist
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [t[0] for t in cursor.fetchall()]
    print(f"Found tables: {tables}")
    
    if 'products' in tables:
        # Only update products that are still in the USD range (e.g. < 5000)
        # to avoid double-multiplying if script is run twice
        cursor.execute(f"UPDATE products SET price = price * {rate} WHERE price < 1000")
        print(f"Updated {cursor.rowcount} products.")
        
    if 'cart_items' in tables:
        cursor.execute(f"UPDATE cart_items SET unit_price = unit_price * {rate} WHERE unit_price < 1000")
        print(f"Updated {cursor.rowcount} cart_items.")
        
    if 'order_items' in tables:
        cursor.execute(f"UPDATE order_items SET unit_price = unit_price * {rate} WHERE unit_price < 1000")
        print(f"Updated {cursor.rowcount} order_items.")
        
    if 'orders' in tables:
        # Note: we might need to recalculate total_amount based on order_items, 
        # or just multiply by 83. Multiplying by 83 is simpler and consistent.
        cursor.execute(f"UPDATE orders SET total_amount = total_amount * {rate} WHERE total_amount < 50000")
        print(f"Updated {cursor.rowcount} orders.")
        
    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
