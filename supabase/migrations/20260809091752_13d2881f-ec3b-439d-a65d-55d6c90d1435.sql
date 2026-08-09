-- roles
CREATE TYPE public.app_role AS ENUM ('OWNER','STAFF');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'STAFF',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- restaurant (single row)
CREATE TABLE public.restaurant (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'My Restaurant',
  slug text NOT NULL DEFAULT 'my-restaurant',
  description text,
  logo text,
  cover_image text,
  phone text,
  email text,
  address text,
  maps_url text,
  instagram_url text,
  website_url text,
  whatsapp_number text,
  opening_hours jsonb NOT NULL DEFAULT '{}'::jsonb,
  theme jsonb NOT NULL DEFAULT '{}'::jsonb,
  template text NOT NULL DEFAULT 'modern',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant TO authenticated;
GRANT ALL ON public.restaurant TO service_role;
ALTER TABLE public.restaurant ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage restaurant" ON public.restaurant FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER t_restaurant BEFORE UPDATE ON public.restaurant FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage categories" ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER t_categories BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  image text,
  is_veg boolean NOT NULL DEFAULT false,
  is_spicy boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  is_available boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_menu_items_category ON public.menu_items(category_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage menu_items" ON public.menu_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER t_menu_items BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.restaurant_tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  qr_token text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_tables TO authenticated;
GRANT ALL ON public.restaurant_tables TO service_role;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage tables" ON public.restaurant_tables FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER t_tables BEFORE UPDATE ON public.restaurant_tables FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE SEQUENCE public.order_number_seq START 1024;

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number integer NOT NULL DEFAULT nextval('public.order_number_seq'),
  table_id uuid REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  customer_note text,
  session_id text,
  status text NOT NULL DEFAULT 'PENDING',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);
CREATE INDEX idx_orders_table ON public.orders(table_id);
CREATE INDEX idx_orders_status ON public.orders(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff manage orders" ON public.orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER t_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  table_id uuid REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
  item_id uuid,
  category_id uuid,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_created ON public.analytics_events(created_at DESC);
CREATE INDEX idx_events_type ON public.analytics_events(event_type);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read events" ON public.analytics_events FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- demo data
INSERT INTO public.restaurant (name, slug, description, logo, cover_image, phone, email, address, maps_url, instagram_url, website_url, whatsapp_number, opening_hours, theme, template)
VALUES (
  'THE BREW HOUSE', 'the-brew-house',
  'Specialty Coffee • Brunch • Desserts',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=80',
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&q=80',
  '+91 98765 43210', 'hello@brewhouse.cafe',
  '14 Church Street, Bengaluru 560001',
  'https://maps.google.com/?q=Church+Street+Bengaluru',
  'https://instagram.com/thebrewhouse', 'https://thebrewhouse.cafe', '919876543210',
  '{"mon":{"open":"08:00","close":"23:00"},"tue":{"open":"08:00","close":"23:00"},"wed":{"open":"08:00","close":"23:00"},"thu":{"open":"08:00","close":"23:00"},"fri":{"open":"08:00","close":"23:30"},"sat":{"open":"09:00","close":"23:30"},"sun":{"open":"09:00","close":"22:00"}}'::jsonb,
  '{"primary":"#2f5d50","accent":"#c9843e","background":"#faf7f2","text":"#1c1a17"}'::jsonb,
  'modern'
);

INSERT INTO public.categories (id, name, display_order) VALUES
 ('11111111-1111-4111-8111-000000000001','Coffee',1),
 ('11111111-1111-4111-8111-000000000002','Beverages',2),
 ('11111111-1111-4111-8111-000000000003','Starters',3),
 ('11111111-1111-4111-8111-000000000004','Main Course',4),
 ('11111111-1111-4111-8111-000000000005','Desserts',5);

INSERT INTO public.menu_items (category_id, name, description, price, image, is_veg, is_spicy, is_featured, is_available, display_order) VALUES
 ('11111111-1111-4111-8111-000000000001','Cold Coffee','Creamy chilled coffee with vanilla and fresh milk.',180,'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80',true,false,true,true,1),
 ('11111111-1111-4111-8111-000000000001','Cappuccino','Double shot espresso with velvety steamed milk foam.',160,'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80',true,false,true,true,2),
 ('11111111-1111-4111-8111-000000000001','Filter Espresso','Single-origin beans, slow pulled, intensely aromatic.',140,'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&q=80',true,false,false,true,3),
 ('11111111-1111-4111-8111-000000000002','Masala Chai','Slow brewed Assam tea with ginger, cardamom and clove.',100,'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80',true,true,false,true,1),
 ('11111111-1111-4111-8111-000000000002','Fresh Lime Soda','Hand pressed lime, soda, a pinch of black salt.',120,'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800&q=80',true,false,false,true,2),
 ('11111111-1111-4111-8111-000000000003','Paneer Tikka','Charred cottage cheese, smoked yoghurt marinade, mint.',280,'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80',true,true,true,true,1),
 ('11111111-1111-4111-8111-000000000003','Peri Peri Fries','Crisp fries tossed in house peri peri, garlic aioli.',190,'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80',true,true,false,true,2),
 ('11111111-1111-4111-8111-000000000003','Chicken Wings','Six wings glazed in honey chipotle, toasted sesame.',310,'https://images.unsplash.com/photo-1608039755401-742074f0548d?w=800&q=80',false,true,false,true,3),
 ('11111111-1111-4111-8111-000000000004','Margherita Pizza','Slow fermented dough, San Marzano tomato, fior di latte.',350,'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',true,false,true,true,1),
 ('11111111-1111-4111-8111-000000000004','Classic Burger','Grilled patty, cheddar, house pickles, brioche bun.',320,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',false,false,false,true,2),
 ('11111111-1111-4111-8111-000000000004','Truffle Mushroom Pasta','Fettuccine, cremini mushrooms, truffle cream, parmesan.',390,'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&q=80',true,false,false,true,3),
 ('11111111-1111-4111-8111-000000000005','Chocolate Brownie','Warm fudge brownie, sea salt, vanilla bean scoop.',180,'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80',true,false,true,true,1),
 ('11111111-1111-4111-8111-000000000005','Baked Cheesecake','New York style, biscuit crumb, seasonal berry compote.',220,'https://images.unsplash.com/photo-1533134242453-c0e5d1b8dd0e?w=800&q=80',true,false,false,true,2),
 ('11111111-1111-4111-8111-000000000005','Tiramisu','Espresso soaked savoiardi, mascarpone, cocoa dust.',240,'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80',true,false,false,false,3);

INSERT INTO public.restaurant_tables (name, qr_token) VALUES
 ('Table 1','tbl_9k3xq7ma'),
 ('Table 2','tbl_4p7wv2ce'),
 ('Table 3','tbl_8f72kd92'),
 ('Table 4','tbl_2ldh6rqz'),
 ('Table 5','tbl_7cnx1twb'),
 ('Table 6','tbl_5vzq8jke'),
 ('Table 7','tbl_1mhs4pdo'),
 ('Table 8','tbl_6gtb3ynr');
