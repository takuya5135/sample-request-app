-- 名（first_name）を任意入力に変更するためのマイグレーション

-- 1. first_nameカラムのNOT NULL制約を削除
ALTER TABLE public.address_book
ALTER COLUMN first_name DROP NOT NULL;
