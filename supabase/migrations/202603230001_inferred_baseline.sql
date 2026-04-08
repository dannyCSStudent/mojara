create extension if not exists pgcrypto;

create table if not exists public.markets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  name text not null,
  price numeric(12,2) not null check (price >= 0),
  active boolean not null default true,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_events (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  market_id uuid not null references public.markets(id) on delete cascade,
  event_type text not null check (event_type in ('created', 'manual_adjustment', 'decrement', 'restock', 'availability_change')),
  cause text not null default 'manual_edit' check (cause in ('product_created', 'manual_edit', 'manual_availability', 'order_created', 'order_canceled')),
  reference_order_id uuid references public.orders(id) on delete set null,
  stock_quantity_before integer,
  stock_quantity_after integer,
  change_amount integer,
  is_available_before boolean,
  is_available_after boolean,
  created_at timestamptz not null default now()
);

create table if not exists public.market_subscriptions (
  user_id uuid not null references auth.users(id) on delete cascade,
  market_id uuid not null references public.markets(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, market_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets(id) on delete restrict,
  vendor_id uuid not null references public.vendors(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'canceled', 'refunded')),
  total numeric(12,2) not null default 0 check (total >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  line_total numeric(12,2) not null check (line_total >= 0)
);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event text not null check (event in ('created', 'confirmed', 'canceled', 'refunded_partial', 'refunded_full')),
  amount numeric(12,2),
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  event_type text not null check (event_type in ('price_increase', 'price_decrease')),
  min_severity integer not null default 1 check (min_severity between 1 and 5),
  channel text not null default 'push' check (channel in ('push', 'whatsapp')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid,
  event_type text not null check (event_type in ('price_increase', 'price_decrease')),
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, event_id)
);

create table if not exists public.size_bands (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  sort_order integer not null default 0
);

create table if not exists public.price_signals (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  size_band_id uuid not null references public.size_bands(id) on delete restrict,
  price_per_kg numeric(12,2) not null check (price_per_kg > 0),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.price_agreements (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references public.markets(id) on delete cascade,
  size_band_id uuid not null references public.size_bands(id) on delete restrict,
  reference_price numeric(12,2) not null check (reference_price > 0),
  confidence_score numeric(5,2) not null default 0 check (confidence_score >= 0),
  sample_count integer not null default 0 check (sample_count >= 0),
  status text not null default 'draft' check (status in ('draft', 'locked')),
  valid_from timestamptz not null default now(),
  valid_until timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.price_events (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  market_id uuid references public.markets(id) on delete cascade,
  event_type text not null check (event_type in ('price_increase', 'price_decrease')),
  severity integer default 1 check (severity between 1 and 5),
  processed_at timestamptz,
  failed_at timestamptz,
  retry_count integer not null default 0,
  last_error text,
  created_at timestamptz not null default now()
);

create table if not exists public.dead_letter_events (
  id uuid primary key,
  original_event jsonb not null,
  error text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_vendors_market_id on public.vendors(market_id);
create index if not exists idx_vendors_user_id on public.vendors(user_id);
create index if not exists idx_products_vendor_market on public.products(vendor_id, market_id);
create index if not exists idx_inventory_events_product_created on public.inventory_events(product_id, created_at desc);
create index if not exists idx_orders_user_created on public.orders(user_id, created_at desc);
create index if not exists idx_orders_vendor_created on public.orders(vendor_id, created_at desc);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_notification_subscriptions_match on public.notification_subscriptions(vendor_id, event_type, active);
create unique index if not exists idx_notification_subscriptions_unique_preference
on public.notification_subscriptions(user_id, vendor_id, event_type, min_severity, channel);
create index if not exists idx_notifications_user_created on public.notifications(user_id, created_at desc);
create index if not exists idx_notifications_user_unread on public.notifications(user_id) where read_at is null;
create index if not exists idx_price_signals_market_size on public.price_signals(market_id, size_band_id);
create index if not exists idx_price_agreements_market_size_status on public.price_agreements(market_id, size_band_id, status);
create index if not exists idx_price_events_processed_created on public.price_events(processed_at, created_at);

create or replace view public.active_price_agreements as
select
  pa.market_id,
  pa.size_band_id,
  pa.reference_price,
  pa.confidence_score,
  pa.sample_count,
  pa.valid_from,
  pa.valid_until
from public.price_agreements pa
where pa.status = 'locked'
  and pa.valid_from <= now()
  and pa.valid_until >= now();

create or replace view public.price_agreement_explain as
select
  pa.market_id,
  sb.label as size_band,
  pa.reference_price,
  pa.confidence_score,
  pa.sample_count,
  pa.status,
  pa.valid_from,
  pa.valid_until,
  pa.created_at
from public.price_agreements pa
join public.size_bands sb on sb.id = pa.size_band_id;

create or replace function public.decrement_product_inventory(
  p_product_id uuid,
  p_vendor_id uuid,
  p_market_id uuid,
  p_quantity integer
)
returns setof public.products
language plpgsql
as $$
begin
  return query
  update public.products
  set stock_quantity = stock_quantity - p_quantity,
      is_available = case when stock_quantity - p_quantity > 0 then is_available else false end
  where id = p_product_id
    and vendor_id = p_vendor_id
    and market_id = p_market_id
    and stock_quantity >= p_quantity
  returning *;
end;
$$;

create or replace function public.log_inventory_event()
returns trigger
language plpgsql
as $$
declare
  v_event_type text;
  v_cause text;
  v_reference_order_id uuid;
begin
  v_cause := current_setting('app.inventory_event_cause', true);
  if v_cause is null or v_cause = '' then
    v_cause := 'manual_edit';
  end if;

  if current_setting('app.inventory_reference_order_id', true) is not null
     and current_setting('app.inventory_reference_order_id', true) <> '' then
    v_reference_order_id := current_setting('app.inventory_reference_order_id', true)::uuid;
  end if;

  if tg_op = 'INSERT' then
    insert into public.inventory_events (
      product_id,
      vendor_id,
      market_id,
      event_type,
      cause,
      stock_quantity_after,
      change_amount,
      is_available_after
    )
    values (
      new.id,
      new.vendor_id,
      new.market_id,
      'created',
      'product_created',
      new.stock_quantity,
      new.stock_quantity,
      new.is_available
    );

    return new;
  end if;

  if new.stock_quantity = old.stock_quantity
     and new.is_available is not distinct from old.is_available then
    return new;
  end if;

  if new.stock_quantity < old.stock_quantity then
    v_event_type := 'decrement';
  elsif new.stock_quantity > old.stock_quantity then
    if v_cause = 'order_canceled' then
      v_event_type := 'restock';
    elsif old.stock_quantity = 0 then
      v_event_type := 'restock';
    else
      v_event_type := 'manual_adjustment';
    end if;
  else
    v_event_type := 'availability_change';
    if v_cause = 'manual_edit' then
      v_cause := 'manual_availability';
    end if;
  end if;

  insert into public.inventory_events (
    product_id,
    vendor_id,
    market_id,
    event_type,
    cause,
    reference_order_id,
    stock_quantity_before,
    stock_quantity_after,
    change_amount,
    is_available_before,
    is_available_after
  )
  values (
    new.id,
    new.vendor_id,
    new.market_id,
    v_event_type,
    v_cause,
    v_reference_order_id,
    old.stock_quantity,
    new.stock_quantity,
    coalesce(new.stock_quantity, 0) - coalesce(old.stock_quantity, 0),
    old.is_available,
    new.is_available
  );

  return new;
end;
$$;

create or replace function public.create_order_atomic(
  p_market_id uuid,
  p_vendor_id uuid,
  p_customer_id uuid,
  p_items jsonb
)
returns public.orders
language plpgsql
as $$
declare
  v_order public.orders;
  v_item jsonb;
  v_product public.products;
  v_total numeric(12,2) := 0;
begin
  if jsonb_array_length(coalesce(p_items, '[]'::jsonb)) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  insert into public.orders (market_id, vendor_id, user_id)
  values (p_market_id, p_vendor_id, p_customer_id)
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select *
    into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid
      and vendor_id = p_vendor_id
      and market_id = p_market_id
      and active = true
      and is_available = true
    for update;

    if not found then
      raise exception 'Product not found or unavailable';
    end if;

    if v_product.stock_quantity < (v_item ->> 'quantity')::integer then
      raise exception 'Insufficient stock';
    end if;

    perform set_config('app.inventory_event_cause', 'order_created', true);
    perform set_config('app.inventory_reference_order_id', v_order.id::text, true);
    update public.products
    set stock_quantity = stock_quantity - (v_item ->> 'quantity')::integer,
        is_available = case
          when stock_quantity - (v_item ->> 'quantity')::integer > 0 then is_available
          else false
        end
    where id = v_product.id;

    insert into public.order_items (
      order_id,
      product_id,
      quantity,
      unit_price,
      line_total
    )
    values (
      v_order.id,
      v_product.id,
      (v_item ->> 'quantity')::integer,
      v_product.price,
      v_product.price * (v_item ->> 'quantity')::integer
    );

    v_total := v_total + (v_product.price * (v_item ->> 'quantity')::integer);
  end loop;

  update public.orders
  set total = v_total
  where id = v_order.id
  returning * into v_order;

  insert into public.order_events (order_id, event)
  values (v_order.id, 'created');

  return v_order;
end;
$$;

create or replace function public.confirm_order_atomic(
  p_order_id uuid,
  p_vendor_id uuid
)
returns public.orders
language plpgsql
as $$
declare
  v_order public.orders;
begin
  update public.orders
  set status = 'confirmed'
  where id = p_order_id
    and vendor_id = p_vendor_id
    and status = 'pending'
  returning * into v_order;

  if not found then
    raise exception 'Invalid order status transition';
  end if;

  insert into public.order_events (order_id, event)
  values (p_order_id, 'confirmed');

  return v_order;
end;
$$;

create or replace function public.cancel_order_atomic(
  p_order_id uuid,
  p_vendor_id uuid
)
returns public.orders
language plpgsql
as $$
declare
  v_order public.orders;
  v_item record;
begin
  update public.orders
  set status = 'canceled'
  where id = p_order_id
    and vendor_id = p_vendor_id
    and status = 'pending'
  returning * into v_order;

  if not found then
    raise exception 'Invalid order status transition';
  end if;

  for v_item in
    select product_id, quantity
    from public.order_items
    where order_id = p_order_id
  loop
    perform set_config('app.inventory_event_cause', 'order_canceled', true);
    perform set_config('app.inventory_reference_order_id', p_order_id::text, true);
    update public.products
    set stock_quantity = stock_quantity + v_item.quantity,
        is_available = true
    where id = v_item.product_id;
  end loop;

  insert into public.order_events (order_id, event)
  values (p_order_id, 'canceled');

  return v_order;
end;
$$;

create or replace function public.refund_order_atomic(
  p_order_id uuid,
  p_amount numeric,
  p_reason text,
  p_vendor_id uuid
)
returns public.orders
language plpgsql
as $$
declare
  v_order public.orders;
  v_refunded_total numeric(12,2);
  v_event text;
begin
  if p_amount <= 0 then
    raise exception 'Refund amount must be greater than zero';
  end if;

  select *
  into v_order
  from public.orders
  where id = p_order_id
    and vendor_id = p_vendor_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if v_order.status not in ('confirmed', 'refunded') then
    raise exception 'Invalid order status transition';
  end if;

  select coalesce(sum(amount), 0)
  into v_refunded_total
  from public.refunds
  where order_id = p_order_id;

  if v_refunded_total + p_amount > v_order.total then
    raise exception 'Refund exceeds order total';
  end if;

  insert into public.refunds (order_id, amount, reason)
  values (p_order_id, p_amount, p_reason);

  if v_refunded_total + p_amount = v_order.total then
    update public.orders
    set status = 'refunded'
    where id = p_order_id
    returning * into v_order;
    v_event := 'refunded_full';
  else
    v_event := 'refunded_partial';
  end if;

  insert into public.order_events (order_id, event, amount, reason)
  values (p_order_id, v_event, p_amount, p_reason);

  return v_order;
end;
$$;

create or replace function public.orders_summary_by_scope(
  scope_column text,
  scope_value uuid
)
returns table (
  total_orders bigint,
  pending bigint,
  confirmed bigint,
  canceled bigint,
  total_revenue numeric
)
language plpgsql
as $$
begin
  if scope_column not in ('vendor_id', 'user_id') then
    raise exception 'Unsupported scope column';
  end if;

  return query execute format(
    $sql$
      select
        count(*) as total_orders,
        count(*) filter (where status = 'pending') as pending,
        count(*) filter (where status = 'confirmed') as confirmed,
        count(*) filter (where status = 'canceled') as canceled,
        coalesce(sum(total) filter (where status in ('confirmed', 'refunded')), 0) as total_revenue
      from public.orders
      where %I = $1
    $sql$,
    scope_column
  ) using scope_value;
end;
$$;

create or replace function public.notify_price_event()
returns trigger
language plpgsql
as $$
begin
  perform pg_notify('price_event_channel', new.id::text);
  return new;
end;
$$;

drop trigger if exists trg_notify_price_event on public.price_events;
drop trigger if exists trg_log_inventory_event on public.products;

create trigger trg_notify_price_event
after insert on public.price_events
for each row
execute function public.notify_price_event();

create trigger trg_log_inventory_event
after insert or update on public.products
for each row
execute function public.log_inventory_event();

comment on schema public is 'Application schema baseline inferred from repository code on 2026-03-23.';
