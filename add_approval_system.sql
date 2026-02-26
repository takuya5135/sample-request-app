-- profilesテーブルに承認ステータスを追加 (デフォルトは未承認)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;

-- 既存の全ユーザーを承認済みに変更 (既存ユーザーが締め出されないように)
UPDATE public.profiles SET is_approved = true;

-- 確認用 (省略可能)
-- SELECT id, email, role, is_approved FROM public.profiles;
