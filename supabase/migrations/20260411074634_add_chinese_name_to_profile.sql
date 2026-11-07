ALTER TABLE public.profile ADD COLUMN IF NOT EXISTS chinese_name TEXT;
UPDATE public.profile SET chinese_name = '杜得人' WHERE chinese_name IS NULL;;
