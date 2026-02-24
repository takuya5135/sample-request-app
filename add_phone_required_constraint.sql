-- 既存のNULLの電話番号をダミーデータで埋める
UPDATE public.address_book SET phone = '000-0000-0000' WHERE phone IS NULL OR phone = '';

-- phoneカラムにNOT NULL制約を追加
ALTER TABLE public.address_book ALTER COLUMN phone SET NOT NULL;
