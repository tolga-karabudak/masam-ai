-- Allow anyone (including anon) to read products (e.g. landing → ürünler)
CREATE POLICY "Products viewable by anyone" ON public.wraith_products
  FOR SELECT USING (true);
