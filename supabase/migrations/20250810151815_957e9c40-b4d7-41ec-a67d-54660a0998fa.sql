-- Enable real-time for persona tables
ALTER TABLE public.knyt_personas REPLICA IDENTITY FULL;
ALTER TABLE public.qrypto_personas REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.knyt_personas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.qrypto_personas;