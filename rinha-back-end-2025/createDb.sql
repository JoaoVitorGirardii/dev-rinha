CREATE UNLOGGED TABLE payments (
    correlationId UUID PRIMARY KEY,
    amount DECIMAL NOT NULL,
    requested_at timestamptz NOT null,
    "type" varchar(10) not null 
);

CREATE INDEX payments_requested_at ON payments (requested_at);
