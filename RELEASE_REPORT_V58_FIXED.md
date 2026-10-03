# CS2 Analytics V58 — fixed release

## What changed
- Главная: hero переведён на `assets/maps/nuke.png`.
- Главная: нижний бренд `CS2 ANALYTICS` помещён в компактный ограниченный badge, чтобы текст не выползал.
- Админка: браузерный cloud-auth больше не вызывает Edge Function `cs2-admin`.
- Админка: проверка прав идёт через `public.is_cs2_admin()` после Supabase Auth.
- Админка: сохранение изменений идёт через защищённый `public.commit_cs2_state(...)` RPC.
- Логин принимает реальный Supabase email; сохранён также серверный alias через `resolve_cs2_admin_login`.
- Добавлена миграция `20261002_admin_commit_rpc.sql`, разрешающая `authenticated` вызывать commit RPC; сама функция продолжает проверять права администратора.
- Cache-busting обновлён до `20261002`.

## Verification
- `RELEASE_GATE_V57.py`: PASS
- `QA_CHECK.py`: PASS
- `node --check app_v57.js`: PASS
- `node --check supabase_adapter.js`: PASS
- локальная выдача `index.html` через HTTP: PASS
- в локальном adapter отсутствуют `functions.invoke` / Edge Function login path
- в `app_v57.js` нет legacy `ammo19`
- live Supabase: `authenticated` имеет EXECUTE на `commit_cs2_state`; `anon` не имеет EXECUTE.

## Remaining smoke test
Нужен только один пользовательский smoke test: войти реальной Supabase-почтой/паролем и создать тестовую игру. После этого релиз можно публиковать.
