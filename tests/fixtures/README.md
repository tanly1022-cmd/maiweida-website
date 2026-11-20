# Historical catalog integrity snapshots

These fixtures retain only the record identifiers, public model/image paths and SHA-256 digests required by the category and image regression tests. They are reduced from the original category-mapping and product-image extraction manifests, which remain local. They are outside public/ and are not imported by website code.

Do not regenerate them from current product data to make a failing test pass. When an intentional catalog correction changes a tested value, verify it against the original catalog and update only the reviewed baseline entries.
