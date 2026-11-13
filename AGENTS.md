<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep museum content routes top-level and wrap them in PublicMuseumLayout so visitors never need a session.
- Gate administration with a database-backed role check in beforeLoad; database RLS remains the authority for all writes.
- Grant anonymous storage reads only for files referenced by published museum content, never avatars or payment proofs.
- Store room subgallery photos in the existing entity_images table with entity_type 'room' and captions, reusing museum media policies and optimization instead of duplicating storage structures.
- Reuse the entity gallery editor and queries for artist photos with entity_type 'artist'; this keeps uploads, captions and access policies consistent with rooms.
- Render content photos through ImageViewer with contained previews and a full-size dialog; disable its trigger inside navigation controls and decorative banners to avoid nested buttons.
- Store editable global copy in site_content and custom published pages in museum_pages; attach existing rooms, artists and galleries through page_id to reuse their administration and media.
- Model subgalleries with galleries.parent_id and reject cyclic ancestry so navigation remains reachable.
- Store contact submissions with insert-only visitor access and admin-only reads; never claim email delivery before verified sending is wired.
- Audioguide stops live in guide_stops/guide_files; QR codes encode the stop id (not its number) so renumbering never breaks printed labels.
