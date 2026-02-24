-- 住所録テーブルの姓・名分割マイグレーション

-- 1. 新しいカラムを追加
ALTER TABLE public.address_book
ADD COLUMN last_name text,
ADD COLUMN first_name text;

-- 2. 既存のデータを分割して移行 (スペースで分割)
-- 注意: 既存の連絡先名にスペースがない場合や複数ある場合は適切に分割されない可能性があります。
-- ここでは簡易的に、最初のスペースを区切りとみなすか、スペースがない場合はすべて'姓'として扱います。
UPDATE public.address_book
SET 
  last_name = CASE 
    WHEN strpos(contact_name, ' ') > 0 THEN split_part(contact_name, ' ', 1)
    WHEN strpos(contact_name, '　') > 0 THEN split_part(contact_name, '　', 1)
    ELSE contact_name
  END,
  first_name = CASE 
    WHEN strpos(contact_name, ' ') > 0 THEN substring(contact_name from strpos(contact_name, ' ') + 1)
    WHEN strpos(contact_name, '　') > 0 THEN substring(contact_name from strpos(contact_name, '　') + 1)
    ELSE ''
  END;

-- 3. 新しいカラムに NOT NULL 制約を追加
ALTER TABLE public.address_book
ALTER COLUMN last_name SET NOT NULL,
ALTER COLUMN first_name SET NOT NULL;

-- 4. 古いカラムを削除
ALTER TABLE public.address_book
DROP COLUMN contact_name;
