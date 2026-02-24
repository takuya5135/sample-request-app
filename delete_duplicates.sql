delete from public.address_book 
where id in (
  select id from public.address_book 
  where company_name = '旭食品株式会社' 
    and department = '京都支店' 
    and contact_name = '木村様' 
  order by created_at desc 
  limit 2
);
