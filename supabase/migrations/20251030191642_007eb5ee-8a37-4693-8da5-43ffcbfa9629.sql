-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create app role enum for user types
CREATE TYPE public.app_role AS ENUM ('customer', 'ops');

-- Companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  username TEXT UNIQUE,
  email TEXT NOT NULL,
  mobile_number TEXT,
  address TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Warehouse requests table
CREATE TABLE public.warehouse_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  price DECIMAL(10,2),
  dimensions TEXT,
  area_required DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Warehouse request items (one-to-many)
CREATE TABLE public.warehouse_request_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_request_id UUID REFERENCES public.warehouse_requests(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  uom TEXT NOT NULL CHECK (uom IN ('Carton', 'Pallet', 'Piece', 'Box')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transportation requests table
CREATE TABLE public.transportation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  mode TEXT NOT NULL CHECK (mode IN ('Air', 'Road', 'Water')),
  source_street1 TEXT,
  source_street2 TEXT,
  source_city TEXT,
  source_zip TEXT,
  source_country TEXT,
  source_state TEXT,
  destination_street1 TEXT,
  destination_street2 TEXT,
  destination_city TEXT,
  destination_zip TEXT,
  destination_country TEXT,
  destination_state TEXT,
  transport_date DATE NOT NULL,
  price DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transportation request items (one-to-many)
CREATE TABLE public.transportation_request_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transportation_request_id UUID REFERENCES public.transportation_requests(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  uom TEXT NOT NULL CHECK (uom IN ('Carton', 'Pallet', 'Container', 'Piece', 'Box')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouse_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transportation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transportation_request_items ENABLE ROW LEVEL SECURITY;

-- Function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, username, mobile_number, address, company_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'mobile_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'address', ''),
    (NEW.raw_user_meta_data->>'company_id')::UUID
  );
  
  -- Assign default customer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for companies (viewable by all authenticated users)
CREATE POLICY "Companies viewable by authenticated users"
  ON public.companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage companies"
  ON public.companies FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'ops'));

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Ops can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'ops'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Ops can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'ops'));

-- RLS Policies for warehouse_requests
CREATE POLICY "Customers can view own warehouse requests"
  ON public.warehouse_requests FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Ops can view all warehouse requests"
  ON public.warehouse_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'ops'));

CREATE POLICY "Customers can create warehouse requests"
  ON public.warehouse_requests FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid() AND public.has_role(auth.uid(), 'customer'));

CREATE POLICY "Ops can update warehouse requests"
  ON public.warehouse_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'ops'));

-- RLS Policies for warehouse_request_items
CREATE POLICY "Users can view items of accessible requests"
  ON public.warehouse_request_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.warehouse_requests
      WHERE id = warehouse_request_id
      AND (customer_id = auth.uid() OR public.has_role(auth.uid(), 'ops'))
    )
  );

CREATE POLICY "Customers can insert items for own requests"
  ON public.warehouse_request_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.warehouse_requests
      WHERE id = warehouse_request_id AND customer_id = auth.uid()
    )
  );

-- RLS Policies for transportation_requests
CREATE POLICY "Customers can view own transportation requests"
  ON public.transportation_requests FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY "Ops can view all transportation requests"
  ON public.transportation_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'ops'));

CREATE POLICY "Customers can create transportation requests"
  ON public.transportation_requests FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid() AND public.has_role(auth.uid(), 'customer'));

CREATE POLICY "Ops can update transportation requests"
  ON public.transportation_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'ops'));

-- RLS Policies for transportation_request_items
CREATE POLICY "Users can view items of accessible transport requests"
  ON public.transportation_request_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.transportation_requests
      WHERE id = transportation_request_id
      AND (customer_id = auth.uid() OR public.has_role(auth.uid(), 'ops'))
    )
  );

CREATE POLICY "Customers can insert items for own transport requests"
  ON public.transportation_request_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.transportation_requests
      WHERE id = transportation_request_id AND customer_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_profiles_company ON public.profiles(company_id);
CREATE INDEX idx_warehouse_requests_customer ON public.warehouse_requests(customer_id);
CREATE INDEX idx_warehouse_requests_status ON public.warehouse_requests(status);
CREATE INDEX idx_transportation_requests_customer ON public.transportation_requests(customer_id);
CREATE INDEX idx_transportation_requests_status ON public.transportation_requests(status);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_warehouse_requests_updated_at
  BEFORE UPDATE ON public.warehouse_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transportation_requests_updated_at
  BEFORE UPDATE ON public.transportation_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE transportation_requests
    ADD COLUMN type TEXT CHECK (type IN ('Standard Delivery', 'Express Delivery', 'Same Day Delivery')) DEFAULT 'Standard Delivery';