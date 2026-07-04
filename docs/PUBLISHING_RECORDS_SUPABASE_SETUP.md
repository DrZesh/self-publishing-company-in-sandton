# Publishing Records and Services on Supabase

This phase migrates the Author Library, Book Library, Client Collections and Services pricing catalogue to Supabase while preserving the existing admin user interface contracts.

## Database migrations

Apply migrations through:

```text
202607040021_services_catalogue.sql
```

The phase adds:

- `public.authors`
- `public.book_records`
- `public.collection_signatures`
- `public.services`

All tables use admin-only Row Level Security policies.

## Author Library

Route:

```text
/admin/authors
```

The Author Library stores profile details, contact linkage, pen names, marketing permissions, testimonials, VIP status, reprint history, services used and tags.

Book titles linked through `book_records.author_id` are synchronized into `authors.books_published` by a database trigger.

## Book Library

Route:

```text
/admin/books
```

The Book Library stores author and project linkage, genre, services provided, print specifications, final file references, reprint counts and completion status.

Private file references use the existing Supabase Storage buckets and are hydrated to short-lived signed URLs by the compatibility bridge.

## Client Collections

Route:

```text
/admin/collections
```

Collection signatures are stored in the private `signature-artifacts` bucket. The collection record stores the linked Project and Contact, collector details, quantity, collection date, payment state, staff member and notes.

Creating a collection record advances the linked Project to `Delivered` when the project has not already progressed beyond that stage.

## Services catalogue

Route:

```text
/admin/services
```

The database uses conventional snake_case columns while the compatibility adapter preserves the existing camelCase UI contract.

Examples:

```text
serviceName        -> service_name
pricingType        -> pricing_type
basePrice          -> base_price
bookSizeCondition  -> book_size_condition
pageCountMin       -> page_count_min
copyQuantityMax    -> copy_quantity_max
```

## Functional verification

### Authors

1. Create an Author.
2. Edit contact details and VIP settings.
3. Add a Book Record linked to the Author.
4. Confirm the Author book count and linked title data update.
5. Delete or reassign the Book Record and confirm synchronization remains correct.

### Books

1. Create and edit a Book Record.
2. Confirm numeric year and reprint fields save correctly.
3. Confirm genre filtering and title search.
4. Confirm linked private assets open through signed URLs when present.

### Collections

1. Move a Project to `Ready for Collection`.
2. Open `/admin/collections` and record a collection.
3. Draw a signature and save the record.
4. Confirm the signature image opens from the collection table.
5. Confirm the Project advances to `Delivered`.

### Services

1. Create fixed and unit-based services.
2. Edit price, quantity and range fields.
3. Toggle service active state.
4. Filter by category and search by service name.
5. Confirm the existing UI field names map correctly to Supabase columns.
