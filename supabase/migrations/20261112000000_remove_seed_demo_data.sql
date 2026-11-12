-- Remove only original sample records. Real restaurant data and all orders are preserved.
BEGIN;
DELETE FROM public.analytics_events
WHERE table_id IN (SELECT id FROM public.restaurant_tables WHERE qr_token IN ('tbl_9k3xq7ma','tbl_4p7wv2ce','tbl_8f72kd92','tbl_2ldh6rqz','tbl_7cnx1twb','tbl_5vzq8jke','tbl_1mhs4pdo','tbl_6gtb3ynr'))
OR item_id IN (SELECT id FROM public.menu_items WHERE category_id IN ('11111111-1111-4111-8111-000000000001','11111111-1111-4111-8111-000000000002','11111111-1111-4111-8111-000000000003','11111111-1111-4111-8111-000000000004','11111111-1111-4111-8111-000000000005') AND name IN ('Cold Coffee','Cappuccino','Filter Espresso','Masala Chai','Fresh Lime Soda','Paneer Tikka','Peri Peri Fries','Chicken Wings','Margherita Pizza','Classic Burger','Truffle Mushroom Pasta','Chocolate Brownie','Baked Cheesecake','Tiramisu'));
DELETE FROM public.menu_items
WHERE category_id IN ('11111111-1111-4111-8111-000000000001','11111111-1111-4111-8111-000000000002','11111111-1111-4111-8111-000000000003','11111111-1111-4111-8111-000000000004','11111111-1111-4111-8111-000000000005')
AND name IN ('Cold Coffee','Cappuccino','Filter Espresso','Masala Chai','Fresh Lime Soda','Paneer Tikka','Peri Peri Fries','Chicken Wings','Margherita Pizza','Classic Burger','Truffle Mushroom Pasta','Chocolate Brownie','Baked Cheesecake','Tiramisu');
DELETE FROM public.categories c
WHERE c.id IN ('11111111-1111-4111-8111-000000000001','11111111-1111-4111-8111-000000000002','11111111-1111-4111-8111-000000000003','11111111-1111-4111-8111-000000000004','11111111-1111-4111-8111-000000000005')
AND NOT EXISTS (SELECT 1 FROM public.menu_items m WHERE m.category_id = c.id);
DELETE FROM public.restaurant_tables
WHERE qr_token IN ('tbl_9k3xq7ma','tbl_4p7wv2ce','tbl_8f72kd92','tbl_2ldh6rqz','tbl_7cnx1twb','tbl_5vzq8jke','tbl_1mhs4pdo','tbl_6gtb3ynr')
AND name IN ('Table 1','Table 2','Table 3','Table 4','Table 5','Table 6','Table 7','Table 8');
DELETE FROM public.restaurant
WHERE name='THE BREW HOUSE' AND slug='the-brew-house'
AND description='Specialty Coffee • Brunch • Desserts'
AND phone='+91 98765 43210' AND email='hello@brewhouse.cafe'
AND address='14 Church Street, Bengaluru 560001';
COMMIT;
