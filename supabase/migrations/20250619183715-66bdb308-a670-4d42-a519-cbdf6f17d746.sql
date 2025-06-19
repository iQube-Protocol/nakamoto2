
-- Add a unique constraint on user_id and service for the user_connections table
-- This will allow the upsert operation to work properly
ALTER TABLE public.user_connections 
ADD CONSTRAINT user_connections_user_id_service_key 
UNIQUE (user_id, service);
