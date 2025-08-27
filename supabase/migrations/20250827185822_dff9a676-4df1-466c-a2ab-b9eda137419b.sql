-- Fix Security Definer View issue - Step 1: Drop dependent policies first

-- Drop policies that depend on the is_verified_healthcare_provider function
DROP POLICY IF EXISTS "Verified healthcare providers can manage assigned patients" ON public.patients;
DROP POLICY IF EXISTS "Verified healthcare providers can manage sessions for assigned patients" ON public.patient_sessions;

-- Drop the problematic secure view
DROP VIEW IF EXISTS public.secure_patient_view;

-- Drop the SECURITY DEFINER function 
DROP FUNCTION IF EXISTS public.is_verified_healthcare_provider(uuid);