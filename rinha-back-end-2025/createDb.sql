CREATE UNLOGGED TABLE payments (
    correlationId UUID PRIMARY KEY,
    amount DECIMAL NOT NULL,
    requested_at timestamptz NOT null,
    "type" varchar(10) not null 
);

CREATE INDEX payments_requested_at ON payments (requested_at);

CREATE UNLOGGED TABLE health_check (
    id SERIAL PRIMARY KEY,
    failing BOOLEAN NOT NULL,
    requested_at timestamptz NOT null,
    min_response_time int2 not null,
    "type" varchar(10) not null 
);

INSERT INTO health_check
(id, failing, requested_at, min_response_time, "type")
values
(nextval('health_check_id_seq'::regclass), FALSE, CURRENT_DATE, 1, 'DEFAULT'),
(nextval('health_check_id_seq'::regclass), FALSE, CURRENT_DATE, 1, 'FALLBACK');