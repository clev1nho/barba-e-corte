CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: appointment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.appointment_status AS ENUM (
    'Pendente',
    'Confirmado',
    'Concluído',
    'Cancelado',
    'Não compareceu'
);


--
-- Name: financial_transaction_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.financial_transaction_type AS ENUM (
    'receita',
    'despesa'
);


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Default role is 'user', admin role must be assigned manually
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    service_id uuid,
    barber_id uuid,
    date text NOT NULL,
    "time" text NOT NULL,
    duration_minutes integer NOT NULL,
    client_name text NOT NULL,
    client_whatsapp text NOT NULL,
    status public.appointment_status DEFAULT 'Pendente'::public.appointment_status,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    whatsapp_redirected_at timestamp with time zone,
    CONSTRAINT check_client_name_length CHECK (((length(client_name) >= 2) AND (length(client_name) <= 100))),
    CONSTRAINT check_client_whatsapp_length CHECK (((length(client_whatsapp) >= 10) AND (length(client_whatsapp) <= 20)))
);


--
-- Name: appointment_slots; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.appointment_slots WITH (security_invoker='true') AS
 SELECT id,
    date,
    "time",
    barber_id,
    duration_minutes,
    status
   FROM public.appointments;


--
-- Name: barbers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.barbers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    photo_url text,
    bio text,
    active boolean DEFAULT true,
    days_of_week text[] DEFAULT ARRAY['segunda'::text, 'terça'::text, 'quarta'::text, 'quinta'::text, 'sexta'::text, 'sábado'::text],
    start_time text DEFAULT '09:00'::text,
    end_time text DEFAULT '19:00'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: financial_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.financial_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type public.financial_transaction_type NOT NULL,
    category text NOT NULL,
    description text,
    amount numeric(10,2) NOT NULL,
    payment_method text,
    date timestamp with time zone DEFAULT now() NOT NULL,
    appointment_id uuid,
    barber_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    duration_minutes integer DEFAULT 30 NOT NULL,
    price numeric(10,2) NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: shop_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shop_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text DEFAULT 'Barbearia Exclusiva'::text NOT NULL,
    subtitle text DEFAULT 'Cortes de alto nível e atendimento profissional'::text,
    whatsapp text DEFAULT '5511999999999'::text,
    address text DEFAULT 'Rua Principal, 123 - Centro'::text,
    open_time text DEFAULT '09:00'::text,
    close_time text DEFAULT '19:00'::text,
    allow_same_day boolean DEFAULT true,
    slot_interval_minutes integer DEFAULT 30,
    highlight_points text[] DEFAULT ARRAY['Cortes masculinos premium'::text, 'Agendamento online 24h'::text, 'Profissionais experientes'::text, 'Ambiente climatizado'::text],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    working_hours jsonb DEFAULT '{"sexta": {"open": "09:00", "close": "19:00", "closed": false}, "quarta": {"open": "09:00", "close": "19:00", "closed": false}, "quinta": {"open": "09:00", "close": "19:00", "closed": false}, "terça": {"open": "09:00", "close": "19:00", "closed": false}, "domingo": {"open": null, "close": null, "closed": true}, "segunda": {"open": "09:00", "close": "19:00", "closed": false}, "sábado": {"open": "09:00", "close": "18:00", "closed": false}}'::jsonb
);


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.testimonials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_name text NOT NULL,
    text text NOT NULL,
    rating integer DEFAULT 5,
    date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT testimonials_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: barbers barbers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.barbers
    ADD CONSTRAINT barbers_pkey PRIMARY KEY (id);


--
-- Name: financial_transactions financial_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: shop_settings shop_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shop_settings
    ADD CONSTRAINT shop_settings_pkey PRIMARY KEY (id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_appointments_unique_slot; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_appointments_unique_slot ON public.appointments USING btree (barber_id, date, "time") WHERE (status = ANY (ARRAY['Pendente'::public.appointment_status, 'Confirmado'::public.appointment_status]));


--
-- Name: idx_financial_transactions_appointment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_financial_transactions_appointment ON public.financial_transactions USING btree (appointment_id);


--
-- Name: idx_financial_transactions_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_financial_transactions_date ON public.financial_transactions USING btree (date);


--
-- Name: idx_financial_transactions_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_financial_transactions_type ON public.financial_transactions USING btree (type);


--
-- Name: appointments update_appointments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: barbers update_barbers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_barbers_updated_at BEFORE UPDATE ON public.barbers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: financial_transactions update_financial_transactions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON public.financial_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: services update_services_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: shop_settings update_shop_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_shop_settings_updated_at BEFORE UPDATE ON public.shop_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: appointments appointments_barber_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_barber_id_fkey FOREIGN KEY (barber_id) REFERENCES public.barbers(id) ON DELETE SET NULL;


--
-- Name: appointments appointments_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE SET NULL;


--
-- Name: financial_transactions financial_transactions_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE SET NULL;


--
-- Name: financial_transactions financial_transactions_barber_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.financial_transactions
    ADD CONSTRAINT financial_transactions_barber_id_fkey FOREIGN KEY (barber_id) REFERENCES public.barbers(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: barbers Admin can manage all barbers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage all barbers" ON public.barbers TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: services Admin can manage all services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage all services" ON public.services TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: appointments Admin can manage appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage appointments" ON public.appointments TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: financial_transactions Admin can manage financial transactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage financial transactions" ON public.financial_transactions USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: shop_settings Admin can manage shop settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage shop settings" ON public.shop_settings TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: testimonials Admin can manage testimonials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can manage testimonials" ON public.testimonials TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can read all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: appointments Admins can read full appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can read full appointments" ON public.appointments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: appointments Anyone can create appointments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create appointments" ON public.appointments FOR INSERT WITH CHECK (true);


--
-- Name: barbers Anyone can read active barbers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read active barbers" ON public.barbers FOR SELECT USING ((active = true));


--
-- Name: services Anyone can read active services; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read active services" ON public.services FOR SELECT USING ((active = true));


--
-- Name: shop_settings Anyone can read shop settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read shop settings" ON public.shop_settings FOR SELECT USING (true);


--
-- Name: testimonials Anyone can read testimonials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read testimonials" ON public.testimonials FOR SELECT USING (true);


--
-- Name: user_roles Users can read own role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: appointments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

--
-- Name: barbers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;

--
-- Name: financial_transactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

--
-- Name: services; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

--
-- Name: shop_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: testimonials; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


