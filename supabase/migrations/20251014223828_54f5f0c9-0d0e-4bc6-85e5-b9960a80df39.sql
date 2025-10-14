-- Add DELETE policy for treatment_protocols
-- Allow users to delete their own protocols
CREATE POLICY "Users can delete their own protocols"
ON treatment_protocols
FOR DELETE
USING (auth.uid() = created_by);