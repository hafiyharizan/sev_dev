-- Base data. Real content (posts, speakers, November 2026 schedule) is loaded by Task 11.

insert into public.program_types (name, colour, sort_order, time_mode, anchor_prayer, offset_minutes, fixed_time) values
  ('Kuliah Maghrib',               '#A87BF0', 1, 'prayer', 'maghrib', 0, null),
  ('Kuliah Subuh',                 '#3DDC97', 2, 'prayer', 'subuh',   0, null),
  ('Yassin / Tahlil / Doa Selamat','#D9D9D9', 3, 'prayer', 'maghrib', 0, null),
  ('Si Cilik Mengaji',             '#F2547D', 4, 'prayer', 'maghrib', 0, null),
  ('Kuliah Dhuha',                 '#E3B04B', 5, 'fixed',  null,      0, '09:00');

insert into public.settings (key, value) values
  ('prayer_zone', '"SGR01"'),
  -- placeholder offsets (minutes after azan); the AJK confirm them in Tetapan
  ('iqamah_offsets', '{"subuh":15,"zohor":10,"asar":10,"maghrib":10,"isyak":10}');

insert into public.invites (id) values (1) on conflict (id) do nothing;
