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
