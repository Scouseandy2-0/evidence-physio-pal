-- Allow users to view their own (non-validated) protocols
DROP POLICY IF EXISTS "Users can view their own protocols" ON public.treatment_protocols;

CREATE POLICY "Users can view their own protocols"
ON public.treatment_protocols
FOR SELECT
USING (auth.uid() = created_by);