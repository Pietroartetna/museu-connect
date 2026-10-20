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
