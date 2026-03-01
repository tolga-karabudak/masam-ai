-- Allow anyone (including anon) to read public setups (e.g. for landing page)
CREATE POLICY "Public setups viewable by anyone" ON public.setups
  FOR SELECT USING (is_public = true);
